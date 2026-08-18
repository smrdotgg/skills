---
name: ralph
disable-model-invocation: true
description: Build a Ralph — a TypeScript/Bun script that drives pi as a subprocess for multi-phase work (print/json/rpc modes, per-task state, validation gates, Git/DB sandbox). See `local/fix-context-rbac.ts` for the canonical implementation.
---

# Ralph

A **Ralph** is an outer script that owns a repo and drives one or more headless
pi sessions to do the actual work. The outer script is the authority; each pi
run is a disposable worker that gets a prompt, returns text, and is judged by
its diff. The pattern scales one task at a time, resumable, with Git and DB
operations reserved for the outer script.

The canonical implementation is `local/fix-context-rbac.ts` — read it once
before building a new Ralph. It shows every lever below wired together:
state machine, worktree, sandbox wrappers, per-phase prompt, validation gate,
checkpoint restore. Copy its shape; trim what your job does not need.

A minimal Ralph (single task, no worktree, no sandbox) is `local/ralph.ts`:
loop → spawn agent → parse a doc → outer script commits. Start there when the
job is one repetitive transform across many rows.

## When to build a Ralph

Build one when work splits into independent tasks the agent should do one at a
time, and you want the outer script to own the irreversible steps (commits,
branch ops, DB writes) the agent must not. Do not build one for a single
open-ended task — just run pi directly.

## The mode decision

Pick the pi invocation mode by what you need back. This is the first step; it
changes the spawn helper and the parsing.

- **Print mode** `-p` — text in, text out, exit code. Default for Ralphs. The
  script parses stdout for a completion sentinel and treats the exit code as
  pass/fail. Use when you only care that the task is done and what the agent
  said about it.
- **JSON mode** `--mode json` — session events as JSON lines. Use when you
  must react to intermediate steps (tool calls, usage, per-message content)
  or capture structured output without a sentinel. Parse `tool_execution_end`
  and `message_end` events.
- **RPC mode** `--mode rpc` — long-lived JSONL process over stdin/stdout,
  many prompts per process. Use when one process should serve multiple turns
  or an interactive embedding. For a Node/Bun app, prefer importing
  `AgentSession` from `@earendil-works/pi-coding-agent` over spawning a
  subprocess — RPC mode is the subprocess fallback.

Most Ralphs use print mode. Reach for JSON only when print's sentinel is too
coarse; reach for RPC only when one process must outlive one task.

## Steps

1. **Locate the executable.** Resolve once, reuse: `PI_EXECUTABLE` env →
   `~/.pi/runtime/bin/pi` → bare `pi`. Never hardcode a path.
2. **Define the task list.** Each task carries: id, label, its prompt or
   prompt-building input, the files/reports/screenshots to attach, the test
   files that validate it, and the commit message. Make it `as const`.
3. **Shape the state.** A `state.json` with version, base pin (branch + sha),
   worktree path, current head, and a per-task entry: `status` in
   `pending|running|failed|complete`, `attempts`, `startedAt`, `completedAt`,
   `commit`, `report`, `validation`, `error`. Write atomically (tmp + rename).
   On load, flip any `running` to `failed` — the prior Ralph died mid-task.
4. **Write the spawn helper.** `spawn` with `stdio: ["ignore","pipe","pipe"]`,
   capture stdout/stderr to buffers, resolve `{code, stdout, stderr}` on
   `close`. Stream lines to a log file as they arrive. Keep a ref to the
   active child so SIGINT/SIGTERM can forward to it.
5. **Build the sandbox** (when the agent must not own Git/DB/network).
   Prepend a `.safe-bin` dir to `PATH` containing shell shims that block
   mutating git, all `gh`, `npx`, DB/migration `bun`/`bunx` commands, and
   plain `bun test`; exec the real binary for everything else. Set
   `GH_HOST=github.invalid`, `GIT_TERMINAL_PROMPT=0`, `NO_COLOR=1`. This is
   the ownership boundary: the outer Ralph commits; the inner agent never does.
6. **Write the per-task prompt.** State the phase, attach reference docs and
   task files via `@path`, list mandatory behavior, list the forbidden ops
   matching the sandbox, and require a completion sentinel in the final
   response (e.g. `RALPH_FIX_STATUS: COMPLETE`). Require the agent to account
   for every assigned finding/row id by id — the script checks each appears in
   stdout, which is what makes the sentinel worth more than the exit code.
7. **Invoke pi per task.** Args: `-p --approve --model <provider/id>
   --thinking <level> --tools <allowlist> --name <task-session-name>
   @<attachment>… <prompt>`. `--approve` trusts project-local files for the
   one run. `--tools read,bash,edit,write,grep,find,ls` keeps the agent
   capable but bounded. Run in the worktree cwd with the sandbox env.
8. **Gate each task before committing.** In order: parse the sentinel and the
   finding-id coverage from stdout; assert the agent did not change branch or
   HEAD; list changed paths and reject forbidden ones (generated files, DB
   schema, `package.json`, `bun.lock`, `local/`, anything outside `src/` /
   `packages/` / `scripts/`); run `git diff --check`; run focused Vitest on
   the task's tests plus any changed test files; run `bun typecheck`; for the
   final task, run the full suite and compare against a captured baseline.
9. **Commit and advance state.** `git add -A`, re-check staged paths, commit
   with the task's message, record the new HEAD. Mark the task `complete`.
   If any gate throws, mark `failed` with the error and re-throw — the next
   run resumes here.
10. **Make it resumable.** Capture a baseline (typecheck + full suite) once
    before the first task. On a crash mid-task, save the uncommitted worktree
    diff as a checkpoint patch (with sha256) so the next run can verify and
    reapply it, then hand the agent a "complete this preserved work" prompt.

## Reference — pi flags that matter for a Ralph

| Flag | Use |
|------|-----|
| `-p` / `--print` | Non-interactive; print response and exit. Reads piped stdin. |
| `--mode json` | JSONL event stream instead of text. |
| `--mode rpc` | Long-lived JSONL process over stdin/stdout. |
| `--model <provider/id>` | `openai-codex/gpt-5.6-sol`, `sonnet:high`, etc. |
| `--thinking <level>` | `off minimal low medium high xhigh max` |
| `--tools <list>` | Allowlist: `read,bash,edit,write,grep,find,ls` |
| `--exclude-tools <list>` | Drop specific tools, keep the rest. |
| `--name <name>` | Session display name; one per task. |
| `--approve` / `-a` | Trust project-local files for this run (no trust prompt in `-p`). |
| `--no-approve` / `-na` | Ignore project-local files. |
| `--session <id>` / `--no-session` | Resume a specific session, or run ephemeral. |
| `--system-prompt <text>` | Replace the default prompt. |
| `--append-system-prompt` | Append to the default prompt. |
| `@<file>` | Attach a file (text or image) to the message. Repeatable. |

Print mode sets `AI_AGENT=pi` and `PI_CODING_AGENT=true` in the child env so
the inner agent's own bash commands can detect they run inside pi.

## Reference — sandbox shim shape

One shim per blocked command. Allow the safe read-only subset; block the rest
with a distinct exit code (97) so failures are identifiable. Example for git:

```sh
#!/bin/sh
case "$1" in
  diff|show|status|log|rev-parse|merge-base|ls-files|grep|blame|cat-file|describe)
    exec /usr/bin/git "$@" ;;
  *)
    echo "RALPH SANDBOX: blocked mutating/network git: git $*" >&2
    exit 97 ;;
esac
```

Mirror the pattern for `gh` (block all), `npx` (block all), `bun` (block
`db:push`, `db:gen`, `drizzle`, migrations, plain `test`), `bunx` (block
`drizzle`). `chmod 0755` each shim. Resolve real executables with `which` at
setup time, not inside the shim.

## Reference — completion sentinel

The sentinel is what makes a print-mode Ralph deterministic. The agent's
final response must contain a literal token the script searches for, plus an
accounting of every assigned id. The script rejects when:

- exit code ≠ 0,
- the complete sentinel is absent or a failure sentinel is present,
- any assigned id is missing from stdout,
- (audit tasks) any assigned id line still reads "not closed".

This is the lever that turns "the agent said it's done" into "the agent
proved it's done". Write the required format into the prompt verbatim.
