---
name: lisa-pr-review
description: How to review PR's into non-production branches (other than main) when working on LISA. Supports two report modes — screen (default) and print. Use print mode when the user asks for a printable, black-and-white-friendly report to read away from a screen.
disable-model-invocation: true
---

There is a PR. You need to review it, and produce a report back to the user.

## Report mode

Two modes, selected by user request. If neither is explicitly mentioned, assume **screen** mode.

- **Screen mode (default):** Use the pre-existing reporting method — the `show-report` skill.
- **Print mode:** The user wants a printable report (e.g. to read at a café on a black-and-white printer). Read the `explain-diff-print` skill and follow every rule in it (black-and-white only, no dark backgrounds, serif/monospace print fonts, page breaks per section, quiz answers in a final section on their own page, self-contained HTML with no external resources, file at `/tmp/YYYY-MM-DD-...`). Apply those rules to the review report. Do not duplicate the rules here; read the skill.

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
 - Closing PR: If the issues in the PR are fundamental, we can block the merging of the PR until they are fixed.
 This is reserved for fundamental issues with implementation, or incredibly bad code smell like using `as any` not
 to get around small annoying issues, but to hide the fact that the underlying code is just wrong, etc.


After looking at the PR and the Linear Issue and the codebase and whatever else you may want to look at, use the
show-report skill to produce a report for the user on the status of the PR, and your recommended actions.

A few things:
 - Do not mess with the state of git in the current directory. You have to assume that another user or agent is
 working in the current directory
 - Like we said, don't make any linear comments, github comments, git commits, or anything like that unless explicitly
 told to do so
