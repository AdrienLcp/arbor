# 01 — Bootstrap

Goal: a workspace where `pnpm validate` passes, CI is green, and an empty page
is served from `https://ramure.adrienlcp.com` by the Worker. No product code.

## Read first

`toolkit/conventions/README.md`, `monorepo.md`, `tooling.md`, `backend.md`;
`toolkit/templates/base/` and `templates/web-app/`. Then Scoreboard as the
working reference for the same stack: `C:/git/scoreboard/apps/worker/wrangler.jsonc`,
its root `package.json` scripts, `.github/workflows/ci.yml` (deploy job) and
the web dev proxy in `apps/web/vite.config.ts`.

## Do

1. Root from `templates/base/`: `package.json` (name `ramure`),
   `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `biome.json` with one import
   group per workspace package (`@ramure/protocol/**`, `@ramure/core/**`),
   `tsconfig.json`, `cspell.json` (+ French genealogy words as they come),
   `.githooks/`, `.nvmrc`, `.editorconfig`. Root scripts fan out with `pnpm -r`.
2. `apps/web` from `templates/web-app/`: port **5520**, `strictPort`, `/api`
   proxied to the worker.
3. `apps/worker`: wrangler config copied from Scoreboard's shape — assets
   binding on `../web/dist`, `FamilyRoom` SQLite Durable Object
   (`new_sqlite_classes`), `observability`, custom domain
   `ramure.adrienlcp.com`, `workers_dev: false`, dev port **8790**.
   `pnpm dev` starts both, as in Scoreboard.
4. `packages/protocol` and `packages/core`: source-only, empty but wired.
5. CI: validate on every push; deploy job on `main` with
   `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` (skill `cloudflare-pages`
   for the secrets; the token must also allow Workers scripts and routes —
   check what Scoreboard's token was given and reuse it).
6. Re-check the free-plan figures in `docs/architecture.md` against
   developers.cloudflare.com (Durable Objects limits and pricing pages); update
   the table and its date if anything moved.

## Done when

- `pnpm install && pnpm validate` passes locally and in CI.
- `pnpm dev` serves the empty page on `http://localhost:5520`, seen in a
  browser, and `/api/health` answers through the proxy.
- `https://ramure.adrienlcp.com` serves the same page after a push to `main`.
