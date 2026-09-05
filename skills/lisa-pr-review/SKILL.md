---
name: lisa-pr-review
description: Reviews LISA PRs into non-production branches.
disable-model-invocation: true
---

There is a PR. You need to review it, and produce a report back to the user.

## Report mode

Two modes, selected by user request. If neither is explicitly mentioned, assume **screen** mode.

- **Screen mode (default):** Use the pre-existing reporting method — the `show-report` skill.
- **Print mode:** Read the `print-mode-html` skill and follow it to produce and deliver the review report.

You should not make any changes to the code, PR, or Ticket unless explicitly stated as such.

This PR has a base branch that will be tested relentlessly if merged, so feel free to be more lax.

The PR may reference linear tickets. Feel free to use the linear CLI to get more context on the ticket
the PR is mentioning.

Here are some of the things you can suggest in your report:
 - code_fix: If an issue is super small, then the user can just make a commit to the other dev's branch
 and fix the PR. No big issue.
 - PR-Ticket: If there is a problem that needs fixing, but the problem isn't really blocking - we can 
 simply create a PR-Ticket for it. A PR-Ticket is a Linear Ticket that the developer who made the PR will 
 handle after the PR is merged. It can tell the dev to fix issues from a past PR in a new PR. All PR 
 Tickets have their titles prefixed with exactly "PR-Ticket: ". We also should set the deadline to the next
 Friday. We also should set the priority to Urgent. (We haven't been disciplined about the urgency and deadline
 in the past. We should be disciplined now.) Feel free to look at past PR-Tickets if you want more context.
 - db-change ticket: If the PR's diff changes files under `src/server/db/schema/`, the PR
 should also add a db-change ticket under `docs/db-changes/pending/` (preferred — committed
 on the branch so it ships with the PR), or at least reference one from
 `docs/db-changes/pending/` or `docs/db-changes/done/` in its title/description. Work that
 destroys, transforms, or reinterprets production data (backfills, mass edits, destructive
 db:push drops, enum/constraint changes) needs a db-change ticket — see the `db-change`
 skill. Purely additive schema changes don't need one.
 - Closing PR: If the issues in the PR are fundamental, we can block the merging of the PR until they are fixed.
 This is reserved for fundamental issues with implementation, or incredibly bad code smell like using `as any` not
 to get around small annoying issues, but to hide the fact that the underlying code is just wrong, etc.


After looking at the PR, Linear issue, codebase, and any other useful context, produce a report on PR status and recommended actions using the selected report mode.

A few things:
 - Do not mess with the state of git in the current directory. You have to assume that another user or agent is
 working in the current directory
 - Like we said, don't make any linear comments, github comments, git commits, or anything like that unless explicitly
 told to do so
