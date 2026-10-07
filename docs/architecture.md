# Architecture

## The constraint: zero running cost, no card on file

A family tree is read a few times a week and written a few times a month, by a
few dozen people. That fits Cloudflare's free plan with a wide margin, on the
same stack as Scoreboard (`C:/git/scoreboard`), whose setup can be copied.

```
apps/web (Vite + React, static assets)
  └─ served by apps/worker (Cloudflare Worker, assets binding)
       └─ /api/families/:id/* → one Durable Object per family
            └─ its own SQLite: people, unions, filiations, events,
               change log, photos (blobs), hashed keys
```

**One Durable Object per family** is the database: isolation between families
holds by construction (a key only ever reaches its own object), a family's
writes are serialised without locks, and a backup is one object's dump. The
free plan only offers SQLite-backed Durable Objects, which is what this needs.

There is no fake database to write: `wrangler dev` runs the Worker and its
Durable Objects locally on real SQLite files (`.wrangler/`, git-ignored). A
seed script loads the fictional fixture family into a local family.

## What is free, and its limits

Checked 2026-10-07 on developers.cloudflare.com. Past any daily allowance, further operations of that kind fail with an error until 00:00 UTC.

| Piece | Free allowance | This project's use |
|---|---|---|
| Workers requests | 100,000 / day | a family visit is a few dozen requests |
| Durable Objects requests | 100,000 / day (HTTP, RPC, WebSocket messages, alarms) | same order |
| Durable Objects storage | **10 GB per object, 5 GB per account**, SQLite only | one family's text is a few MB; photos dominate |
| Durable Objects SQLite rows | 5 million read / **100,000 written** per day; 13,000 GB-s duration / day | every edit writes change-log rows: the limit to watch |
| Workers CPU | 10 ms per request | |
| Static assets | free, unlimited requests; 20,000 files per version, 25 MiB per file | the whole web app |
| Custom domain | `arbor.adrienlcp.com`, zone already on Cloudflare | free |

**Photos drive the storage budget.** The browser resizes before upload (long
side 1600 px, WebP ~0.8 → ~150–250 kB, plus a 320 px thumbnail ~20 kB), and the
Worker refuses anything larger than 1 MB. 1 GB per family ≈ 4,000 photos;
5 GB per account ≈ a handful of real families plus the demo. A SQLite value
caps at 2 MB, which the resize keeps well under. Show each family its usage in
the keeper's settings, and warn at 80 %.

## The cheapest paid steps, if a limit is ever reached

In the order to take them — none is needed for one family:

1. **R2 for photos** — 10 GB free, no egress fees, but enabling R2 requires a
   payment method on the account (not charged under the free quota). Photos
   move out of SQLite; the API does not change.
2. **Workers Paid** — $5/month: 10 GB per Durable Object, 1 M requests/month
   included. Only if several large families share the account.

Rejected: Supabase free (projects pause after a week of inactivity — a family
app is idle for weeks), Firebase (Storage needs the paid Blaze plan), any
always-on server or VPS (cost and upkeep).

## Repository layout

Toolkit's multi-app shape (`toolkit/conventions/monorepo.md`), as Scoreboard:

```
apps/web/             → Vite + React + react-router (data mode) + indented Sass
apps/worker/          → Worker: routing, auth, the FamilyRoom Durable Object
packages/protocol/    → zod schemas: entities, operations, API routes, errors
packages/core/        → pure rules: validation, log projection, fuzzy dates,
                        kinship, GEDCOM mapping, layout input
e2e/                  → Playwright against `wrangler dev` with the fixture family
```

`apps/worker` follows `toolkit/conventions/backend.md`: `domain/` per concept
(`family`, `access`, `photos`), `infrastructure/` for the SQLite access (the
only module that writes SQL) and the request router.

Dev ports: web **5520** (`strictPort`), worker **8790** (5173, 5186, 5373,
5391, 5480 and 8788 belong to other projects). The web dev server proxies
`/api` to the worker, as in Scoreboard.

Dates are Temporal, in `packages/core` and in `packages/protocol` too (the
fuzzy-date schema checks a day exists in its month). Node 26 has it; the Worker
and Safari do not, so each entry — the Worker's `index.ts`, the web app's
`main.tsx` — loads `temporal-polyfill` first.

## Inside a family's object

- `apps/worker/src/domain/` holds `access` (keys, roles, the wrong-key limit),
  `family` (settings, the log, the role-filtered view) and `photos`; the SQL is
  in `infrastructure/durable-objects/sql-*-store.ts`, the routes in
  `infrastructure/http/`. The `FamilyRoom` class only wires them.
- The schema is a list of versioned migrations (`family-schema.ts`), run when
  the object starts. An object that holds no family writes nothing: a request
  for an unknown id answers 404 and leaves no storage behind.
- The current state is loaded once per object and kept in memory; each edit
  rewrites only the rows it changed.
- Tests run the object's code on Node's `node:sqlite`
  (`memory-sql-database.ts`): `@cloudflare/vitest-pool-workers` needs Vitest 4
  (checked 2026-10-07). `pnpm seed` against `wrangler dev` covers the real
  runtime.
- Two `wrangler dev` on port 8790 make workerd crash and restart in a loop with
  no message: stop the leftover `workerd.exe` before blaming the code.

## Security notes

- Keys: 128-bit random, base64url, sent in an `Authorization` header; only
  their SHA-256 is stored. Compare in constant time.
- Rate-limit failed key checks per family id (Durable Object state) to make
  guessing pointless; family ids are random too (no enumeration). After 20
  wrong keys in 15 minutes the family answers 429 to every key until the
  window ends; a revoked key is refused without counting.
- The read-only link, while the keeper setting is on (the default), sees a
  living person's birth and event dates as a year only, no notes, no portrait
  and none of their photos.
- Photos are served by the Worker after the same key check, with
  `Cache-Control: private`.
- `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex` on everything under
  `/f/`, a strict CSP with no third-party origin.
