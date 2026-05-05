# Reddit Draft

Title: I packaged a Claude Code plugin that uses Codex as a second-opinion reviewer

I have been using Claude Code for implementation and Codex GPT-5.5 for review. The workflow worked well enough locally that I packaged it as a Claude Code plugin marketplace.

It adds a namespaced skill:

```text
/codex-reviewer:codex-reviewer
```

Supported modes:

```text
uncommitted
base <branch>
commit <sha>
custom <instructions>
```

The helper is intentionally review-only. It calls the local `codex` CLI, writes the report to a temp file or requested output path, and prints the report so Claude can summarize it.

Repo: https://github.com/jhubbardsf/codex-review

