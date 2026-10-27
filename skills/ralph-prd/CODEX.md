# Codex in a container

Each worker or reviewer is one `codex exec` inside a Docker container. Approvals and Codex's own sandbox are off, so the container is the sandbox: the agent sees the repo and fake secrets, nothing else of the host.

## One run

```bash
docker run --rm -i <mounts and env, below> <image> \
  codex exec --dangerously-bypass-approvals-and-sandbox \
    -m <model> -c 'model_reasoning_effort="high"' \
    -C /workspace \
    -o /workspace/ralph/logs/<prd>/<slug>.last.md \
    -
```

- `exec` is the non-interactive mode. The trailing `-` reads the prompt from stdin, which is why `docker run` needs `-i`. Build the prompt as: the prompt file, then a `# MESSAGE` section with the issue number, the PRD number and (for review) the start commit.
- `-o` writes the agent's **final message** to a file. Read the `<promise>` sentinel from there; stdout is the whole transcript and goes to the log.
- `-m` is always passed: the container's Codex home has no config, so nothing else picks the model. Use the model the user names, else `model` from the host's `~/.codex/config.toml`. Reasoning effort has no flag of its own; it is a `-c` config override whose value is parsed as TOML, hence the inner quotes. The user's Ralphs run at `high`.
- `-C` is the working root.
- `--dangerously-bypass-approvals-and-sandbox` belongs only inside the container.
- Every run is a fresh session. Worker and reviewer share only the repo, the issue and git history, which is what makes the reviewer a real second check. Everything a run needs goes in its prompt.
- Buffer generously when capturing output (hundreds of MB): transcripts are long.

`codex exec --help` is the authority for the installed version.

## Judging a run

Exit code 0 means Codex finished, not that the work is done. Judge by commits since the start commit and by the sentinel in the final message:

- `<promise>COMPLETE</promise>` — the agent's claim of done.
- `<promise>BLOCKED</promise>` — the agent gave up and commented on the issue.

## Auth

`codex login` on the host writes `~/.codex/auth.json`. The container gets its own Codex home, a host directory outside the repo (`~/.cache/ralph/codex-home`), mounted at `/home/agent/.codex`.

The ChatGPT login rotates its refresh token on use. A container that refreshes and then exits would leave the host logged out, so wrap every Codex call:

```ts
function withCodexAuth<T>(fn: () => T): T {
  copyFileSync(HOST_AUTH, CODEX_AUTH);
  try {
    return fn();
  } finally {
    if (lastRefresh(CODEX_AUTH) > lastRefresh(HOST_AUTH)) {
      copyFileSync(CODEX_AUTH, HOST_AUTH);
    }
  }
}
```

`lastRefresh` parses the `last_refresh` timestamp from the JSON file, 0 when absent.

## Image

`ralph/Dockerfile`, built by preflight with the host user's ids (`--build-arg AGENT_UID=$(id -u) --build-arg AGENT_GID=$(id -g)`) so files the agent writes into the mounted repo stay owned by the user:

```dockerfile
FROM node:<lts>-bookworm

RUN apt-get update && apt-get install -y git curl jq unzip ca-certificates ripgrep \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  > /etc/apt/sources.list.d/github-cli.list \
  && apt-get update && apt-get install -y gh && rm -rf /var/lib/apt/lists/*

RUN npm i -g @openai/codex@<host's `codex --version`>

ARG AGENT_UID=1000
ARG AGENT_GID=1000
RUN groupmod -o -g $AGENT_GID node \
  && usermod -o -u $AGENT_UID -g $AGENT_GID -d /home/agent -m -l agent node
USER agent
ENV HOME=/home/agent

# the repo's toolchain, pinned to the versions the repo uses

RUN git config --global --add safe.directory '*' \
  && mkdir -p /home/agent/.codex

WORKDIR /workspace
```

Pin Codex to the host's version so both read the same auth file format.

## Mounts and env

The same `docker run` arguments serve Codex runs, the dependency install and the gate:

| Argument | Why |
|---|---|
| `-v <repo>:/workspace` | The agent commits straight onto the checked-out branch. |
| `-v ~/.cache/ralph/codex-home:/home/agent/.codex` | Auth and sessions. |
| `-v <repo>/ralph/fake.env:/workspace/<f>:ro` for every top-level `.env*` file except `*.example` | The agent never reads real secrets. Create an empty file first where tooling needs one that is absent. With no fake env needed, mount an empty file instead. |
| `-e GH_TOKEN` with `GH_TOKEN=$(gh auth token)` in the spawning process's environment | `gh` inside the container, without the token appearing in the process list. |
| `-e GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL` from the host's `git config` | Commits carry the user's identity. |
| `--mount type=tmpfs,destination=/workspace/<dir>` | Hides a git-ignored directory of private local data, where the repo has one. |
| `-v <common>:<common>`, where `<common>` is `git rev-parse --git-common-dir` resolved to an absolute path | Only when the repo is a linked worktree: its `.git` file points at the main checkout by absolute path. |

`ralph/fake.env` holds made-up values that pass the app's env validation. There is no database, cloud account or paid API behind any of them; the prompts say so.
