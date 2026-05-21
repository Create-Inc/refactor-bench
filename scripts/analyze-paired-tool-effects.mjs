#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const DEFAULT_INPUT = "data/eval-results/refactorbench_js_full_run_per_fixture.csv";
const DEFAULT_OUTPUT = "data/eval-results/refactorbench_js_tool_effects_paired.csv";

const inputPath = process.argv[2] ?? DEFAULT_INPUT;
const outputPath = process.argv[3] ?? DEFAULT_OUTPUT;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows;
  return body
    .filter((values) => values.some((value) => value !== ""))
    .map((values) => Object.fromEntries(header.map((name, index) => [name, values[index] ?? ""])));
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function writeCsv(filePath, rows, columns) {
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ];
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

function binomialCdf(k, n) {
  if (k < 0) return 0;
  if (k >= n) return 1;
  let probability = 2 ** -n;
  let sum = probability;
  for (let i = 0; i < k; i += 1) {
    probability *= (n - i) / (i + 1);
    sum += probability;
  }
  return sum;
}

function exactMcNemarP(enabledOnly, disabledOnly) {
  const discordant = enabledOnly + disabledOnly;
  if (discordant === 0) return 1;
  return Math.min(1, 2 * binomialCdf(Math.min(enabledOnly, disabledOnly), discordant));
}

const rows = parseCsv(fs.readFileSync(inputPath, "utf8"));
const byModelFixture = new Map();
for (const row of rows) {
  const key = `${row.model_provider}|${row.fixture}`;
  if (!byModelFixture.has(key)) byModelFixture.set(key, {});
  byModelFixture.get(key)[row.test_runner] = Number(row.passes_tests);
}

const byModel = new Map();
for (const row of rows) {
  if (!byModel.has(row.model_provider)) {
    byModel.set(row.model_provider, { model_provider: row.model_provider, model: row.model });
  }
}

const outputRows = [];
for (const [modelProvider, modelInfo] of byModel) {
  let bothPass = 0;
  let enabledOnly = 0;
  let disabledOnly = 0;
  let bothFail = 0;
  for (const [key, pair] of byModelFixture) {
    if (!key.startsWith(`${modelProvider}|`)) continue;
    if (pair.Enabled == null || pair.Disabled == null) continue;
    if (pair.Enabled === 1 && pair.Disabled === 1) bothPass += 1;
    else if (pair.Enabled === 1 && pair.Disabled !== 1) enabledOnly += 1;
    else if (pair.Enabled !== 1 && pair.Disabled === 1) disabledOnly += 1;
    else bothFail += 1;
  }
  const pairedFixtures = bothPass + enabledOnly + disabledOnly + bothFail;
  const enabledPasses = bothPass + enabledOnly;
  const disabledPasses = bothPass + disabledOnly;
  const passRateDeltaPp = ((enabledPasses - disabledPasses) / pairedFixtures) * 100;
  outputRows.push({
    model_provider: modelProvider,
    model: modelInfo.model,
    paired_fixtures: pairedFixtures,
    enabled_passes: enabledPasses,
    disabled_passes: disabledPasses,
    both_pass: bothPass,
    enabled_only: enabledOnly,
    disabled_only: disabledOnly,
    both_fail: bothFail,
    pass_rate_delta_pp: passRateDeltaPp.toFixed(1),
    mcnemar_discordant: enabledOnly + disabledOnly,
    mcnemar_exact_p: exactMcNemarP(enabledOnly, disabledOnly).toPrecision(4),
  });
}

const columns = [
  "model_provider",
  "model",
  "paired_fixtures",
  "enabled_passes",
  "disabled_passes",
  "both_pass",
  "enabled_only",
  "disabled_only",
  "both_fail",
  "pass_rate_delta_pp",
  "mcnemar_discordant",
  "mcnemar_exact_p",
];

writeCsv(outputPath, outputRows, columns);
console.log(`Wrote ${outputRows.length} paired tool-effect rows to ${outputPath}`);
