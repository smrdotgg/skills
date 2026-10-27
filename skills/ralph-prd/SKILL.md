---
name: ralph-prd
disable-model-invocation: true
description: Point it at a PRD issue. Sets up a Ralph, ready for you to launch, that implements the PRD's AFK slices one by one with a Codex worker/reviewer pair and pings Telegram.
---

# Ralph a PRD

The user has a PRD already broken into **slices** (GitHub issues) and wants to walk away while they get built. Set up a **Ralph**: an outer script that owns the repo and walks the slices in order. Each slice goes to a **worker/reviewer pair** of headless Codex runs — the worker implements and commits, a fresh reviewer checks the diff against the issue and fixes what it finds. Then the script runs the **gate**, closes the issue, and pings the user on Telegram.

The script is the authority; every Codex run is disposable and judged by its commits. You write the Ralph from this skill, for this repo and this PRD. The slices are the pair's work, never yours.

**Set up only.** Your work ends at a proven Ralph and the launch command handed to the user. The user starts the loop; you never do, not even for one slice. The single thing you execute is the script's `--check` mode, which starts no Codex run.

What the user expects without being asked:

- **AFK slices only.** A **HITL** slice needs a human, so no agent gets it: the Ralph pings Telegram when it reaches one and carries on with every slice that does not wait on it.
- Commits land on the current branch. Pushing and PRs stay with the user.
- Telegram is how the user hears anything once it is running: each slice's progress, every stop, the finish.
- The Ralph lives in `ralph/` at the repo root, kept out of git through `.git/info/exclude`. A `ralph/` left by an earlier PRD is the starting point: keep what is specific to the repo and still true (toolchain, fake env, gate), rewrite the rest to this skill.

## Steps

1. **Read the PRD and every slice.** `gh issue view <prd> --comments`, then find its slices: issues whose body names the PRD as parent (`gh issue list --state all --limit 200 --search '"Parent PRD" <prd> in:body' --json number,state,title,body`, keeping only bodies that really point at this PRD), or its sub-issues. For each slice record state, blockers (`Blocked by #N`), and AFK or HITL: as the issue marks it; unmarked, it is AFK unless the issue itself calls for a human decision, review, or manual step. Order them blockers first, then by issue number.
   Done when every slice of the PRD is in an ordered list with state, blockers and type, and each HITL has a one-line reason. No slices: stop and tell the user the PRD needs breaking down first.

2. **Learn the repo's gate and limits.** The gate is the list of commands that must pass for a slice to count: take them from CI config, package scripts, AGENTS.md / CLAUDE.md. Every gate command must already pass on HEAD; a check that is red today (a suite with old failures) stays out of the gate, and the worker is told to run only the tests it writes. Also find what the app needs in order to start with no real secrets (env validation → fake values), and what an offline agent must leave to the user (database pushes, migrations, deploys) with the substitute for each.
   Done when you hold the gate commands, the fake env keys, and the offline rules.

3. **Write the Ralph** in `ralph/`: the loop script ([LOOP.md](LOOP.md)), the container and the Codex call ([CODEX.md](CODEX.md)), the two prompts ([PROMPTS.md](PROMPTS.md)). Read all three before writing; each holds decisions the others assume.
   Done when `ralph/` holds the script, Dockerfile, both prompts, the fake env where needed, and `ralph/` is listed in `.git/info/exclude`.

4. **Prove it** with the script's `--check` mode: image builds, Codex is logged in inside the container, dependencies install, the gate is green on HEAD. It starts no Codex run and sends no Telegram. Fix the Ralph, or narrow the gate, until it passes.
   Done when `--check` exits 0.

5. **Hand over.** Tell the user, in one message: the slices in order with AFK/HITL and the reason for each HITL, the branch the commits will land on, the gate, the model, and the command that starts the loop, detached so it outlives their terminal:
   `mkdir -p ralph/logs/<prd> && setsid nohup bun ralph/run.ts > ralph/logs/<prd>/console.log 2>&1 &`
   Add where the logs are, and that running the same command again resumes after any stop. Name anything the user should settle before launching: the branch is the repo's default, tracked files are dirty, or no AFK slice is open.
   Done when that message is sent. Stop there; launching is the user's move.
