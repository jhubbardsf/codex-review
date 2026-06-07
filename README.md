# codex-review

Run Codex GPT-5.5 as an independent reviewer from Claude Code.

`codex-review` packages a Claude Code skill and helper script that lets Claude delegate code review to the local `codex` CLI, then summarize the findings back to you. It is useful when you want Opus/Sonnet to implement and GPT-5.5 to take a separate reviewer pass over the work.

## Installation

### Claude Code plugin

From inside Claude Code:

```text
/plugin marketplace add jhubbardsf/codex-review
/plugin install codex-reviewer@joshd3v
/reload-plugins
```

Then run:

```text
/codex-reviewer:codex-reviewer
```

Claude Code plugin install specs use `plugin@marketplace`. Here, `codex-reviewer` is the plugin name and `joshd3v` is the marketplace name from `.claude-plugin/marketplace.json`. Plugin skills and commands are namespaced by plugin name.

Available slash entries:

```text
/codex-reviewer:codex-reviewer  # skill entry
/codex-reviewer:codex-review    # compatibility command entry
```

### One-line installer

If you prefer a shell installer:

```bash
curl -fsSL https://raw.githubusercontent.com/jhubbardsf/codex-review/main/install.sh | bash
```

To install at project or local scope:

```bash
curl -fsSL https://raw.githubusercontent.com/jhubbardsf/codex-review/main/install.sh | bash -s -- --scope project
```

## Requirements

- Claude Code with plugin support
- Codex CLI installed and authenticated
- Access to the selected Codex model (defaults to your `codex` config's model and provider)
- A git repository to review

## Usage

```text
/codex-reviewer:codex-reviewer
/codex-reviewer:codex-reviewer uncommitted
/codex-reviewer:codex-reviewer base origin/main
/codex-reviewer:codex-reviewer commit abc1234
/codex-reviewer:codex-reviewer custom Review uncommitted changes and focus on retry safety
```

The compatibility command accepts the same arguments:

```text
/codex-reviewer:codex-review base origin/main
```

By default, the helper reviews staged, unstaged, and untracked changes.

## Helper CLI

The plugin exposes `run-codex-review` on Claude Code's Bash tool PATH while the plugin is enabled.

```bash
run-codex-review [options] [uncommitted]
run-codex-review [options] base <branch>
run-codex-review [options] commit <sha>
run-codex-review [options] custom <review instructions...>
```

Options:

| Option | Description |
| --- | --- |
| `--model <model>` | Codex model to use. Defaults to `CODEX_REVIEW_MODEL`, or your `codex` config's model when unset (which keeps the model paired with its `model_provider`). |
| `--cwd <dir>` | Repository directory. Defaults to the current working directory. |
| `--output <file>` | Write the final Codex report to a specific path. |
| `--no-ephemeral` | Persist the Codex session instead of passing `--ephemeral`. |
| `-h`, `--help` | Show usage. |

For direct shell use outside Claude Code, run:

```bash
plugins/codex-reviewer/bin/run-codex-review --help
```

## Configuration

Set a different default model:

```bash
export CODEX_REVIEW_MODEL=gpt-5.4
```

Use a non-standard Codex executable:

```bash
export CODEX_REVIEW_CODEX_BIN=/path/to/codex
```

## Development

This repo uses Bun for JS/TS tooling and tests.

```bash
bun test
bun run test:shell
bun run test:plugin
bun run test:docs
bun run test:all
```

`bun run test:all` runs the Bun tests plus `scripts/validate-plugin.sh`. If the `claude` CLI is installed, validation also runs `claude plugin validate .`.

## GitHub Pages

The project site lives in `docs/index.html`, matching the lightweight GitHub Pages pattern used by `sopsx` and `aws-sso-refresh`. Configure GitHub Pages to serve from `/docs` on the default branch.

## Troubleshooting

### `/plugin` is not recognized

Update Claude Code. Plugin commands require a recent Claude Code release.

### `codex CLI not found`

Install and authenticate Codex, or set `CODEX_REVIEW_CODEX_BIN` to the executable path.

### Model access fails

Pass a model you can access:

```text
/codex-reviewer:codex-reviewer --model gpt-5.4 custom Review uncommitted changes
```

or set:

```bash
export CODEX_REVIEW_MODEL=gpt-5.4
```

## License

MIT
