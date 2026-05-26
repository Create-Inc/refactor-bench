import fs from "node:fs";
import path from "node:path";

const inputPath =
  process.argv[2] ?? "data/eval-results/refactorbench_js_full_run_per_fixture.csv";
const outputPath =
  process.argv[3] ?? "data/eval-results/refactorbench_js_fixture_hardness.csv";

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    if (char === "\"") {
      if (quoted && line[index + 1] === "\"") {
        current += "\"";
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replaceAll("\"", "\"\"")}"`;
  }
  return stringValue;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function loadFixtureMetadata(fixture) {
  const configPath = `refactoring/data/${fixture}/refactoring_eval.config.json`;
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const targetFile = config.targetFile;
  const targetPath = `refactoring/data/${fixture}/src/${targetFile}`;
  const content = fs.existsSync(targetPath)
    ? fs.readFileSync(targetPath, "utf8")
    : "";
  const targetLoc = content === "" ? 0 : content.split("\n").length;
  const classificationText = `${fixture} ${targetFile} ${content.slice(0, 4000)}`;
  const lower = classificationText.toLowerCase();

  let fixtureCategory = "Utility/API";
  if (
    /react-native|expo-router|@react-navigation|src\/screens|\(tabs\)|\.native\.|from ['"]expo/.test(
      lower
    )
  ) {
    fixtureCategory = "Mobile / React Native";
  } else if (
    /\.(jsx|tsx)$/.test(targetFile) ||
    /from ['"]react|usestate|useeffect|@testing-library\/react/.test(lower)
  ) {
    fixtureCategory = "React web UI";
  } else if (
    /api\/|route\.js|auth|command|processor|hook|use[A-Z]/.test(targetFile) ||
    /fetch\(|request|response|database|supabase|localstorage/.test(lower)
  ) {
    fixtureCategory = "Utility/API";
  } else {
    fixtureCategory = "Algorithm/data";
  }

  return { targetFile, targetLoc, fixtureCategory };
}

const text = fs.readFileSync(inputPath, "utf8").trim();
const [headerLine, ...lines] = text.split(/\r?\n/);
const headers = parseCsvLine(headerLine);
const rows = lines.map((line) =>
  Object.fromEntries(parseCsvLine(line).map((value, index) => [headers[index], value]))
);

const byFixture = new Map();

for (const row of rows) {
  const fixture = row.fixture;
  if (!byFixture.has(fixture)) {
    byFixture.set(fixture, {
      fixture,
      conditions: 0,
      passes: 0,
      failures: 0,
      durationSum: 0,
      durationCount: 0,
      costSum: 0,
      costCount: 0,
      failureBuckets: new Map(),
    });
  }

  const summary = byFixture.get(fixture);
  const passed = Number(row.passes_tests) === 1;
  const durationMin = toNumber(row.duration_min);
  const costUsd = toNumber(row.refactoring_cost_usd);

  summary.conditions++;
  summary.passes += passed ? 1 : 0;
  summary.failures += passed ? 0 : 1;

  if (durationMin !== null) {
    summary.durationSum += durationMin;
    summary.durationCount++;
  }

  if (costUsd !== null) {
    summary.costSum += costUsd;
    summary.costCount++;
  }

  if (!passed) {
    summary.failureBuckets.set(
      row.failure_bucket,
      (summary.failureBuckets.get(row.failure_bucket) ?? 0) + 1
    );
  }
}

const ranked = [...byFixture.values()].sort(
  (left, right) =>
    right.failures - left.failures ||
    right.durationSum / Math.max(1, right.durationCount) -
      left.durationSum / Math.max(1, left.durationCount) ||
    left.fixture.localeCompare(right.fixture)
);

const outputHeaders = [
  "rank",
  "fixture",
  "fixture_category",
  "target_file",
  "target_loc",
  "conditions",
  "passes",
  "failures",
  "pass_rate",
  "failure_rate",
  "avg_duration_min",
  "avg_cost_usd",
  "top_failure_bucket",
  "top_failure_bucket_count",
  "failure_bucket_counts",
];

const outputRows = ranked.map((summary, index) => {
  const metadata = loadFixtureMetadata(summary.fixture);
  const bucketEntries = [...summary.failureBuckets.entries()].sort(
    (left, right) => right[1] - left[1] || left[0].localeCompare(right[0])
  );
  const [topBucket = "", topBucketCount = ""] = bucketEntries[0] ?? [];
  const failureBucketCounts = bucketEntries
    .map(([bucket, count]) => `${bucket}:${count}`)
    .join("; ");

  return {
    rank: index + 1,
    fixture: summary.fixture,
    fixture_category: metadata.fixtureCategory,
    target_file: metadata.targetFile,
    target_loc: metadata.targetLoc,
    conditions: summary.conditions,
    passes: summary.passes,
    failures: summary.failures,
    pass_rate: (summary.passes / summary.conditions).toFixed(4),
    failure_rate: (summary.failures / summary.conditions).toFixed(4),
    avg_duration_min: summary.durationCount
      ? (summary.durationSum / summary.durationCount).toFixed(2)
      : "",
    avg_cost_usd: summary.costCount
      ? (summary.costSum / summary.costCount).toFixed(4)
      : "",
    top_failure_bucket: topBucket,
    top_failure_bucket_count: topBucketCount,
    failure_bucket_counts: failureBucketCounts,
  };
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  [
    outputHeaders.join(","),
    ...outputRows.map((row) =>
      outputHeaders.map((header) => csvEscape(row[header])).join(",")
    ),
  ].join("\n") + "\n"
);

const histogram = new Map();
for (const summary of ranked) {
  histogram.set(summary.passes, (histogram.get(summary.passes) ?? 0) + 1);
}

console.log(`Wrote ${outputPath}`);
console.log("Fixture pass-count distribution across conditions:");
for (const [passes, count] of [...histogram.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`${passes}/${ranked[0]?.conditions ?? 0}: ${count}`);
}
