# RefactorBench-JS Harness Interface

RefactorBench-JS is intentionally harness-agnostic. The public repository defines the fixture format, target file, holdout test file, and scoring fields; evaluators bring their own agent runtime, prompts, model router, sandboxing, package installation, and test execution machinery.

The private production harness used for the baseline paper results is not part of this interface and is not required to evaluate the benchmark.

## Fixture Layout

Each fixture lives under:

```text
refactoring/data/<fixture_name>/
  eval.config.json
  refactoring_eval.config.json
  src/
  *.test.js or *.test.jsx
```

The harness should copy a fixture into an isolated writable workspace before running an agent. Agents should receive the source tree and target-file task, but not the holdout test implementation unless the evaluator is intentionally running an oracle or ablation condition.

## `eval.config.json`

This file records platform metadata for the fixture.

Known fields:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Fixture identifier. This normally matches the fixture directory name. |
| `description` | string | Human-readable fixture description. |
| `appType` | string | Platform metadata, currently `web` or `mobile`. Values are descriptive and should not be used as scoring logic. |
| other metadata | any | Optional future fixture metadata. Harnesses may ignore unknown fields. |

The paper uses this metadata only for corpus summaries. The scoring oracle is the holdout test suite.

## `refactoring_eval.config.json`

This file identifies the refactoring target and holdout test:

| Field | Type | Description |
|-------|------|-------------|
| `targetFile` | string | Path, relative to `src/`, of the file the agent should decompose. |
| `testFile` | string | Path, relative to the fixture root, of the holdout test file used for scoring. |

Example:

```json
{
  "targetFile": "app/page.jsx",
  "testFile": "page.test.js"
}
```

## Agent Input Contract

A compliant harness should present the agent with:

- the fixture source tree under `src/`
- the target file path from `refactoring_eval.config.json`
- the task: refactor the target file into smaller modules while preserving observable behavior
- any platform conventions, dependency aliases, or build rules required by that harness

The baseline runs used a private production agent with private prompts. Public evaluators should report their own harness, model, tool set, retry policy, and termination criteria.

## Agent Output Contract

The agent should write its refactoring result back into the copied fixture workspace. A successful attempt may:

- edit the target file
- add new source files under `src/`
- update imports/exports so the application and holdout tests resolve

The agent should not edit the holdout test file. A harness may record an agent-level completion signal, such as `finish_refactoring(success=true)`, but hidden-test pass/fail is the primary score.

## Required Reported Fields

To compare against the paper tables, a harness should export one row per `(model, tool configuration, fixture)` with:

- model identifier and display name
- tool configuration
- fixture name
- hidden-test pass/fail
- agent-reported success/failure, if available
- non-triviality indicator, if available
- compile/static score, if available
- duration
- token usage, if available
- failure bucket, if applying the paper's heuristic taxonomy

The committed `data/eval-results/refactorbench_js_full_run_per_fixture.csv` provides the concrete schema used for the paper baseline rows.
