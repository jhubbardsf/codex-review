---
description: Run Codex CLI with GPT-5.5 as an independent code reviewer for git changes. Use when the user explicitly asks for a Codex review, GPT-5.5 review, OpenAI review, second-opinion review, or cross-check of uncommitted/base/commit/custom review changes.
argument-hint: "[uncommitted|base <branch>|commit <sha>|custom <instructions>]"
allowed-tools:
  - Bash(run-codex-review)
  - Bash(run-codex-review *)
  - Bash(pwd)
  - Bash(git status *)
  - Read
---

# Codex Reviewer

Use this skill to ask Codex, running GPT-5.5 through the local `codex` CLI, for an independent code review.

Run it when the user invokes `/codex-reviewer:codex-reviewer` or explicitly asks for a Codex/GPT-5.5 reviewer. Because this spends external model/API budget, do not invoke it for ordinary Claude-only review requests unless the user asks for Codex, GPT-5.5, OpenAI, or a second-opinion reviewer.

## Invocation

Run the helper script from the current repository:

```bash
run-codex-review $ARGUMENTS
```

If no arguments are provided, review uncommitted changes.

Supported presets:

- `uncommitted`: review staged, unstaged, and untracked changes.
- `base <branch>`: review changes against a base branch, such as `base main` or `base origin/main`.
- `commit <sha>`: review the changes introduced by a specific commit.
- `custom <instructions>`: run Codex's custom review-instructions mode.

Codex review presets are mutually exclusive. Do not combine `uncommitted`, `base`, or `commit` with extra review instructions; use `custom <instructions>` instead.

Examples:

- `/codex-reviewer:codex-reviewer`
- `/codex-reviewer:codex-reviewer uncommitted`
- `/codex-reviewer:codex-reviewer base origin/main`
- `/codex-reviewer:codex-reviewer commit abc1234`
- `/codex-reviewer:codex-reviewer custom Review uncommitted changes and focus on concurrency and missing tests`

## How to Use the Result

After the helper returns:

1. Treat the Codex report as reviewer input, not as automatically true.
2. Preserve concrete findings with file/line references.
3. If Codex reports no findings, say that clearly and include any test or verification gaps it noted.
4. If Codex fails to run, report the command failure and do not invent review findings.

Do not edit files as part of this skill unless the user separately asks for fixes.

