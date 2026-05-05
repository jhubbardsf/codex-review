import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "./helpers";

const marketplacePath = join(repoRoot, ".claude-plugin/marketplace.json");
const pluginRoot = join(repoRoot, "plugins/codex-reviewer");
const pluginManifestPath = join(pluginRoot, ".claude-plugin/plugin.json");
const skillPath = join(pluginRoot, "skills/codex-reviewer/SKILL.md");
const helperPath = join(pluginRoot, "bin/run-codex-review");

function readJson(path: string) {
  return JSON.parse(readFileSync(path, "utf8"));
}

describe("Claude plugin packaging", () => {
  test("marketplace exposes the codex-reviewer plugin from a relative source", () => {
    const marketplace = readJson(marketplacePath);

    expect(marketplace.name).toBe("codex-review");
    expect(marketplace.plugins).toHaveLength(1);
    expect(marketplace.plugins[0].name).toBe("codex-reviewer");
    expect(marketplace.plugins[0].source).toBe("./plugins/codex-reviewer");
    expect(marketplace.plugins[0].source).not.toContain("..");
    expect(existsSync(join(repoRoot, marketplace.plugins[0].source))).toBe(true);
  });

  test("plugin manifest has publish metadata and matches marketplace name", () => {
    const marketplace = readJson(marketplacePath);
    const manifest = readJson(pluginManifestPath);

    expect(manifest.name).toBe(marketplace.plugins[0].name);
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.homepage).toBe("https://jhubbardsf.github.io/codex-review/");
    expect(manifest.repository).toBe("https://github.com/jhubbardsf/codex-review");
    expect(manifest.license).toBe("MIT");
    expect(manifest.keywords).toContain("claude-code");
  });

  test("skill frontmatter advertises the review modes and allowed helper", () => {
    const skill = readFileSync(skillPath, "utf8");

    expect(skill).toStartWith("---\n");
    expect(skill).toContain("description:");
    expect(skill).toContain("argument-hint:");
    expect(skill).toContain("Bash(run-codex-review");
    expect(skill).toContain("/codex-reviewer:codex-reviewer");
    expect(skill).toContain("Do not edit files as part of this skill");
  });

  test("helper is executable and portable", () => {
    const helper = readFileSync(helperPath, "utf8");
    const mode = statSync(helperPath).mode;

    expect(mode & 0o111).not.toBe(0);
    expect(helper).toStartWith("#!/usr/bin/env bash");
    expect(helper).not.toContain("/Users/josh");
    expect(helper).not.toContain("~/.claude");
    expect(helper).toContain("CODEX_REVIEW_MODEL");
    expect(helper).toContain("CODEX_REVIEW_CODEX_BIN");
  });
});

