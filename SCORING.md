# RefactorBench-JS Scoring

RefactorBench-JS scores a refactoring attempt by running the fixture's holdout test suite against the filesystem produced by a harness. The holdout tests are public in this repository for transparency, but they should be hidden from the agent during evaluation.

## Primary Metric

The primary metric is **Passes Tests**:

| Value | Meaning |
|-------|---------|
| `1` | The holdout test suite passes against the refactored workspace. |
| `0` | The holdout test suite fails, times out, cannot compile, or cannot be executed. |

Behavioral preservation is evaluated through observable outputs: return values, rendered UI, state transitions, side effects, and error handling. Internal structure is not directly scored.

## Scoring Procedure

For each fixture:

1. Copy `refactoring/data/<fixture_name>/` into an isolated writable workspace.
2. Read `refactoring_eval.config.json`.
3. Run the agent on `src/<targetFile>` without exposing `<testFile>` contents.
4. After the agent stops, run the holdout test file from `testFile` against the modified workspace.
5. Record `passes_tests=1` only if the holdout test command exits successfully.

The repository does not pin a universal package manager command because the fixtures are designed to be embedded in external harnesses with their own dependency installation, module aliasing, transpilation, React/JSDOM setup, and sandboxing. In the baseline system, the private harness supplied that runtime. Public evaluators should document their equivalent runtime and keep it fixed across compared models.

## Hidden-Test Boundary

"Hidden" means hidden from the agent at inference time. The tests are public after release so the benchmark is inspectable and auditable. This creates a normal contamination risk for future models trained on public code. Scores should therefore be interpreted as valid for model snapshots that did not train on the released tests, or for private/refresh splits maintained by downstream evaluators.

## Secondary Scores

The paper reports additional fields when available:

| Score | Meaning |
|-------|---------|
| Agent Reported Success | Whether the agent signaled successful completion. |
| Non-Triviality | Whether the result created at least one new file instead of being a no-op. A no-op can still be compiled or tested, but it is bucketed separately as `Non-triviality failure` when the hidden tests do not pass. |
| Files Compiled | `1 - build_errors / total_files`, as emitted by the harness. |
| Token Consumption | Prompt + completion tokens consumed by the attempt, when available. |

These scores are diagnostic. Hidden-test pass/fail remains the primary correctness metric.

## Failure Buckets

The committed baseline data includes a heuristic `failure_bucket` field. Buckets are mutually exclusive and assigned in priority order:

1. `Passed`
2. `Reported non-success`
3. `Non-triviality failure`
4. `Syntax or parse failure`
5. `Module import/export failure`
6. `DOM/query/UI mismatch`
7. `Runtime reference/type error`
8. `Assertion-level behavior mismatch`
9. `Other hidden-test failure`

The exact bucket assignment logic lives in `scripts/sanitize-eval-results.mjs`. These buckets are useful for analysis but are not part of the primary benchmark score.
