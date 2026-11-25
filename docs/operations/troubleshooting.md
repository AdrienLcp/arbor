# When a step breaks

Find the step, read its log, apply the fix. The pages of each action carry
their own table of errors; this one covers what lies between them.

## Read the failure

A failed CI run:

```powershell
gh run list --limit 5
```

```powershell
gh run view <id> --log-failed
```

Expected: the log of the failing step only. Re-run it once the cause is fixed
— or straight away for a network hiccup:

```powershell
gh run rerun <id> --failed
```

## By step

| Step              | Symptom                                           | Fix                                                                                                                           |
| ----------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| CI `pnpm install` | `ERR_PNPM_OUTDATED_LOCKFILE`                      | `pnpm install` here, commit `pnpm-lock.yaml`, ship.                                                                           |
| CI Lint           | `biome ci` errors                                 | `pnpm lint` here, commit, ship.                                                                                               |
| CI Spell          | `Unknown word`                                    | Fix the typo, or add a real word to `cspell.json` → `words`.                                                                  |
| CI Build or Test  | A failing test or type error                      | Reproduce with `pnpm validate` here; fix; ship.                                                                               |
| CI End-to-end     | A failing Playwright spec                         | Reproduce with `pnpm test:e2e` here; its traces land in `e2e/test-results/`.                                                  |
| CI Lighthouse     | A score under its threshold                       | The run uploads `lighthouse-reports` as an artifact: download it from the run page, or reproduce with `pnpm lighthouse` here. |
| CI actionlint     | An error in `.github/workflows/ci.yml`            | Fix the expression or key it names; the deploy waits on this job.                                                             |
| CI deploy         | Step _Deploy_ skipped                             | A newer commit reached `main` before this run's deploy: that run deploys instead. Nothing to fix.                             |
| CI deploy         | `it's necessary to set a CLOUDFLARE_API_TOKEN`    | The repository lacks its secrets: `pnpm secrets:sync` ([secrets.md](secrets.md)), then `gh run rerun <id>`.                   |
| CI deploy         | `Authentication error [code: 10000]`              | The Cloudflare token expired or lost a permission: renew it ([secrets.md](secrets.md)).                                       |
| CI deploy         | `required secrets have not been set: ADMIN_KEY`   | The Worker lacks its secret, or was deleted: [hosting.md](hosting.md).                                                        |
| Site              | Old version still showing                         | Hard-reload. Check the CI run deployed the commit you expect.                                                                 |
| Site              | Blank page, console errors                        | Undo the deploy ([deploying.md](deploying.md)), then reproduce locally with `pnpm dev`.                                       |
| Any script        | A `Bitwarden …` message                           | [secrets.md](secrets.md), _Common errors_.                                                                                    |
| Any script        | `pnpm: command not found` or a wrong pnpm version | `corepack enable`, open a new terminal.                                                                                       |

## Still stuck

- Cloudflare status: https://www.cloudflarestatus.com — GitHub:
  https://www.githubstatus.com
- Deploy by hand, from a clean clone of `main`, with the token read from
  Bitwarden: [hosting.md](hosting.md), _Deploy by hand_.
