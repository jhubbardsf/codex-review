import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "./helpers";

function read(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("documentation and Pages site", () => {
  test("README documents install, usage, prerequisites, and tests", () => {
    const readme = read("README.md");

    expect(readme).toContain("/plugin marketplace add jhubbardsf/claude-plugins");
    expect(readme).toContain("/plugin install codex-reviewer@joshd3v");
    expect(readme).toContain("/plugin marketplace add jhubbardsf/codex-review");
    expect(readme).toContain("/plugin install codex-reviewer@codex-review");
    expect(readme).toContain("/codex-reviewer:codex-reviewer");
    expect(readme).toContain("/codex-reviewer:codex-review");
    expect(readme).toContain("Codex CLI");
    expect(readme).toContain("bun run test:all");
    expect(readme).not.toContain("yourusername");
  });

  test("GitHub Pages HTML mirrors the install and usage flow", () => {
    const html = read("docs/index.html");

    expect(html).toContain("<meta name=\"viewport\"");
    expect(html).toContain("codex-review");
    expect(html).toContain("/plugin marketplace add jhubbardsf/claude-plugins");
    expect(html).toContain("/plugin install codex-reviewer@joshd3v");
    expect(html).toContain("/codex-reviewer:codex-reviewer");
    expect(html).toContain("/codex-reviewer:codex-review");
    expect(html).toContain("View on GitHub");
    expect(html).toContain("copyInstall");
    expect(html).not.toContain("yourusername");
  });

  test("release process preserves plugin version and marketplace validation", () => {
    const release = read("RELEASE_PROCESS.md");

    expect(release).toContain("plugins/codex-reviewer/.claude-plugin/plugin.json");
    expect(release).toContain("bun run test:all");
    expect(release).toContain("claude plugin validate .");
    expect(release).toContain("GitHub Pages");
  });

  test("install script uses Claude plugin commands", () => {
    const install = read("install.sh");

    expect(install).toContain("claude plugin marketplace add");
    expect(install).toContain("claude plugin install");
    expect(install).toContain("CODEX_REVIEW_INSTALL_SCOPE");
  });
});
