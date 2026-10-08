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

## The look

The direction is the collector sticker album, written down in
`apps/web/DESIGN.md` (sidecar `apps/web/.impeccable/design.json`). Its reference
page, `.impeccable/directions/album/index.html`, shows the five screens steps
05 to 10 build: landing, tree on phone and desktop, person sheet, "Qui êtes-vous ?",
the A3 print.

- Tokens live in `apps/web/src/presentation/styles/_tokens.sass`, every colour as
  `light-dark()`; `contrast.test.ts` beside them holds every pair a screen puts
  together at WCAG AA in both themes.
- Fonts are self-hosted in `apps/web/public/fonts` (Latin and Latin Extended
  subsets). fontaine writes metric-matched Arial fallbacks, but only into
  `font-family` declarations: the `--font-*` tokens name the `… fallback` face
  themselves.
- The theme choice is stored under `arbor:theme`; the Vite plugin of
  `@adrienlcp/theme-preference` stamps it before the first paint.

## The tree layout

Decided 2026-10-07, against the fixture family and a generated 300-person one
(remarriages, half-siblings, adoptions, step-children, unknown parents,
married-in spouses with their own parents). No genealogy layout library
survives the fixture:

| Library | Fails on |
|---|---|
| `relatives-tree` 3.2 | Anne + Sophie: crashes on a same-sex couple; Thomas: no step filiation, he and Emma vanish |
| `family-chart` 0.9 | Louis's and Pierre's unions: partners drawn as a chain, Odile reads as married to Claire; half-siblings under one bracket |
| `elkjs` 0.12 (union nodes, generation partitions) | Simone placed between Claire and Pierre, René between Michel and Françoise; 440 kB gzip and seconds of layout for 300 people |

So the genealogy part is ours and the tree geometry is not: `packages/core`
builds **blocks** — a blood relative with their successive partners, first
partner on the left, later ones on the right, an unknown other parent as a
ghost slot — with each child under the union it came from (a step-child under
the union with their parent), and `d3-hierarchy`'s `tree()` (tidy tree,
1.8 kB gzip, ISC) places the blocks, its `separation` sized to each block's
width. Rows are `generationNumbers`; connectors are orthogonal and computed
beside the layout. The prototype passed every fixture case and the 300-person
family with no overlap and no line under a card, in 3 ms.

- **Whole family** is a descendancy, like the keeper's paper tree: from the
  founder with the most descendants. The parents of someone who married in are
  not drawn there; their card offers to refocus on them.
- **Around a person** is an hourglass: ancestors above (each parent's own
  parents, depth adjustable), descendants below, both laid out by the same
  tidy tree from the focus block.
- On a phone the tree is not this canvas but one spread around the focus
  person (`DESIGN.md`, Layout), which needs no layout at all. "Whole family"
  there is the same page; the other way through is the nested list.

The view, built in step 06 and measured 2026-10-08 with the 300-person family
on Chromium at CPU ×4:

- The desktop canvas pans and zooms with `react-zoom-pan-pinch`. It injects
  CSS outside any cascade layer, so the viewport rules in `tree-canvas.sass`
  sit outside the layers too, or they lose to it.
- **Never change an inherited property on the canvas wrapper during a pan.**
  The library set `user-select` inline at every pan start, and a
  `:active { cursor: grabbing }` did the same: both are inherited, so each
  restyled all 3 000 descendants — 310 ms of style recalculation, a 750 ms frame.
  `user-select: none` is now permanent and there is no grabbing cursor: 14 ms,
  worst frame 50 ms. `will-change: transform` made it worse.
- The phone page is about 150 DOM nodes; the list, 3 255 nodes and 31 000 px
  tall, scrolls at 60 fps with no long task — no virtualisation needed.
- A turned page is `<TreeSpread key={focusId}>` so it opens at its top. Every
  element carrying a `<ViewTransition name="person-…">` is keyed by person:
  reused in place, it gets renamed and collides with the newly mounted one.
- Canvas sticker text is below the phone size floor on purpose; it is never
  reused on phone views.

## Editing

Built in step 07, closed 2026-10-08.

- **Every save is one batch against the revision on screen.** The object
  applies a batch made over an older revision when it still applies — an edit
  carries each field's before and after, so two people fixing different fields
  of one sheet both land. It answers `revision_conflict` only when the batch no
  longer applies there; the client then reloads and names who moved the tree.
- **Nothing pushes changes to an open page.** The family reloads after the
  visitor's own saves only, so a sheet that empties under their eyes means one
  of their saves was refused: the sheet reads the log since the revision it
  showed and says who put the person in the bin. A sheet opened from an old
  link keeps the generic line — finding the bin there means reading the whole
  log, which step 08's bin screen will answer instead.
- **A photo is resized in the browser** (WebP; JPEG where Safari cannot
  encode WebP), recorded with `photo.create`, then its files go up in the
  save's `afterRecording` step. A failed upload records the photo's
  withdrawal, so the log never points at files that do not exist.
- **View transitions:** the root `ViewTransition` is keyed by
  `pageUnderneath(pathname)`, not the pathname, so opening a sheet does not
  replay the tree's entrance. Sheet-to-sheet moves replace history, so the
  sheet's Back closes it. Sheet rows never morph (`isMorphing={false}`): a
  name shared with the tree under them would collide.
- The running Vite dev server caches a failed Sass `@use`: a partial created
  after the first failed import stays "not found" until it restarts.

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
