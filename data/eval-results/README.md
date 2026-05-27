# RefactorBench-JS Full Eval Results

This directory contains the sanitized fine-grained data used for the paper tables.

## Files

- `refactorbench_js_full_run_per_fixture.csv`: one row per model, test-runner setting, and fixture.
- `refactorbench_js_full_run_per_fixture.jsonl`: the same rows as JSON Lines.
- `refactorbench_js_full_run_summary.csv`: aggregate rows used for the main score, calibration, and operational metadata tables.
- `refactorbench_js_tool_effects_paired.csv`: paired test-runner enabled vs. disabled comparison by model.
- `refactorbench_js_fixture_hardness.csv`: fixtures ranked by failure frequency across all model/tool conditions.
- `refactorbench_js_zero_pass_test_contracts.csv`: public-test contract summary for fixtures that failed in every model/tool condition.
- `refactorbench_js_full_run_manifest.json`: source export manifest and reproducibility notes.

## Privacy Boundary

The raw eval exports include agent inputs, generated file-system snapshots, hidden-test output, and scorer message bodies. Those are intentionally not committed because the public benchmark should not disclose private harness prompts, production agent internals, or generated code snapshots.

The committed artifacts preserve the reproducibility-safe fields needed to recompute the paper numbers:

- model and test-runner condition
- fixture name
- hidden-test pass/fail
- agent-reported success
- non-triviality and compile scores
- duration
- refactoring cost and token counts
- file-count metadata
- synthetic terminal-failure marker
- failure bucket
- source export identifier

## Per-Fixture Schema

`refactorbench_js_full_run_per_fixture.csv` and `.jsonl` use the same fields:

| Column | Type | Description |
|--------|------|-------------|
| `model_provider` | string | Internal provider/model alias used for grouping baseline rows. |
| `model` | string | Display name used in the paper tables. |
| `test_runner` | enum | `Enabled` or `Disabled`. |
| `fixture` | string | Fixture directory name under `refactoring/data/`. |
| `passes_tests` | binary | `1` if the holdout tests passed, otherwise `0`. |
| `agent_reported_success` | binary | `1` if the agent reported successful completion. |
| `non_triviality` | binary | `1` if the output created additional files instead of being a no-op. |
| `files_compiled` | number | Harness compile/static score in `[0,1]`. |
| `failure_bucket` | enum | Heuristic failure class; `Passed` for successful rows. |
| `duration_ms` | integer | Wall-clock attempt duration in milliseconds. |
| `duration_min` | number | Wall-clock attempt duration in minutes. |
| `refactoring_cost_usd` | number | LLM cost for the attempt, in USD. |
| `prompt_tokens` | integer or blank | Prompt tokens when available. |
| `completion_tokens` | integer or blank | Completion tokens when available. |
| `files_before` | integer | Number of files before refactoring, when available. |
| `files_after` | integer | Number of files after refactoring, when available. |
| `total_files_compiled` | integer | Number of files considered by the compile/static checker. |
| `synthetic_terminal_failure` | boolean | `true` only for an explicit synthetic failed row inserted when a fixture repeatedly terminated before exporting a result. |
| `source_export` | string | Raw export filename from which the sanitized row was derived. |
| `experiment_id` | string | Source experiment identifier. |
| `result_id` | string | Source result identifier. |
| `result_created_at` | timestamp | Source result creation timestamp used by the dedupe rule. |

Valid `failure_bucket` values are: `Passed`, `Reported non-success`, `Non-triviality failure`, `Syntax or parse failure`, `Module import/export failure`, `DOM/query/UI mismatch`, `Runtime reference/type error`, `Assertion-level behavior mismatch`, and `Other hidden-test failure`.

## Paired Tool-Effect Schema

`refactorbench_js_tool_effects_paired.csv` compares test-runner enabled and disabled outcomes on the same 123 fixtures for each model. `enabled_only` counts fixtures that passed only with the test runner; `disabled_only` counts fixtures that passed only without it. `mcnemar_exact_p` is the two-sided exact McNemar/binomial p-value over the discordant pairs.

## Fixture Hardness Schema

`refactorbench_js_fixture_hardness.csv` aggregates the per-fixture results across all model and test-runner conditions. `fixture_category`, `target_file`, and `target_loc` describe the benchmark target file; categories are heuristic labels inferred from fixture path and file contents. `passes` and `failures` count hidden-test outcomes across the 14 evaluated conditions; `pass_rate` and `failure_rate` are the corresponding fractions. `top_failure_bucket` is the most common heuristic failure bucket among failed outcomes for that fixture, with `failure_bucket_counts` preserving the full bucket breakdown.

`refactorbench_js_zero_pass_test_contracts.csv` summarizes what the released holdout tests check for the zero-pass fixture tier. It records the test file, test/assertion/interaction counts, matched behavioral contract families, and representative test names. Contract labels are heuristic and derived from public test source text.

## Regeneration

The committed sanitized files are the canonical public result artifact. The raw exports are private because they contain agent prompts, generated code snapshots, scorer message bodies, and other harness internals.

Internal users with access to the raw exports can regenerate the sanitized artifacts with:

```sh
node scripts/sanitize-eval-results.mjs <raw-eval-export-dir> data/eval-results
node scripts/analyze-paired-tool-effects.mjs
node scripts/analyze-fixture-hardness.mjs
node scripts/analyze-zero-pass-test-contracts.mjs
```

The dedupe rule is: for each `(model_provider, test_runner, fixture)`, keep the row with the latest `result_created_at`.
