---
name: opencode-headless
disable-model-invocation: true
description: Invoke opencode headlessly from a script or shell — `opencode run` in text or JSON event mode.
---

# opencode headless

Run opencode without the TUI via `opencode run`. Text out by default; JSONL
events with `--format json`. Exit code is pass/fail.

## Print mode — text in, text out

```bash
opencode run "Summarize this codebase"
echo "some text" | opencode run "Summarize this"   # stdin merges into the prompt
opencode run --title "release audit" "Audit this repository"
opencode run -f screenshot.png "What's in this image?"
```

Piped stdin merges into the prompt. `-f/--file` attaches files (repeatable).
Use when you only care that it's done and what it said.

**Gotcha:** put the prompt *before* `-f`. The positional message is parsed
after flags, so `run -f x.png "prompt"` treats the prompt as a second file
and fails with `File not found`. Correct order:

```bash
opencode run "What's in this image?" -f screenshot.png
```

## JSON mode — structured event stream

```bash
opencode run --format json "Your prompt"
```

Emits one JSON object per line on stdout. Top-level fields: `type`,
`timestamp`, `sessionID`, `part`. Event types: `step_start`, `text`,
`reasoning`, `tool_use`, `step_finish`.

- `text` / `reasoning` parts carry `.text`.
- `tool_use` part carries `.tool` (e.g. `bash`), `.callID`, and
  `.state` with `status`, `input`, `output`.
- `step_finish` part carries token usage (`.tokens`) and `.cost`.

Reach for this when plain text is too coarse — reacting to tool calls,
capturing usage/cost per turn, or pulling structured content.

## Permissions

Tool use may block on a permission prompt with no TUI to answer it. In
scripts either pre-allow tools in `opencode.json` permissions, or pass
`--auto` (auto-approves everything not explicitly denied — dangerous;
scope it with a dedicated agent + permissions instead when you can).

## Flags that matter headless

| Flag | Use |
|------|-----|
| `--format json` | JSONL event stream instead of formatted text. |
| `-m, --model <provider/model>` | e.g. `anthropic/claude-sonnet-4-6`. |
| `--variant <level>` | Provider-specific reasoning effort (`minimal`…`max`). |
| `--agent <name>` | Use a configured agent. |
| `-c, --continue` | Continue the most recent session. |
| `-s, --session <id>` | Continue a specific session. |
| `--fork` | With `-c`/`-s`: branch instead of appending. |
| `-f, --file <path>` | Attach a file. Prompt must come first. Repeatable. |
| `--title <text>` | Session title (defaults to truncated prompt). |
| `--dir <path>` | Working directory to run in. |
| `--auto` | Auto-approve permissions not explicitly denied (dangerous). |
| `--command <name>` | Run a configured custom command; message holds args. |

## Sessions and transcripts

```bash
opencode session list --format json     # find session IDs
opencode export <sessionID>             # full transcript as JSON (--sanitize to redact)
```

Every `run` creates a session; grab its ID from the first JSON event
(`sessionID`) or from `session list`. Reuse with `-s <id>` for multi-turn
conversations without keeping a process alive.

## Locating the executable

Resolve once, reuse: bare `opencode` on PATH (installed via curl script,
npm, brew, or bun — never hardcode a path).
