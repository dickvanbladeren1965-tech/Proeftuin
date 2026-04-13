## Tech Stack
- Primary tech stack: Next.js (14+) with TypeScript, Python for scripting/research tasks. Use Next.js 14-compatible configurations (e.g., `next.config.mjs` not `next.config.ts` unless confirmed supported).

## Git & GitHub
- When pushing to GitHub, always run `git remote -v` first to verify the remote exists and is correct. If a previous push failed or the repo was deleted/recreated, do not assume prior state — re-check everything.

## Environment Constraints
- Interactive terminal commands (e.g., `gh auth login`, `winget install`) cannot run inside Claude's bash tool. Always instruct the user to run these manually in their own terminal and confirm completion before proceeding.
- Windows PATH may not include tools installed outside Claude's session (Node.js, gh, Python). When a command is not found, suggest the user restart Claude Code or provide the full path.

## Environment State
_Last verified: 

| Tool    | Version / Status |
|---------|-----------------|
| git     | git version 2.53.0.windows.2 |
| gh      | gh version 2.89.0 (2026-03-26) |
| gh auth | authenticated as dickvanbladeren1965-tech |
| node    | v24.14.1 |
| npm     | 11.11.0 |
| python  | Python 3.12.10 |

- Shell: PowerShell + Git Bash (Windows)
- Node: LTS via winget / nodejs.org
- Python: 3.12 via winget / python.org
