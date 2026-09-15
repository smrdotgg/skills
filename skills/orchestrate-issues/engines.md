# Engine selection and integration

## Sandcastle: what it is

Sandcastle (`@ai-hero/sandcastle`) is a TypeScript orchestration library. It
launches coding agents through providers such as Pi and OpenCode, manages
sandbox lifecycles, and supports direct-checkout or Git-worktree execution.
It also supplies streamed logging, timeouts, completion signals, and commit
collection. The surrounding script still owns this run's issue graph,
verification gates, publication policy, and restart state.

Primary source: https://github.com/mattpocock/sandcastle

When choosing Sandcastle:

1. Read the installed version's README/exported types, a supplied checkout, or
   current upstream documentation. Pin the version used by the generated tool.
2. Use Docker by default. Check daemon availability and build a project-capable
   image containing the selected agent CLI and required development tooling.
   Verify agent/model availability and authentication inside that image.
3. Set the branch strategy explicitly. For direct shared-checkout execution,
   verify the version's head strategy. For independent or stacked PR work, use
   separately named workspaces/branches with the approved base commits.
4. Check which API actually owns worktrees and which accepts head execution.
   For example, an API requiring a named branch may implicitly create a worktree;
   it is unsuitable when the user explicitly requested no extra branches.
5. Confirm authentication mounts/copies, UID permissions, native dependency
   locations, and session storage against the selected agent and host/sandbox
   paths. Keep host and sandbox dependency installs compatible with their OSes.
6. Run executable checks through the sandbox and inspect their real exit codes.
   A completion signal or collected commit is not proof of passing checks.

Stock templates are examples to adapt. Inspect their issue filters, test commands,
branch behavior, merge steps, and issue-closing instructions against the approved
map. Do not inherit agent-driven queue selection or issue closure accidentally.
Sandcastle's template loop is not the confirmed dependency scheduler.

## Direct headless execution

For Pi, load the **pi-headless** skill; for OpenCode, load **opencode-headless**
and consult the relevant current documentation. Verify the executable and flags
actually installed rather than copying stale commands. Resolve the chosen model
ID through the harness's available-model listing where supported.

The Bun/TypeScript runner owns subprocess lifecycle, working directories, logs,
exit status, timeouts/cancellation, and the runtime contract in runtime.md.
Use print mode for simple one-shot work, JSON events when structured lifecycle
information is needed, and persistent/RPC sessions only when the workflow needs
them. A fresh reviewer does not resume the implementation conversation.

Select the reasoning level explicitly where supported. Add approval/trust flags
only when the selected harness/version and user policy require them. Verify that
the chosen setup can run unattended; do not assume one provider's permission or
session conventions apply to another.

## Choosing between them

Prefer Sandcastle when Docker or worktree management would otherwise become a
significant part of the script. A direct headless runner is reasonable for a
small host-based serial workflow or capabilities the library does not support.
Explain the tradeoff and confirm the choice in the execution map. Keep either
choice replaceable at the agent-execution interface without inventing a provider
framework for a one-off script.
