---
name: lisa-prod-pr-review
description: Reviews LISA PRs targeting production branches.
disable-model-invocation: true
---

# Production PR review

Review a LISA PR targeting a production branch. Produce a production-readiness report; leave code, git, GitHub, and Linear unchanged unless the user explicitly requests an action.

## Process

1. Establish PR scope, target branch, claimed behavior, and referenced Linear issue. Use the Linear CLI when ticket context matters.
2. Read the full diff plus relevant surrounding code, tests, configuration, migrations, and repository guidance.
3. Evaluate changed behavior for correctness, regressions, security, data integrity, operational risk, deployment safety, and adequate tests. Keep findings proportional to concrete impact. Treat style or preference as non-blocking unless it violates a documented standard or creates meaningful maintenance risk.
4. Account for every changed behavior and production risk, then assign one recommended action to each finding:
   - `code_fix`: Small, clear issue to fix on the contributor's branch before merge.
   - `PR-Ticket`: Non-blocking issue the PR author can address after merge. If created, prefix its Linear title with exactly `PR-Ticket: `, set priority to Urgent, and set deadline to next Friday. Consult past PR-Tickets when useful.
   - `Closing PR`: Block merge when the change is unsafe for production or rests on a fundamental implementation flaw. Examples: incorrect core behavior, material security or data-integrity risk, or a type escape such as `as any` concealing an invalid design.
5. Produce the report. Mode is selected by user request; if neither is explicitly mentioned, assume **screen** mode.
   - **Screen mode (default):** Use the `create-report` skill.
   - **Print mode:** Read the `print-mode-html` skill and follow it to produce and deliver the review report.

## Constraints

- Preserve current-directory git state; another user or agent may be working there.
- External systems remain read-only: no comments, status changes, commits, pushes, or ticket edits without explicit user approval.
