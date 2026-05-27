# RefactorBench-JS

An open benchmark for evaluating AI coding agents on behavior-preserving JavaScript and React code decomposition.

**Paper:** [RefactorBench-JS: Evaluating LLM Agents on Behavior-Preserving Code Decomposition](paper.pdf) ([source](paper.tex))

## Overview

RefactorBench-JS consists of 123 scored JavaScript and React fixtures--spanning algorithmic logic, data modules, utility/API logic, web UI, and mobile UI--each paired with a hidden unit test suite. The benchmark asks whether an LLM-based coding agent can refactor a given file into smaller, well-structured modules while preserving observable behavior. An agent's output is scored by executing the hidden tests against the refactored filesystem.

The benchmark is grounded in a simple principle: *behavioral preservation is a functional property, and functional properties are best verified by functional tests*.

This repository publishes the benchmark fixtures, hidden tests, paper source, and sanitized baseline result data. It does not publish the private production agent harness or proprietary system prompts used for the baseline runs; users should bring their own refactoring harness to run new model evaluations.

The public interface for bring-your-own-harness evaluations is documented in [HARNESS_INTERFACE.md](HARNESS_INTERFACE.md). Scoring expectations and the hidden-test boundary are documented in [SCORING.md](SCORING.md).

## Corpus

The committed corpus contains 123 scored fixtures:

| Platform metadata | Fixtures | Target-file LOC range | Examples |
|-------------------|----------|-----------------------|----------|
| Web / JavaScript | 90 | 48-4,218 logical lines | algorithms, data modules, API routes, React web components |
| Mobile / React Native | 33 | 227-2,597 logical lines | navigation, gestures, modals, native APIs, mobile state flows |

Every fixture under `refactoring/data/<name>/` has:

- a source tree under `src/`
- `eval.config.json` platform metadata
- `refactoring_eval.config.json` identifying the target file and hidden test file
- a hidden test suite used for scoring

The full fixture inventory is the directory listing under `refactoring/data/`. The sanitized result data used in the paper lives under `data/eval-results/`.

## Layout

```text
refactoring/
  data/
    <name>/
      eval.config.json              # app metadata (name, type)
      refactoring_eval.config.json  # target file + test file paths
      src/                          # source files (the agent's input)
      *.test.js                     # hidden test suite (holdout)
paper.tex                           # LaTeX source for the paper
paper.pdf                           # compiled paper
HARNESS_INTERFACE.md                # public BYOB harness contract
SCORING.md                          # scoring and hidden-test guidance
```

## Scoring

RefactorBench-JS produces five scores per refactoring attempt:

| Score | Type | Description |
|-------|------|-------------|
| **Passes Tests** | Binary | Do the hidden holdout tests pass? *Primary metric.* |
| Agent Reported Success | Binary | Did the agent signal success via its termination tool? |
| Non-Triviality | Binary | Did the refactoring produce new files (not a no-op)? |
| Files Compiled | [0,1] | 1 - (build errors / total files) |
| Cost | $ | Total LLM cost in dollars |

## Citation

If you use RefactorBench-JS in your work, please cite the paper:

```bibtex
@article{chen2026refactorbenchjs,
  title={RefactorBench-JS: Evaluating LLM Agents on Behavior-Preserving Code Decomposition},
  author={Chen, Daniel},
  year={2026}
}
```
