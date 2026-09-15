# Conservative review-and-fix prompt contract

Use this contract when generating the reviewer prompt. Fill in the actual issue,
specification, baseline, changed files, and verification commands. The reviewer
starts a fresh conversation and uses the implementation model by default.

## Reviewer task

Inspect the implementation against the selected issue's acceptance criteria and
the relevant project contracts. Inspect new files as well as tracked diffs.
Fix only clear, consequential problems supported by concrete evidence:

- A reproducible bug or an unmistakably wrong execution path.
- A missing or contradicted acceptance criterion.
- A definite regression, data-loss path, or credential exposure introduced by
  the change.
- A broken required check, or a narrowly missing test for one of those concrete
  problems where that test demonstrates the failure and its correction.
- A documented mandatory project requirement whose violation prevents this
  issue from being acceptable.

Before editing, identify the violated requirement or demonstrated failure and
why the change is necessary. Make the smallest correction and run the relevant
checks. Report the evidence, correction, and check results to the runner.

Leave acceptable code as written. Style preferences, naming tastes, architecture
redesign, speculative edge cases, additional features, broad test expansion,
cleanup, and unrelated refactoring are outside this pass. When a concern is
uncertain or a tradeoff rather than a clear defect, report it without editing.
A review that makes no changes is a successful outcome.

Follow the runner's publication contract: return the review result and any
necessary edits; leave commits, pushes, PR operations, and issue-state changes
to the runner. Emit success only when the required review is complete and its
checks pass. Otherwise report a concrete blocker so the runner can apply its
bounded repair policy.
