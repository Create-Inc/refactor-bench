import sql from "@/app/api/utils/sql";
import {
  MODEL_ENDPOINTS,
  COMMAND_SCHEMA,
  MAX_CONTINUATIONS,
  CONTINUATION_PROMPT_TEMPLATE,
} from "./constants";
import { buildSystemPrompt } from "./systemPrompt";
import {
  buildConversationMessages,
  buildConversationSummary,
  saveConversation,
} from "./conversationHistory";
import { callAI } from "./aiClient";
import {
  extractJSON,
  isTruncated,
  mergeResponses,
  resolveFileReferences,
} from "./helpers";
import {
  buildFilesContext,
  buildExecutePlanInstruction,
} from "./contextBuilder";
import { processCommands } from "./commandProcessor";
import { fetchSupabaseInfo } from "./supabaseInfo";

export async function handleCodeMode(
  userId,
  projectId,
  instruction,
  model,
  executePlan,
  planSteps,
  projectCheck,
  existingFiles,
  conversationHistory,
  userCredits,
) {
  if (projectCheck.length === 0) {
    return {
      error: true,
      status: 404,
      data: { error: "Project not found" },
    };
  }

  var projectName = projectCheck[0].name || "Untitled";

  var supabaseConnected = false;
  var supabaseTablesInfo = "";
  var projRow = projectCheck[0];
  if (projRow.supabase_url && projRow.supabase_anon_key) {
    supabaseConnected = true;
    supabaseTablesInfo = await fetchSupabaseInfo(
      projectId,
      projRow.supabase_url,
      projRow.supabase_anon_key,
    );
  }

  var resolved = resolveFileReferences(instruction, existingFiles);

  var referencedPaths = {};
  for (var ri2 = 0; ri2 < resolved.referencedFiles.length; ri2++) {
    referencedPaths[resolved.referencedFiles[ri2].path] = true;
  }

  var filesContext = buildFilesContext(existingFiles, referencedPaths);

  var convSummary = buildConversationSummary(conversationHistory);

  var systemPrompt = buildSystemPrompt(projectName, existingFiles, convSummary);

  var finalInstruction = resolved.instruction;
  if (executePlan && planSteps) {
    finalInstruction = buildExecutePlanInstruction(
      planSteps,
      resolved.instruction,
    );
  }

  var userMessage =
    "=== EXISTING PROJECT FILES ===\n" +
    filesContext +
    "\n\n=== END OF FILES ===" +
    supabaseTablesInfo +
    "\n\n" +
    "USER REQUEST:\n" +
    finalInstruction +
    "\n\nRemember: Deliver a COMPLETE, WORKING result. Every button must work. Every screen must have content. Use demo data if needed. Make it look polished.";

  var codeModel = model === "claude" ? "claude" : "gpt4";
  var codeEndpoint = MODEL_ENDPOINTS[codeModel];

  var codeMessages = [{ role: "system", content: systemPrompt }];

  var codeHistMsgs = buildConversationMessages(conversationHistory);
  var recentHist = codeHistMsgs.slice(-6);
  for (var rhi = 0; rhi < recentHist.length; rhi++) {
    codeMessages.push(recentHist[rhi]);
  }

  codeMessages.push({ role: "user", content: userMessage });

  var codeResult = await callAI(
    codeEndpoint,
    codeMessages,
    codeModel,
    COMMAND_SCHEMA,
  );
  if (codeResult.error) {
    return {
      error: true,
      status: 502,
      data: { error: "AI service temporarily unavailable." },
    };
  }

  var rawContent = codeResult.rawContent;
  if (!rawContent) {
    return {
      error: true,
      status: 500,
      data: { error: "AI returned an empty response." },
    };
  }

  var parsed = extractJSON(rawContent);
  var continuationCount = 0;
  while (
    !parsed &&
    isTruncated(rawContent) &&
    continuationCount < MAX_CONTINUATIONS
  ) {
    continuationCount++;
    var tailLen = Math.min(rawContent.length, 2000);
    var contPrompt = CONTINUATION_PROMPT_TEMPLATE.replace(
      "__PARTIAL__",
      rawContent.substring(rawContent.length - tailLen),
    );
    var contResult = await callAI(
      codeEndpoint,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
        { role: "assistant", content: rawContent },
        { role: "user", content: contPrompt },
      ],
      codeModel,
      null,
    );
    if (contResult.error || !contResult.rawContent) break;
    parsed = mergeResponses(rawContent, contResult.rawContent);
    if (parsed) break;
    rawContent = rawContent + contResult.rawContent;
    parsed = extractJSON(rawContent);
    if (parsed) break;
  }

  if (!parsed) {
    console.error("Failed to parse:", rawContent.substring(0, 500));
    return {
      error: true,
      status: 500,
      data: { error: "AI returned an incomplete response. Try rephrasing." },
    };
  }

  await saveConversation(projectId, "user", instruction, codeModel, 0);

  if (parsed.mode === "plan" && parsed.plan) {
    var planExplanation = parsed.explanation || "Here's the plan.";
    await saveConversation(
      projectId,
      "assistant",
      "[PLAN] " + planExplanation,
      codeModel,
      0,
    );

    return {
      error: false,
      data: {
        success: true,
        mode: "plan",
        plan: parsed.plan,
        explanation: planExplanation,
        creditsUsed: 0,
        remainingCredits: userCredits,
        model: codeModel,
        continuations: continuationCount,
      },
    };
  }

  var commands = parsed.commands || [];
  var explanation = parsed.explanation || "Done.";

  if (commands.length === 0) {
    await saveConversation(projectId, "assistant", explanation, codeModel, 0);
    return {
      error: false,
      data: {
        success: true,
        mode: "code",
        results: [],
        explanation: explanation,
        creditsUsed: 0,
        remainingCredits: userCredits,
        model: codeModel,
        continuations: continuationCount,
      },
    };
  }

  var processResult = await processCommands(commands, projectId);
  var results = processResult.results;
  var diffResults = processResult.diffResults;
  var totalLines = processResult.totalLines;

  var baseCost = Math.max(totalLines * 10, 10);
  var continuationCost = continuationCount * 50;
  var creditsNeeded = baseCost + continuationCost;
  if (userCredits < creditsNeeded) {
    return {
      error: true,
      status: 402,
      data: {
        error: "Insufficient credits.",
        needed: creditsNeeded,
        available: userCredits,
      },
    };
  }

  var codeDeduct = await sql(
    `UPDATE auth_users SET credits = credits - $1 WHERE id = $2 AND credits >= $1 RETURNING credits`,
    [creditsNeeded, userId],
  );
  if (codeDeduct.length === 0) {
    return {
      error: true,
      status: 402,
      data: { error: "Insufficient credits.", needed: creditsNeeded },
    };
  }

  var logAction = instruction.substring(0, 100);

  var assistantSummary =
    explanation +
    " | Files: " +
    results
      .filter(function (r) {
        return r.success;
      })
      .map(function (r) {
        return r.action + " " + r.path;
      })
      .join(", ");

  /* Run all post-execution writes in parallel */
  await Promise.all([
    sql`INSERT INTO activity_log (user_id, project_id, action, credits_used) VALUES (${userId}, ${projectId}, ${logAction}, ${creditsNeeded})`,
    sql`UPDATE projects SET updated_at = NOW() WHERE id = ${projectId}`,
    saveConversation(
      projectId,
      "assistant",
      assistantSummary,
      codeModel,
      creditsNeeded,
    ),
  ]);

  return {
    error: false,
    data: {
      success: true,
      mode: "code",
      results: results,
      explanation: explanation,
      creditsUsed: creditsNeeded,
      remainingCredits: codeDeduct[0].credits,
      model: codeModel,
      continuations: continuationCount,
      diffResults: diffResults.length > 0 ? diffResults : undefined,
    },
  };
}
