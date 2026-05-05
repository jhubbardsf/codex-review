# LinkedIn Draft

I packaged one of my favorite local agent workflows as a Claude Code plugin: `codex-review`.

It lets Claude Code ask Codex GPT-5.5 for an independent review of a change set, then bring the findings back into the Claude conversation.

Why I like it:

- separate model perspective on correctness bugs
- review-only by default
- works for uncommitted changes, base branches, commits, and custom instructions
- installable through Claude Code's plugin marketplace flow

Install:

```text
/plugin marketplace add jhubbardsf/codex-review
/plugin install codex-reviewer@joshd3v
```

Repo: https://github.com/jhubbardsf/codex-review
