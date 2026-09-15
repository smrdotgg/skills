# Execution and recovery contract

## Per-issue lifecycle

Maintain durable states equivalent to:

selected → ready → implementing → checking → reviewing → checking → publishing
→ published

Also distinguish blocked dependencies, exhausted/failed attempts, and
interrupted work. A passing review and actual checks must cover the exact tree
being published, not an earlier revision.

1. Select ready work from the confirmed graph. Give an agent one issue, its
   acceptance criteria, relevant specification, and bounded context.
2. Run implementation in the assigned workspace. Capture output and exit state.
3. Execute the agreed checks independently of the agent's claims.
4. Run a fresh conservative review session over the implementation diff and new
   files. Use review.md for its contract.
5. Execute the checks again after any reviewer edits.
6. Publish through runner-controlled Git/tracker operations under the approved
   delivery policy. Record exact commit/tree, branch, and PR receipts.
7. Mark runner completion at the publication milestone defined in delivery.md.
   Recompute readiness for dependents and independent issues.

Keep issue selection, state transitions, verification results, retries, commits,
pushes, PR creation, and optional merges in deterministic runner logic. Agents
may propose explanations and fixes; their output is not authority to expand the
queue or change delivery policy.

## Failure and repair

Budget two repair attempts per issue by default, beyond its initial attempt.
Feed concrete failed-check output or review findings back to the appropriate
agent. Persist attempts so restarting cannot reset the budget indefinitely.
Recheck repaired content and obtain the required review before publication.
Provider/network retries should be bounded separately and must not duplicate
commits or PRs after uncertain remote success.

After exhaustion, preserve the issue's work and failure report, block its
dependents, and schedule independent ready issues. If nothing is ready, report
published, failed, and blocked issues separately and exit rather than spinning.
Never treat an entirely blocked backlog as successful completion of all issues.

### Shared-checkout failures

Continuing independent work requires a clean, verified base. Before moving past
a failed issue in a shared checkout, preserve its tracked **and untracked** work
in the approved recovery mechanism, such as a named stash or complete checkpoint,
and restore the last verified state. Resume its changes deliberately later.

If safe isolation is unavailable, pause that shared-checkout group and continue
other isolated groups. Failed issue changes must not enter another issue's
commit. Include the isolation strategy in the execution-map approval.

## Durable progress

- Lock shared mutable resources so two runner processes cannot write the same
  checkout or issue state concurrently. Preserve useful state on cancellation.
- Write state atomically and record intent before non-atomic publication steps.
  Retain issue identity, pinned bases, verified tree/commit, phase, attempts,
  publication identifiers, and logs needed to resume.
- Recover an interrupted commit only when its parent/tree match the recorded
  verified intent. Reconcile uncertain push/PR creation with the remote before
  retrying. Reuse existing verified commits and matching PRs.
- Before publication or its retry, verify that the recorded content and actual
  local/remote heads still satisfy the approved plan. An unrelated descendant
  of a verified commit is not automatically verified.
- Detect independent branch edits and changed stack parents. Pause affected
  work for reconciliation rather than overwriting it or publishing extra work.
- Preserve failed/interrupted workspaces. Document normal stopping, restarting,
  and stale-lock recovery without discarding another live process's work.

## Runner checks versus project checks

Use the project's real acceptance commands inside its execution environment.
The Bun/TypeScript runner may orchestrate Python, Rust, Go, or any other project.
Do not substitute a successful runner type-check for application verification.

Capture nonzero exits, missing completion, timeouts, and aborted processes as
distinct failures where helpful. Final markers are coordination signals, never
proof of passing tests or permission to publish unverified content.
