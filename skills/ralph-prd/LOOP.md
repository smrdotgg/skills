# The loop

`ralph/run.ts`: one file, TypeScript run with bun, node built-ins only, run from the repo root on the host. Everything specific to this PRD and repo sits in constants at the top:

```ts
const PRD = 557;
const SLICES = [
  { n: 558, hitl: false, blockedBy: [] },
  { n: 559, hitl: false, blockedBy: [] },
  { n: 560, hitl: true, blockedBy: [559] },
  { n: 561, hitl: false, blockedBy: [558, 559, 560] },
];
const GATE = ["bun run lint", "bun run typecheck"];
const MODEL = "<model id>";
const EFFORT = "high";
```

## State

State lives in GitHub and git, with no state file:

- a slice is finished when its issue is **closed**;
- every commit of slice N ends with the trailer `Refs: #<N>`.

That makes the Ralph resumable by re-running it, and redoable by dropping a slice's commits.

## Per slice, in order

Keep a set of **unfinished** slices as you go.

1. Issue closed → skip.
2. `hitl` → ping ✋, add to unfinished, next slice.
3. Any blocker in unfinished → add to unfinished, next slice. No ping; it goes in the finish message.
4. Find the start commit. If commits with `Refs: #<N>` already exist (`git log --reverse --format=%H --grep "^Refs: #<N>$"`), start is the parent of the first one and the worker is skipped: resume at review. Otherwise start is `HEAD`.
5. **Worker.** One Codex run with the implement prompt. Stop if its final message holds `<promise>BLOCKED</promise>`, if it exited non-zero, or if there are no commits since start. Otherwise ping 🛠️.
6. **Reviewer.** A fresh Codex run with the review prompt and the start commit. Stop if it exited non-zero. Zero new commits is fine: it means the review found nothing.
7. **Gate.** Run the gate commands in the container, joined with `&&`. Stop if any fails. A check that covers only the slice's files takes them from `git diff --name-only --diff-filter=d <start>..HEAD`. Also stop if the slice's commits added a file that was untracked when the Ralph started: that is the engineer's file, swept up by a careless `git add`.
8. **Close.** `gh issue close <N> --comment "Implemented on \`<branch>\` in <short shas>."`, then ping ✅.

**Stop** means: ping ❌ with the reason, the tail of the failing output and the logs path, then exit 1. Later slices build on earlier ones, so a failed slice ends the run rather than being skipped. Wrap the whole run so a crash in the script itself also stops this way.

After the last slice, ping 🏁.

## Preflight

Before the first slice, stop on any of:

- `~/.codex/auth.json` missing (the user runs `codex login`);
- tracked files dirty: `git status --porcelain --untracked-files=no` prints anything;
- Docker not running, or with less memory than the repo's checks need;
- image build fails;
- `codex login status` fails inside the container;
- dependency install fails inside the container.

`--check` runs preflight, then the gate against `HEAD`, prints the result and exits, with Telegram off.

## Telegram

`telegram-notify` reads the message from stdin. Send through one helper that also writes the message to the run log and swallows its own failure: a lost ping must never stop the loop. Start every message with the repo name, so pings from two repos stay apart.

| When | Message |
|---|---|
| Reached a HITL slice | ✋ `#N` is HITL and needs you: title, issue URL |
| Worker finished | 🛠️ `#N` implemented (k commits). Starting review. |
| Slice closed | ✅ `#N` implemented and reviewed (k review fix commits, or "review found nothing to fix"). Closed. Then the reviewer's final message, last ~1500 characters |
| Stop | ❌ stopped: reason, output tail, logs path |
| Finish | 🏁 PRD `#P`: slices done, and slices left for the user — each HITL, and each slice waiting on one |

## Logs

`ralph/logs/<PRD>/`:

- `run.log` — the script's timestamped timeline, including every ping. The first place to look.
- `<N>-implement.log`, `<N>-review.log` — full Codex transcript (stdout + stderr).
- `<N>-implement.last.md`, `<N>-review.last.md` — the run's final message.
- `<N>-gate.log`, `preflight-*.log`.
