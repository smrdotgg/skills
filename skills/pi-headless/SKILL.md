---
name: pi-headless
disable-model-invocation: true
description: Invoke pi headlessly from a script or shell — print, JSON, and RPC modes.
---

# pi headless

Run pi without the TUI: one-shot print, streaming JSON events, or a long-lived
RPC process. Pick by what you need back.

## Print mode — text in, text out

```bash
pi -p "Summarize this codebase"
cat README.md | pi -p "Summarize this text"
pi --name "release audit" -p "Audit this repository"
pi -p @screenshot.png "What's in this image?"
pi @code.ts @test.ts -p "Review these files"
```

`-p` / `--print` prints the response and exits. Piped stdin merges into the
initial prompt. Prefix files with `@` to attach them (text or image). Exit
code is pass/fail. Use when you only care that it's done and what it said.

In a script, capture stdout/stderr and the exit code; treat the code as
pass/fail. Print mode sets `AI_AGENT=pi` and `PI_CODING_AGENT=true` in the
child env so commands the inner agent runs can detect they're inside pi.

## JSON mode — structured event stream

```bash
pi --mode json "Your prompt"
```

Emits session events as JSON lines on stdout. Reach for this when print's
text is too coarse: you need to react to tool calls, capture usage, or pull
structured content per message. Key events: `tool_execution_start`,
`tool_execution_end`, `message_start`, `message_update`, `message_end`,
`turn_end`, `agent_end`.

## RPC mode — long-lived JSONL process

```bash
pi --mode rpc [options]
```

JSONL over stdin/stdout, many prompts per process. One command per line, LF
only (do not use Node `readline` — it splits on U+2028/U+2029, which are
valid inside JSON strings). Use when one process must serve multiple turns or
embed in another app. For a Node/Bun app, prefer importing `AgentSession`
from `@earendil-works/pi-coding-agent` over spawning a subprocess; RPC is the
subprocess fallback.

## Flags that matter headless

| Flag | Use |
|------|-----|
| `-p` / `--print` | Non-interactive; print response and exit. |
| `--mode json` | JSONL event stream instead of text. |
| `--mode rpc` | Long-lived JSONL process over stdin/stdout. |
| `--model <provider/id>` | `openai-codex/gpt-5.6-sol`, `sonnet:high`, etc. |
| `--thinking <level>` | `off minimal low medium high xhigh max` |
| `--tools <list>` | Allowlist: `read,bash,edit,write,grep,find,ls` |
| `--exclude-tools <list>` | Drop specific tools, keep the rest. |
| `--name <name>` | Session display name. |
| `--approve` / `-a` | Trust project-local files for this run (no trust prompt in `-p`). |
| `--no-approve` / `-na` | Ignore project-local files. |
| `--session <id>` / `--no-session` | Resume a session, or run ephemeral. |
| `--system-prompt <text>` | Replace the default prompt. |
| `--append-system-prompt <text>` | Append to the default prompt. |
| `@<file>` | Attach a file (text or image) to the message. Repeatable. |

## Locating the executable

Resolve once, reuse: `PI_EXECUTABLE` env → `~/.pi/runtime/bin/pi` → bare `pi`.
Never hardcode a path.
