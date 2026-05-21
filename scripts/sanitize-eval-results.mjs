#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const DEFAULT_INPUT_DIR = "raw-eval-results";
const DEFAULT_OUTPUT_DIR = "data/eval-results";

const inputDir = process.argv[2] ?? DEFAULT_INPUT_DIR;
const outputDir = process.argv[3] ?? DEFAULT_OUTPUT_DIR;

const SCORE_NAMES = {
  reported: "Refactoring Marked as Successful",
  passes: "Passes Tests",
  nonTrivial: "Non Triviality",
  compiled: "Files Compiled",
  cost: "Refactoring Cost",
};

const MODEL_LABELS = {
  "anthropic-sonnet-4.6": "Sonnet 4.6",
  "anthropic-opus-4.6": "Opus 4.6",
  "anthropic-opus-4.7": "Opus 4.7",
  "google-2.0-flash": "Gemini 2.0 Flash",
  "google-2.5-flash": "Gemini 2.5 Flash",
  "google-2.5-pro": "Gemini 2.5 Pro",
  "google-3.0-pro": "Gemini 3.0 Pro",
};

const MODEL_ORDER = [
  "anthropic-sonnet-4.6",
  "anthropic-opus-4.6",
  "anthropic-opus-4.7",
  "google-2.0-flash",
  "google-2.5-flash",
  "google-2.5-pro",
  "google-3.0-pro",
];

function readJson(filePath) {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    if (!text.trim()) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (!/[",\n\r]/.test(stringValue)) return stringValue;
  return `"${stringValue.replaceAll('"', '""')}"`;
}

function writeCsv(filePath, rows, columns) {
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

function parseTestRunner(experimentName) {
  return experimentName.match(/test-runner:(on|off)/)?.[1] ?? null;
}

function scoreByName(scores, resultId) {
  const byName = {};
  for (const score of scores) {
    if (score.resultId === resultId) {
      byName[score.name] = score;
    }
  }
  return byName;
}

function boolScore(score) {
  if (!score) return null;
  return Number(score.score) > 0 ? 1 : 0;
}

function stableMessage(score) {
  const message = score?.metadata?.message;
  return typeof message === "string" ? message : "";
}

function classifyFailure(row) {
  if (row.passes_tests === 1) return "Passed";
  if (row.agent_reported_success !== 1) return "Reported non-success";
  if (row.non_triviality === 0) return "Non-triviality failure";

  const message = row._passes_tests_message.toLowerCase();
  const compiledMessage = row._files_compiled_message.toLowerCase();
  const combined = `${message}\n${compiledMessage}`;

  if (
    /syntaxerror|parse error|failed to parse|unexpected token|unterminated|string literal|expression expected|expected .* but found/.test(
      combined,
    )
  ) {
    return "Syntax or parse failure";
  }
  if (
    /cannot find module|failed to resolve import|does not provide an export|no exported member|module not found|imported module|export .* was not found/.test(
      combined,
    )
  ) {
    return "Module import/export failure";
  }
  if (
    /unable to find|testinglibraryelementerror|getby|queryby|role|text content|expected element|document body|rendered html|to be in the document|accessible name/.test(
      combined,
    )
  ) {
    return "DOM/query/UI mismatch";
  }
  if (/referenceerror|typeerror|is not a function|cannot read properties|cannot access .* before initialization/.test(combined)) {
    return "Runtime reference/type error";
  }
  if (/assertionerror|expected .* to|received|to equal|to contain|to have/.test(combined)) {
    return "Assertion-level behavior mismatch";
  }
  return "Other hidden-test failure";
}

function normalizeResult(fileName, experiment, result, scores) {
  const byName = scoreByName(scores, result.id);
  const costScore = byName[SCORE_NAMES.cost];
  const nonTrivialityScore = byName[SCORE_NAMES.nonTrivial];
  const compiledScore = byName[SCORE_NAMES.compiled];
  const reportedScore = byName[SCORE_NAMES.reported];
  const passesScore = byName[SCORE_NAMES.passes];
  const testRunner = parseTestRunner(experiment.experimentName ?? "");

  const row = {
    model_provider: experiment.portkeyProvider,
    model: MODEL_LABELS[experiment.portkeyProvider] ?? experiment.portkeyProvider,
    test_runner: testRunner === "on" ? "Enabled" : "Disabled",
    test_runner_raw: testRunner,
    fixture: result.testName,
    result_id: result.id,
    experiment_id: result.experimentId,
    experiment_name: experiment.experimentName,
    experiment_status: experiment.status,
    source_export: fileName,
    result_created_at: result.createdAt,
    duration_ms: result.durationMs,
    duration_min: result.durationMs == null ? null : Number((result.durationMs / 60000).toFixed(4)),
    agent_reported_success: boolScore(reportedScore),
    passes_tests: boolScore(passesScore),
    non_triviality: boolScore(nonTrivialityScore),
    files_compiled: compiledScore?.score ?? null,
    refactoring_cost_usd: costScore?.metadata?.costInDollars ?? costScore?.score ?? null,
    prompt_tokens: costScore?.metadata?.tokenUsage?.promptTokens ?? null,
    completion_tokens: costScore?.metadata?.tokenUsage?.completionTokens ?? null,
    files_before: nonTrivialityScore?.metadata?.numberOfFilesBefore ?? null,
    files_after: nonTrivialityScore?.metadata?.numberOfFiles ?? compiledScore?.metadata?.totalFiles ?? null,
    total_files_compiled: compiledScore?.metadata?.totalFiles ?? null,
    synthetic_terminal_failure: Boolean(experiment.metadata?.syntheticTerminalFailure),
    _passes_tests_message: stableMessage(passesScore),
    _files_compiled_message: stableMessage(compiledScore),
  };

  row.failure_bucket = classifyFailure(row);
  delete row._passes_tests_message;
  delete row._files_compiled_message;
  return row;
}

function compareRows(a, b) {
  const modelDelta = MODEL_ORDER.indexOf(a.model_provider) - MODEL_ORDER.indexOf(b.model_provider);
  if (modelDelta !== 0) return modelDelta;
  if (a.test_runner_raw !== b.test_runner_raw) return a.test_runner_raw === "on" ? -1 : 1;
  return a.fixture.localeCompare(b.fixture);
}

function wilson(successes, n) {
  const z = 1.959963984540054;
  const p = successes / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [center - half, center + half];
}

function summarize(rows) {
  const byCondition = new Map();
  for (const row of rows) {
    const key = `${row.model_provider}|${row.test_runner_raw}`;
    if (!byCondition.has(key)) byCondition.set(key, []);
    byCondition.get(key).push(row);
  }

  const summaries = [];
  for (const conditionRows of byCondition.values()) {
    const first = conditionRows[0];
    const n = conditionRows.length;
    const passes = conditionRows.filter((row) => row.passes_tests === 1).length;
    const reported = conditionRows.filter((row) => row.agent_reported_success === 1).length;
    const falseConfidence = conditionRows.filter(
      (row) => row.agent_reported_success === 1 && row.passes_tests !== 1,
    ).length;
    const notReportedAndFailed = conditionRows.filter(
      (row) => row.agent_reported_success !== 1 && row.passes_tests !== 1,
    ).length;
    const totalCost = conditionRows.reduce((sum, row) => sum + Number(row.refactoring_cost_usd ?? 0), 0);
    const totalDuration = conditionRows.reduce((sum, row) => sum + Number(row.duration_ms ?? 0), 0);
    const [ciLow, ciHigh] = wilson(passes, n);

    summaries.push({
      model_provider: first.model_provider,
      model: first.model,
      test_runner: first.test_runner,
      test_runner_raw: first.test_runner_raw,
      fixtures: n,
      passes_tests: passes,
      pass_rate: Number((passes / n).toFixed(4)),
      pass_rate_ci95_low: Number(ciLow.toFixed(4)),
      pass_rate_ci95_high: Number(ciHigh.toFixed(4)),
      agent_reported_success: reported,
      false_confidence_count: falseConfidence,
      false_confidence_rate: reported === 0 ? null : Number((falseConfidence / reported).toFixed(4)),
      agent_not_successful: n - reported,
      terminal_hidden_test_failures: notReportedAndFailed,
      avg_duration_min: Number((totalDuration / n / 60000).toFixed(4)),
      total_cost_usd: Number(totalCost.toFixed(4)),
      avg_cost_usd: Number((totalCost / n).toFixed(4)),
    });
  }
  return summaries.sort(compareRows);
}

const files = fs.existsSync(inputDir)
  ? fs.readdirSync(inputDir).filter((file) => file.endsWith(".json")).sort()
  : [];

const allRows = [];
const manifest = [];
for (const fileName of files) {
  const filePath = path.join(inputDir, fileName);
  const payload = readJson(filePath);
  if (!payload) continue;
  const experiment = payload.experiments?.[0];
  if (!experiment?.portkeyProvider || !parseTestRunner(experiment.experimentName ?? "")) continue;
  const results = payload.results ?? [];
  const scores = payload.scores ?? [];
  manifest.push({
    source_export: fileName,
    experiment_id: experiment.id,
    experiment_name: experiment.experimentName,
    experiment_status: experiment.status,
    model_provider: experiment.portkeyProvider,
    test_runner: parseTestRunner(experiment.experimentName),
    result_count: results.length,
    score_count: scores.length,
    synthetic_terminal_failure: Boolean(experiment.metadata?.syntheticTerminalFailure),
  });
  for (const result of results) {
    allRows.push(normalizeResult(fileName, experiment, result, scores));
  }
}

const latestByConditionFixture = new Map();
for (const row of allRows) {
  const key = `${row.model_provider}|${row.test_runner_raw}|${row.fixture}`;
  const old = latestByConditionFixture.get(key);
  if (!old || new Date(row.result_created_at) > new Date(old.result_created_at)) {
    latestByConditionFixture.set(key, row);
  }
}

const finalRows = [...latestByConditionFixture.values()]
  .filter((row) => MODEL_ORDER.includes(row.model_provider))
  .sort(compareRows);

fs.mkdirSync(outputDir, { recursive: true });

const perFixtureColumns = [
  "model_provider",
  "model",
  "test_runner",
  "fixture",
  "passes_tests",
  "agent_reported_success",
  "non_triviality",
  "files_compiled",
  "failure_bucket",
  "duration_ms",
  "duration_min",
  "refactoring_cost_usd",
  "prompt_tokens",
  "completion_tokens",
  "files_before",
  "files_after",
  "total_files_compiled",
  "synthetic_terminal_failure",
  "source_export",
  "experiment_id",
  "result_id",
  "result_created_at",
];

const summaryColumns = [
  "model_provider",
  "model",
  "test_runner",
  "fixtures",
  "passes_tests",
  "pass_rate",
  "pass_rate_ci95_low",
  "pass_rate_ci95_high",
  "agent_reported_success",
  "false_confidence_count",
  "false_confidence_rate",
  "agent_not_successful",
  "terminal_hidden_test_failures",
  "avg_duration_min",
  "avg_cost_usd",
  "total_cost_usd",
];

const summaries = summarize(finalRows);
writeCsv(path.join(outputDir, "refactorbench_js_full_run_per_fixture.csv"), finalRows, perFixtureColumns);
fs.writeFileSync(
  path.join(outputDir, "refactorbench_js_full_run_per_fixture.jsonl"),
  `${finalRows.map((row) => JSON.stringify(Object.fromEntries(perFixtureColumns.map((column) => [column, row[column]])))).join("\n")}\n`,
);
writeCsv(path.join(outputDir, "refactorbench_js_full_run_summary.csv"), summaries, summaryColumns);
fs.writeFileSync(
  path.join(outputDir, "refactorbench_js_full_run_manifest.json"),
  `${JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      input_dir: "<raw eval export directory>",
      dedupe_rule: "For each model_provider, test_runner, and fixture, keep the row with the latest result_created_at.",
      privacy_note:
        "This artifact intentionally excludes raw agent prompts, generated file contents, hidden-test messages, and scorer message bodies. It preserves per-fixture scores, metadata, and failure buckets needed to reproduce the paper tables.",
      source_exports: manifest,
    },
    null,
    2,
  )}\n`,
);

console.log(`Wrote ${finalRows.length} per-fixture rows and ${summaries.length} summary rows to ${outputDir}`);
