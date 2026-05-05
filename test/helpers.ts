import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

export const repoRoot = resolve(import.meta.dir, "..");
export const reviewScript = join(repoRoot, "plugins/codex-reviewer/bin/run-codex-review");

export function makeTempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), `${prefix}-`));
}

export function cleanup(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

export function initGitRepo(): string {
  const dir = makeTempDir("codex-review-repo");
  spawnSync("git", ["init"], { cwd: dir, encoding: "utf8" });
  writeFileSync(join(dir, "change.txt"), "hello\n");
  return dir;
}

export function createFakeCodex(): { binDir: string; logPath: string } {
  const binDir = makeTempDir("codex-review-bin");
  const logPath = join(binDir, "codex-args.log");
  const fakeCodex = join(binDir, "codex");
  writeFileSync(
    fakeCodex,
    `#!/usr/bin/env bash
set -euo pipefail
: "\${CODEX_REVIEW_FAKE_LOG:?missing fake log path}"
{
  for arg in "$@"; do
    printf '<%s>\\n' "$arg"
  done
} > "$CODEX_REVIEW_FAKE_LOG"
output=""
prev=""
for arg in "$@"; do
  if [[ "$prev" == "-o" ]]; then
    output="$arg"
    break
  fi
  prev="$arg"
done
if [[ -z "$output" ]]; then
  echo "fake codex did not receive -o" >&2
  exit 31
fi
mkdir -p "$(dirname "$output")"
printf 'fake Codex review report\\n' > "$output"
`
  );
  chmodSync(fakeCodex, 0o755);
  return { binDir, logPath };
}

export function runReview(
  args: string[],
  options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
  } = {}
) {
  const env = {
    ...process.env,
    ...options.env
  };
  return spawnSync(reviewScript, args, {
    cwd: options.cwd ?? repoRoot,
    env,
    encoding: "utf8"
  });
}

export function readArgsLog(logPath: string): string[] {
  const raw = readFileSync(logPath, "utf8").trim();
  if (!raw) {
    return [];
  }
  return raw.split("\n").map((line) => line.slice(1, -1));
}

export function makeMissingPath(): string {
  return join(makeTempDir("codex-review-missing-parent"), "missing");
}

