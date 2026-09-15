---
name: orchestrate-issues
description: Generate issue-driven agent orchestration scripts. Use when the user wants a runner to process a backlog through coding agents, with direct-branch commits, independent PRs, stacked PRs, or mixed delivery workflows.
---

# Orchestrate issues

Build a small, repo-specific tool that drives coding agents through an approved
issue graph. This skill creates and verifies the runner; execute the backlog
only when the user explicitly asks to launch it.

## Defaults

- Write the runner in **Bun and TypeScript**. Use the target project's own
  language, package manager, checks, and conventions for its implementation.
- Use **Pi** as the agent harness. OpenCode is an available alternative.
- Confirm the model and reasoning level for each runner. Use the same model
  and reasoning setting for implementation and review unless overridden.
- Choose the orchestration engine for the task. Prefer **Sandcastle with Docker**
  for sandbox/worktree management; a direct headless script suits simpler host
  workflows. Explain the choice briefly and include it in the approval map.
- Run sequentially by default. Concurrency is configurable across isolated
  workspaces; serialize writes to any shared branch/checkout.
- Use **PR delivery** by default: independent issues target the selected branch;
  dependent PR issues form stacks. Commit-only delivery is an explicit choice.
- Use implementation → executable checks → fresh conservative review-and-fix
  session → executable checks. Allow implementation-only when requested.
- Allow **two repair attempts per issue**, shared across failed implementation,
  review, and verification phases. Preserve work and block the issue when the
  budget is exhausted; continue independent ready issues.
- Freeze the selected issue set. Queue changes and automatic merging require
  explicit user direction. Refresh publication status and dependency readiness.

## 1. Establish the run contract

Use the conversation and repository first. Fetch the selected issues, their
parent specifications, and relevant comments. Inspect the project's documented
checks and available tools. Ask only for decisions or missing information that
cannot be discovered.

Resolve:

1. Repository/tracker, selected issues, context-only specifications, and HITL
   exclusions. A parent PRD is context, not an implementation task.
2. Explicit dependencies from tracker relationships or Blocked by sections.
   Present inferred additional edges for confirmation. Flag missing or ambiguous
   prerequisites and cycles; keep unaffected issues runnable.
3. Harness, model/reasoning, orchestration engine, sandbox, and authentication
   approach. Consult [engines.md](engines.md) when selecting or wiring the engine;
   it explains Sandcastle without assuming prior familiarity.
4. Delivery mode and target for each issue/group: shared-branch commits,
   independent PRs, stacked PRs, or a mixture. Consult
   [delivery.md](delivery.md) for branch readiness and publication semantics.
5. Concurrency, executable checks, repair budget, issue completion semantics,
   and where progress/failed work will be retained.

Reuse settled choices. For unresolved design decisions, use the grilling skill:
ask the currently answerable questions together, with recommendations, then wait.

**Completion criterion:** the selected work, prerequisites, delivery choices,
execution environment, and verification commands can be written down concretely.

## 2. Obtain execution-map approval

Before creating the script, show the user an explicit map. Include a row per
issue, grouping only when every member has the same policy:

| Issue | Dependencies | Delivery | Work branch / checkout | PR base or push target | Ready after | Concurrency group |
| --- | --- | --- | --- | --- | --- | --- |

Alongside the map, state:

- Fixed queue and context-only/HITL exclusions.
- Harness, model, reasoning, engine, and sandbox.
- Implement/review sequence and the actual check commands.
- Repair budget, behavior after failure, and failed-work isolation strategy.
- Publication/completion rules, tracker updates, and merge policy.
- State location, resume behavior, and whether the request includes launching.

Make stacks visually explicit: e.g. issue B's PR targets issue A's branch,
while A's PR targets preview. Explain any mixed-mode edge whose prerequisite
code is not yet available on its intended base.

**Wait for explicit approval of this map before writing the runner.** Apply
corrections and confirm the revised choices; do not silently pick a different
branch, target, or merge policy during implementation.

## 3. Generate the smallest complete runner

Read [runtime.md](runtime.md) for the execution and recovery contract. Generate
only the machinery the approved map needs: a runner, concise agent prompts,
configuration where useful, ignored runtime state/logs, and launch instructions.
Reuse existing project tooling. Avoid building a general-purpose framework.

The **runner** owns scheduling, checks, state, and publication. The **agent**
implements the specific selected issue. Pass the issue and its specification
directly; queue discovery and dependency decisions belong to the runner.

Use [review.md](review.md) when writing the reviewer prompt. The reviewer starts
with fresh context and may fix only concrete, necessary correctness problems.

Keep issue IDs, repository names, branch targets, selected models, credentials,
and check commands specific to the generated run, not embedded in this skill.
Resolve authentication from the user's approved existing mechanism and exclude
credential files from source control. Configure sandbox tools for the actual
project rather than assuming the runner's Bun/TypeScript tooling applies to it.

**Completion criterion:** every approved row has an executable path from ready
issue through verification to the agreed publication outcome, including failure
and restart handling.

## 4. Verify without draining the backlog

- Validate the frozen queue, dependency graph, target branches, and model ID.
- Type-check the runner and run relevant existing checks.
- Provide a dry-run/check command that displays scheduling and publication
  decisions without implementing, committing, pushing, or creating PRs.
- Where available, exercise the real sandbox and a minimal model-connectivity
  request. Report unavailable authentication/environment checks accurately.
- Verify the important orchestration behaviors with controlled dependencies or
  isolated fixtures: blocked dependencies, independent continuation, failed
  checks preventing publication, and restart without duplicate publication.
  Keep verification proportional to this runner; use approved testing seams.
- Distinguish setup verification from application acceptance. A starter project
  may have no tests yet; the first implementation must establish the required
  checks rather than relaxing its publication gate.

**Completion criterion:** report exactly what was exercised, remaining blockers,
and the command that launches the approved workload. Start it only if requested.

## 5. Hand off

Give the launch command, log/progress locations, stop/resume instructions, and a
short reminder of branch/PR behavior. State whether the workload has started.
If explicitly launching, execute the approved runner and report its observable
state. Distinguish blocked work, published work, and exhausted/failed attempts.
