import fs from "node:fs";
import path from "node:path";

const hardnessPath =
  process.argv[2] ?? "data/eval-results/refactorbench_js_fixture_hardness.csv";
const outputPath =
  process.argv[3] ?? "data/eval-results/refactorbench_js_zero_pass_test_contracts.csv";

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

function readCsv(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  const [headerLine, ...lines] = text.split(/\r?\n/);
  const headers = parseCsvLine(headerLine);
  return lines.map((line) =>
    Object.fromEntries(parseCsvLine(line).map((value, index) => [headers[index], value]))
  );
}

function findTestFile(fixture) {
  const fixtureDir = `refactoring/data/${fixture}`;
  const entries = fs.readdirSync(fixtureDir);
  const testFile = entries.find((entry) => /\btest\.(jsx?|tsx?)$/.test(entry));
  return testFile ? path.join(fixtureDir, testFile) : "";
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function extractTestNames(text) {
  const names = [];
  const pattern = /\b(?:test|it)\s*\(\s*(['"`])((?:\\.|(?!\1).){1,180})\1/gms;
  for (const match of text.matchAll(pattern)) {
    names.push(match[2].replace(/\s+/g, " ").trim());
  }
  return names;
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

const contractDefinitions = [
  {
    name: "initial render and visible copy",
    patterns: [
      /getByText|queryByText|getAllByText|toBeInTheDocument/i,
      /\brenders?\b|initial rendering|shows? .*default/i,
    ],
  },
  {
    name: "navigation and view switching",
    patterns: [
      /navigation|sidebar|tab|route|router|useRouter|switches to|clicking .* shows|active view/i,
    ],
  },
  {
    name: "forms, modals, and CRUD flows",
    patterns: [
      /modal|form|submit|add |create |edit |delete|remove|save|cancel|confirm|record transaction/i,
    ],
  },
  {
    name: "search, filtering, and sorting",
    patterns: [/search|filter|sort|dropdown|select|queryByText/i],
  },
  {
    name: "computed domain state",
    patterns: [
      /total|balance|percentage|allocation|metrics?|count|budget|streak|gain|loss|score|progress|calculation|computed|equals?|unique|maxKB/i,
    ],
  },
  {
    name: "browser or device persistence",
    patterns: [/localStorage|AsyncStorage|getItem|setItem|removeItem|persistence|persist/i],
  },
  {
    name: "API, auth, and external side effects",
    patterns: [
      /fetch|api|auth|signIn|signUp|mockApi|database|db|request|response|URL\.createObjectURL|Share|Alert|Haptics|notifications?/i,
    ],
  },
  {
    name: "module exports and data shape",
    patterns: [
      /exports? a default|toHaveProperty|Array\.isArray|typeof|undefined|null|required fields|data integrity|non-empty array|full expected shape/i,
    ],
  },
  {
    name: "accessibility and semantic selectors",
    patterns: [/getByRole|getByLabelText|getByPlaceholderText|accessibilityLabel|aria-label|role=/i],
  },
  {
    name: "async behavior and timers",
    patterns: [/waitFor|act\(|useFakeTimers|advanceTimers|mockResolvedValue|Promise|async/i],
  },
  {
    name: "mobile/native runtime behavior",
    patterns: [/react-native|expo-|TouchableOpacity|SafeArea|useFocusEffect|native|gesture|haptic/i],
  },
];

const rows = readCsv(hardnessPath)
  .filter((row) => row.passes === "0")
  .map((row) => {
    const testPath = findTestFile(row.fixture);
    const testText = testPath ? fs.readFileSync(testPath, "utf8") : "";
    const testNames = extractTestNames(testText);
    const matchedContracts = contractDefinitions
      .filter((contract) => hasAny(testText, contract.patterns))
      .map((contract) => contract.name);

    return {
      fixture: row.fixture,
      fixture_category: row.fixture_category,
      target_file: row.target_file,
      target_loc: row.target_loc,
      top_failure_bucket: row.top_failure_bucket,
      failure_bucket_counts: row.failure_bucket_counts,
      test_file: testPath.replace(/^refactoring\/data\/[^/]+\//, ""),
      test_count: testNames.length,
      assertion_count: countMatches(testText, /\bexpect\s*\(/g),
      interaction_count: countMatches(testText, /\b(?:fireEvent|userEvent)\./g),
      async_wait_count: countMatches(testText, /\b(?:waitFor|act)\s*\(/g),
      contracts_tested: matchedContracts.join("; "),
      representative_tests: testNames.slice(0, 8).join("; "),
    };
  });

const headers = [
  "fixture",
  "fixture_category",
  "target_file",
  "target_loc",
  "top_failure_bucket",
  "failure_bucket_counts",
  "test_file",
  "test_count",
  "assertion_count",
  "interaction_count",
  "async_wait_count",
  "contracts_tested",
  "representative_tests",
];

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n"
);

const contractCounts = new Map();
for (const row of rows) {
  for (const contract of row.contracts_tested.split("; ").filter(Boolean)) {
    contractCounts.set(contract, (contractCounts.get(contract) ?? 0) + 1);
  }
}

console.log(`Wrote ${outputPath}`);
console.log("Zero-pass fixture test-contract coverage:");
for (const [contract, count] of [...contractCounts.entries()].sort(
  (left, right) => right[1] - left[1] || left[0].localeCompare(right[0])
)) {
  console.log(`${contract}: ${count}/${rows.length}`);
}
