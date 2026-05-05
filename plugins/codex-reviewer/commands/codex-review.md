---
description: Run Codex GPT-5.5 as an independent code reviewer
argument-hint: "[uncommitted|base <branch>|commit <sha>|custom <instructions>]"
allowed-tools:
  - Bash(run-codex-review)
  - Bash(run-codex-review *)
  - Bash(pwd)
  - Bash(git status *)
  - Read
---

# Codex Review

Run the Codex reviewer helper from the current repository:

```bash
run-codex-review $ARGUMENTS
```

If `$ARGUMENTS` is empty, review uncommitted changes.

Supported presets:

- `uncommitted`: staged, unstaged, and untracked changes.
- `base <branch>`: changes against a base branch.
- `commit <sha>`: changes introduced by one commit.
- `custom <instructions>`: Codex's custom review-instructions mode.

Codex review presets are mutually exclusive. Do not combine `uncommitted`, `base`, or `commit` with extra review instructions; use `custom <instructions>` instead.

After the helper returns, summarize Codex's findings. Keep concrete file/line findings visible, identify anything you think is invalid or needs confirmation, and do not edit files unless the user asks for fixes.

