# The pair's prompts

`ralph/implement.md` for the worker, `ralph/review.md` for the reviewer. The script appends a `# MESSAGE` section to each: the issue number, the PRD number and, for the reviewer, the start commit.

Start from the two templates below and fill each `<<slot>>`:

- `<<repo rules>>` — the handful of repo conventions an agent most often breaks. The agent reads AGENTS.md / CLAUDE.md itself; name only the ones worth repeating.
- `<<offline rules>>` — one bullet per thing the container cannot do, each with what to do instead (e.g. edit the schema and regenerate types; the engineer pushes the database after the whole PRD).
- `<<gate>>` — the gate commands, exactly as the script runs them, so "passing" means the same thing to worker, reviewer and script.
- `<<tests>>` — how to run a single test file, and which broad commands to leave alone because they are already red.

Keep the trailer, the sentinels and the "this slice only" rule word for word: the script depends on the first two, and the third is what keeps slices from colliding.

## implement.md

````markdown
# TASK

Implement the GitHub issue whose number is given in the message below. It is one vertical slice of the parent PRD issue given in the message below.

1. Read the issue with comments: `gh issue view <N> --comments`.
2. Read the parent PRD: `gh issue view <PRD> --comments`.
3. Earlier slices of the same PRD may already be implemented on this branch. See what they did: `git log --grep "^Refs: #" --format="%H %s%n%b"` and inspect relevant commits.

Only work on this one issue. Do not start later slices, even where you notice they are needed.

Explore the code the issue touches before editing, including existing tests near it.

# CONTEXT

Read and follow the repo instructions in AGENTS.md and CLAUDE.md. In particular: <<repo rules>>

# ENVIRONMENT

You are in a Docker container with the repository mounted at /workspace, on the branch that will receive your commits.

- The `.env*` files contain fake values. There is no database, no cloud account and no third-party API access. Never try to reach them.
<<offline rules>>
- Leave `ralph/` and every `.env*` file as they are.
- The working tree may hold untracked files that belong to the engineer. Stage only the files you changed for this issue, by path; never `git add -A` or `git add .`.
- Do not push, open PRs, or close issues.

# FEEDBACK LOOPS

These must pass before you commit:

<<gate>>

<<tests>> Where the issue asks for tests (or the change has pure logic worth testing), write them and run just those. Your tests must pass.

# COMMIT

Make one or more commits using conventional commit messages (e.g. `feat(<scope>): add provider registry`). Each commit message body must end with this trailer line, exactly:

```
Refs: #<N>
```

Do not add a Co-Authored-By trailer.

The body should briefly note key decisions and anything the next slice needs to know.

# FINISH

If every acceptance criterion is met and committed, output `<promise>COMPLETE</promise>`.

If you are genuinely blocked, commit whatever compiles, leave a comment on the issue (`gh issue comment <N>`) explaining what is missing, and output `<promise>BLOCKED</promise>`.
````

## review.md

````markdown
# TASK

You are the second check on a GitHub issue that another agent just implemented. The message below gives the issue number `<N>`, the parent PRD issue `<PRD>`, and the commit `<START>` the work began from.

1. Read the issue with comments: `gh issue view <N> --comments`.
2. Read the parent PRD: `gh issue view <PRD> --comments`.
3. Read the full change: `git log <START>..HEAD` and `git diff <START>..HEAD`.

# REVIEW

Check two things, in this order.

**Spec.** Go through the issue's acceptance criteria one by one. For each, find the code (and test, where required) that satisfies it. Look for criteria that were missed, half-done, or done differently from what the issue and PRD describe. Look for things the issue said to delete that still have references (`rg` for them).

**Standards.** Check the change against AGENTS.md and CLAUDE.md: <<repo rules>>, naming and structure consistent with surrounding code, no dead code, no needless complexity or abstraction. Check for real bugs: wrong conditions, missing awaits, unhandled cases, security gaps in entitlement/permission checks.

Do not rewrite working code to taste. Do not expand scope beyond the issue.

# ENVIRONMENT

You are in a Docker container with the repository mounted at /workspace.

- The `.env*` files contain fake values. There is no database, no cloud account and no third-party API access.
<<offline rules>>
- Leave `ralph/` and every `.env*` file as they are.
- The working tree may hold untracked files that belong to the engineer. Stage only the files you changed for this issue, by path; never `git add -A` or `git add .`.
- Do not push, open PRs, or close issues.

# FIX

Fix what you find directly. Then these must pass:

<<gate>>
- the tests added for this issue. <<tests>>

Commit with a conventional message like `fix(<scope>): address review of #<N>`. The body lists what you fixed and must end with this trailer line, exactly:

```
Refs: #<N>
```

Do not add a Co-Authored-By trailer.

If nothing needs fixing, do not commit.

# FINISH

Output a short summary of what you checked and fixed, then `<promise>COMPLETE</promise>`.
````
