# Hacker News Draft

Show HN: codex-review - run Codex GPT-5.5 as a Claude Code reviewer

I built a small Claude Code plugin that packages my local workflow for using Codex as an independent code reviewer.

The pattern is: Claude Code does the work, then the plugin runs `codex exec review` with GPT-5.5 against uncommitted changes, a base branch, a commit, or custom review instructions. Claude then summarizes the report, but keeps concrete file/line findings visible.

Install:

```text
/plugin marketplace add jhubbardsf/codex-review
/plugin install codex-reviewer@codex-review
/reload-plugins
/codex-reviewer:codex-reviewer
```

Repo: https://github.com/jhubbardsf/codex-review

