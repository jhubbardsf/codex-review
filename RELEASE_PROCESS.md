# Release Process

`codex-review` is a Claude Code plugin marketplace. Releases are mostly metadata discipline: plugin users only receive updates when the resolved plugin version changes.

## Before Release

1. Update `plugins/codex-reviewer/.claude-plugin/plugin.json`.
   - Bump `version`.
   - Keep `repository`, `homepage`, and `license` current.
2. Run the full suite.

```bash
bun run test:all
```

3. If Claude Code is installed, verify the marketplace directly.

```bash
claude plugin validate .
```

4. Test local install from this checkout.

```text
/plugin marketplace add ./path/to/codex-review
/plugin install codex-reviewer@codex-review
/reload-plugins
/codex-reviewer:codex-reviewer
/codex-reviewer:codex-review
```

5. Check the GitHub Pages site.
   - Open `docs/index.html`.
   - Confirm install commands match `README.md`.
   - Confirm no placeholder URLs remain.

## Publish

1. Commit the release changes.
2. Tag the release with the plugin version.

```bash
git tag v0.1.0
git push origin main --tags
```

3. Confirm GitHub Pages is serving from `/docs`.
4. Ask a fresh Claude Code install to add the marketplace:

```text
/plugin marketplace add jhubbardsf/codex-review
/plugin install codex-reviewer@codex-review
```

## Version Notes

Do not set a separate plugin version in `.claude-plugin/marketplace.json`. The plugin manifest version wins silently, so keeping a single source of truth avoids stale marketplace metadata masking a release.
