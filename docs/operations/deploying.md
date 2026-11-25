# Deploying

The CI workflow, `.github/workflows/ci.yml`, checks every push to `main`: its
`validate` job runs lint, spelling, build, unit tests, end-to-end tests and
Lighthouse, its `actionlint` job lints the workflows. Once both pass, the
`deploy` job builds again and runs `wrangler deploy` for the Worker `arbor`,
which serves the web app and the API together. Shipping is pushing; nothing is
built or deployed from this machine.

Runs on `main` are never cancelled: each push runs to its end. A run whose
commit is no longer the head of `main` when it reaches its deploy skips it, so
an older commit never replaces a newer one.

## Ship — `pnpm ship`

Prerequisites: on `main`, everything committed, `origin/main` pulled,
`pnpm validate` green.

```powershell
pnpm ship
```

Expected: `git push` output, then `ship: pushed; watching CI run <id>`, the
run's jobs ticking green, and `ship: deployed to https://arbor.adrienlcp.com`.
Open the site and check the change.

| Error                                         | Fix                                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `only main deploys`                           | `git switch main`, merge or cherry-pick the work there.                                                  |
| `the working tree has uncommitted changes`    | Commit (or `git stash`) first.                                                                           |
| `origin/main has commits this checkout lacks` | `git pull --rebase`, then `pnpm validate`, then `pnpm ship`.                                             |
| `nothing to ship`                             | Every commit is already pushed. To re-deploy the same commit, re-run its CI run: `gh run rerun <id>`.    |
| `the CI run failed`                           | Open the run link it prints; see [troubleshooting.md](troubleshooting.md).                               |
| `pushed; follow the deploy on …/actions`      | `gh` is missing or logged out; the push is done, watch the page. `gh auth login` fixes it for next time. |

`ship: deployed` means the run passed. When another push landed on `main`
meanwhile, this run skipped its deploy and the newer run deploys instead.

## Undo a deploy

The way that leaves the history right: revert the commit and ship.

```powershell
git revert <commit>
```

```powershell
pnpm ship
```

Faster, while the fix is prepared: Cloudflare dashboard → _Workers & Pages →
arbor → Deployments_, a previous version → _Rollback_. The next deploy
replaces the rollback.

A rollback brings back code, not data: each family lives in its Durable Object
and is left as it is. A deploy that changed the `migrations` of
`apps/worker/wrangler.jsonc` is not undone by either way: read the comment
above them before touching them.
