# Delivery, readiness, and completion

## Publication is runner completion

Track execution state independently from the issue tracker's open/closed state.
In particular, an open issue may already have a successfully published PR.

| Delivery | Published when | Runner records |
| --- | --- | --- |
| Commit-only | Verified commit successfully pushed to its approved branch | Commit SHA and remote branch |
| Independent PR | Verified branch pushed and PR opened against its approved target | Head SHA, PR identity/URL, and base |
| Stacked PR | Verified child branch pushed and PR opened against its approved parent branch | Head SHA, PR identity/URL, and parent/base |

PR bodies reference their issues, for example **Refs #42**. Leave the issues
open; do not manually close them or silently introduce auto-closing keywords.
For commit-only work, record the pushed commit and reference the issue in its
commit message. Tracker closure is a separately requested policy, not an
implicit consequence of local runner completion.

Opening a PR completes that issue's normal runner workload. Merging remains the
user's responsibility unless they explicitly enabled automatic merging.

## Readiness is about prerequisite code

An issue is ready only when every confirmed prerequisite has reached the
required state **and its verified code is available on the issue's chosen base**.
Do not use issue closure, a model's completion marker, or a PR's existence alone
as proof of that code relationship. Retain branch/commit publication receipts.

- **Shared-branch commit-only:** execute serially on the approved branch. Each
  new issue starts from the previous successfully verified/pushed state.
- **Independent PRs:** use isolated workspaces based on the selected integration
  branch. Give each issue a stable branch name and open its PR to that target.
- **Stacks:** finish verification and publication of the parent before starting
  the child. Branch the child from the recorded parent head and target the
  child's PR at the parent's branch. Parent and child implementations never run
  in parallel. Sibling branches may run concurrently when approved and isolated.
- **Mixed modes:** evaluate each dependency against the actual base. A published
  but unmerged parent PR does not make its code available on main for a dependent
  main-only commit. Resolve that edge in the approved map: an appropriate shared
  feature base, a stacked PR, or a wait for user integration. Do not silently
  merge/cherry-pick to make an incompatible map runnable.

Declare branch targets explicitly. The name main, preview, or feature does not
itself authorize a push, merge, or policy change. A rejected protected-branch
push blocks that publication; preserve work and report it.

## Stack lifecycle

By default, the runner finishes after publishing its selected work. Ongoing
restacking, review monitoring, and merge handling are outside that run.

While a child is in progress, pin its parent head. If the parent changes before
the child is published, or changed across a restart, pause the child for
reconciliation and continue independent ready issues. Avoid modifying a parent's
published branch merely to unblock the child.

When the user explicitly requests automated stack maintenance or merging, agree
its policy separately: eligible PRs, required checks, merge order/method, base
updates after parent merges, revalidation after rebases, conflict handling, and
behavior under external edits. Automatic merging is never inferred from AFK
execution or from a branch being unprotected.

## Queue identity and restart

Use stable issue IDs, branches, and publication receipts. On restart, reconcile
the local record against actual remote branch/PR state before creating or
publishing anything. Reuse the existing PR for the issue/run mapping; do not
create another because its tracker issue remains open. A remote operation may
have succeeded even if the process died before writing its local receipt.

Freeze issue membership and approved delivery mappings. Refresh statuses and
detect changed prerequisites; additions, removals, or topology changes require
an explicit plan update. Context-only specifications and HITL tasks stay out of
the execution queue.
