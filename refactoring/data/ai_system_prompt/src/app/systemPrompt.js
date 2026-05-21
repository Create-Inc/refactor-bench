const DEFAULT_PROJECT_NAME = "Untitled";

const COMMAND_SCHEMA =
  '{"mode":"execute","commands":[{"type":"create|edit|delete|move|diff","path":"file.ext","content":"...","summary":"..."}],"explanation":"What was done"}';

const PLAN_SCHEMA =
  '{"mode":"plan","plan":{"title":"Plan title","steps":[{"step":1,"action":"create|edit|delete|move","path":"file.ext","description":"What this step does"}]},"explanation":"Overview of the plan"}';

function appendSection(lines, title, body) {
  lines.push(`=== ${title} ===`);
  if (Array.isArray(body)) {
    lines.push(...body);
  } else {
    lines.push(body);
  }
  lines.push("");
}

function countLines(content) {
  return String(content || "").split("\n").length;
}

function appendFileMap(lines, fileList) {
  if (!Array.isArray(fileList) || fileList.length === 0) {
    return;
  }

  appendSection(
    lines,
    "PROJECT FILE MAP",
    fileList.map((file) => `${file.path} (${countLines(file.content)} lines)`)
  );
}

export function buildSystemPrompt(projectName, fileList, conversationSummary) {
  const lines = [
    "You are ExampleBuild Assistant, a coding assistant for a synthetic benchmark fixture.",
    `Project: ${projectName || DEFAULT_PROJECT_NAME}`,
    "",
  ];

  if (conversationSummary) {
    appendSection(lines, "CONVERSATION CONTEXT", conversationSummary);
  }

  appendFileMap(lines, fileList);

  appendSection(lines, "RESPONSE FORMAT", [
    "Return only valid JSON.",
    "Use planning mode when the request is ambiguous or spans several files.",
    "Use execute mode when the requested change is direct.",
  ]);

  appendSection(lines, "PLANNING MODE", PLAN_SCHEMA);
  appendSection(lines, "EXECUTE MODE", COMMAND_SCHEMA);

  appendSection(lines, "COMMAND TYPES", [
    '"create" writes a new file with full content.',
    '"edit" replaces an existing file with full content.',
    '"diff" applies a small targeted patch.',
    '"delete" removes a file.',
    '"move" renames a file.',
  ]);

  appendSection(lines, "DIFF FORMAT", [
    "Use @@FIND, @@REPLACE, and @@END blocks for replacements.",
    "Use @@AFTER, @@INSERT, and @@END blocks for insertions.",
    "Keep enough context for each match to be unique.",
  ]);

  appendSection(lines, "APP COMPLETENESS", [
    "Build complete working app examples, not empty shells.",
    "Every button has a working click handler.",
    "Include useful empty, loading, and error states where applicable.",
    "Persist simple local data with localStorage when a demo app needs state.",
  ]);

  appendSection(lines, "APP TEMPLATES", [
    "Note-Taking App: note list, editor, create, delete, search, and persistence.",
    "Todo/Task App: add, complete, delete, filter, count, and persistence.",
    "Landing Page: hero, feature grid, pricing, FAQ, and footer.",
    "Calculator: display, operators, decimal point, clear, history, and keyboard support.",
    "Dashboard: stat cards, chart area, table, and navigation.",
  ]);

  appendSection(lines, "CODE QUALITY", [
    "Use semantic HTML and accessible labels.",
    "Ensure visible focus states and sufficient contrast.",
    "Prefer simple, responsive layouts.",
    "Keep JavaScript clear and avoid unused code.",
  ]);

  appendSection(lines, "FINAL CHECKLIST", [
    "All referenced files are included.",
    "Every interactive element has behavior.",
    "The result can run without hidden dependencies.",
  ]);

  return lines.join("\n");
}
