import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  cleanup,
  createFakeCodex,
  initGitRepo,
  makeMissingPath,
  makeTempDir,
  readArgsLog,
  runReview
} from "./helpers";

const tempPaths: string[] = [];

function track(path: string): string {
  tempPaths.push(path);
  return path;
}

function setup() {
  const repo = track(initGitRepo());
  const fake = createFakeCodex();
  track(fake.binDir);
  return {
    repo,
    logPath: fake.logPath,
    env: {
      PATH: `${fake.binDir}:${process.env.PATH ?? ""}`,
      CODEX_REVIEW_FAKE_LOG: fake.logPath
    }
  };
}

beforeEach(() => {
  tempPaths.length = 0;
});

afterEach(() => {
  for (const path of tempPaths.splice(0)) {
    cleanup(path);
  }
});

describe("run-codex-review", () => {
  test("defaults to an ephemeral uncommitted review using the codex config model", () => {
    const { repo, logPath, env } = setup();
    // Pin CODEX_REVIEW_MODEL empty so the test is hermetic regardless of the
    // runner's shell environment (runReview spreads process.env).
    const result = runReview([], {
      cwd: repo,
      env: { ...env, CODEX_REVIEW_MODEL: "" }
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("fake Codex review report");
    expect(result.stderr).toContain("Target: uncommitted");
    // With no explicit model, the helper must NOT pass -m so that codex uses its
    // configured model+provider pair (passing only -m, e.g. gpt-5.5, against an
    // Azure provider that lacks that deployment yields a 404).
    expect(result.stderr).toContain("Model: <codex config default>");
    const args = readArgsLog(logPath);
    for (const expected of ["exec", "review", "--ephemeral", "--uncommitted"]) {
      expect(args).toContain(expected);
    }
    expect(args).not.toContain("-m");
  });

  test("uses CODEX_REVIEW_MODEL when --model is not passed", () => {
    const { repo, logPath, env } = setup();
    const result = runReview([], {
      cwd: repo,
      env: { ...env, CODEX_REVIEW_MODEL: "gpt-5.4" }
    });

    expect(result.status).toBe(0);
    const args = readArgsLog(logPath);
    expect(args).toContain("-m");
    expect(args).toContain("gpt-5.4");
  });

  test("--model overrides CODEX_REVIEW_MODEL", () => {
    const { repo, logPath, env } = setup();
    const result = runReview(["--model", "gpt-5.5", "uncommitted"], {
      cwd: repo,
      env: { ...env, CODEX_REVIEW_MODEL: "gpt-5.4" }
    });

    expect(result.status).toBe(0);
    const args = readArgsLog(logPath);
    expect(args).toContain("-m");
    expect(args).toContain("gpt-5.5");
  });

  test("passes base reviews through to codex", () => {
    const { repo, logPath, env } = setup();
    const result = runReview(["base", "origin/main"], { cwd: repo, env });

    expect(result.status).toBe(0);
    expect(result.stderr).toContain("Target: base origin/main");
    const args = readArgsLog(logPath);
    expect(args).toContain("--base");
    expect(args).toContain("origin/main");
  });

  test("passes commit reviews through to codex", () => {
    const { repo, logPath, env } = setup();
    const result = runReview(["commit", "abc1234"], { cwd: repo, env });

    expect(result.status).toBe(0);
    expect(result.stderr).toContain("Target: commit abc1234");
    const args = readArgsLog(logPath);
    expect(args).toContain("--commit");
    expect(args).toContain("abc1234");
  });

  test("custom mode sends instructions as one final prompt argument", () => {
    const { repo, logPath, env } = setup();
    const result = runReview(
      ["custom", "Review uncommitted changes and focus on concurrency"],
      { cwd: repo, env }
    );

    const args = readArgsLog(logPath);
    expect(result.status).toBe(0);
    expect(args).not.toContain("--uncommitted");
    expect(args.at(-1)).toBe(
      "Review only; do not edit files. Review uncommitted changes and focus on concurrency"
    );
  });

  test("unknown leading arguments become custom instructions", () => {
    const { repo, logPath, env } = setup();
    const result = runReview(["Focus on retry safety"], { cwd: repo, env });

    expect(result.status).toBe(0);
    expect(readArgsLog(logPath).at(-1)).toBe(
      "Review only; do not edit files. Focus on retry safety"
    );
  });

  test("--no-ephemeral omits the ephemeral flag", () => {
    const { repo, logPath, env } = setup();
    const result = runReview(["--no-ephemeral"], { cwd: repo, env });

    expect(result.status).toBe(0);
    expect(readArgsLog(logPath)).not.toContain("--ephemeral");
  });

  test("--cwd reviews a repo that differs from the process cwd", () => {
    const { repo, logPath, env } = setup();
    const otherDir = track(makeTempDir("codex-review-other-cwd"));
    const result = runReview(["--cwd", repo], { cwd: otherDir, env });

    expect(result.status).toBe(0);
    expect(result.stderr).toContain(`Running Codex reviewer in: ${repo}`);
    expect(readArgsLog(logPath)).toContain("--uncommitted");
  });

  test("--output writes and prints the requested report path", () => {
    const { repo, env } = setup();
    const output = join(track(makeTempDir("codex-review-output")), "report.md");
    const result = runReview(["--output", output], { cwd: repo, env });

    expect(result.status).toBe(0);
    expect(existsSync(output)).toBe(true);
    expect(readFileSync(output, "utf8")).toBe("fake Codex review report\n");
    expect(result.stdout).toContain(`Codex review report: ${output}`);
  });

  test("rejects preset reviews mixed with extra instructions", () => {
    const { repo, env } = setup();
    const result = runReview(["uncommitted", "also check auth"], { cwd: repo, env });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("uncommitted review cannot be combined");
  });

  test("rejects base without a ref", () => {
    const { repo, env } = setup();
    const result = runReview(["base"], { cwd: repo, env });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("base requires a branch/ref");
  });

  test("rejects commit without a sha", () => {
    const { repo, env } = setup();
    const result = runReview(["commit"], { cwd: repo, env });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("commit requires a SHA");
  });

  test("rejects custom with no instructions", () => {
    const { repo, env } = setup();
    const result = runReview(["custom"], { cwd: repo, env });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("custom requires review instructions");
  });

  test("rejects missing cwd", () => {
    const { env } = setup();
    const result = runReview(["--cwd", makeMissingPath()], { env });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("cwd does not exist");
  });

  test("rejects directories that are not git repos", () => {
    const { env } = setup();
    const dir = track(makeTempDir("codex-review-not-git"));
    const result = runReview(["--cwd", dir], { env });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("cwd is not inside a git repository");
  });

  test("fails clearly when codex cannot be found", () => {
    const repo = track(initGitRepo());
    const result = runReview([], {
      cwd: repo,
      env: {
        PATH: "/usr/bin:/bin",
        CODEX_REVIEW_CODEX_BIN: "definitely-missing-codex"
      }
    });

    expect(result.status).toBe(127);
    expect(result.stderr).toContain("codex CLI not found");
  });

  test("--help prints usage without requiring git or codex", () => {
    const result = runReview(["--help"], {
      cwd: track(makeTempDir("codex-review-help"))
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("run-codex-review base origin/main");
  });
});
