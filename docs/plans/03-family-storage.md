# 03 — Family storage

Goal: the `FamilyRoom` Durable Object stores a family, guards it with keys, and
serves the API the web app will use.

## Read first

`docs/architecture.md` (Security notes included), `docs/data-model.md`
§ change log; `toolkit/conventions/backend.md`; Scoreboard's
`apps/worker/src/` for how a Durable Object is addressed and its SQLite used.

## Do

1. SQLite schema in the object: materialised tables (people, unions,
   filiations, events, photos), `operations` (the log), `keys`
   (sha256, role, created, revoked), `settings`. Schema migrations versioned
   inside the object (run on construction, idempotent).
2. Routes in `packages/protocol/routes`, handled by the Worker which resolves
   the family id to its object:
   - `POST /api/families` → new family + keeper key + family key.
   - `GET /api/families/:id` → current state (role-filtered: the reader role
     hides living people's details when the setting says so).
   - `POST /api/families/:id/operations` → apply a batch based on a revision;
     returns the new revision or a typed conflict.
   - `GET /api/families/:id/operations?after=` → log page.
   - `POST/GET /api/families/:id/photos[/:photoId]` → upload (≤ 1 MB, image
     types only), serve (full or thumbnail).
   - keys: list, create reader key, replace family key, revoke (keeper only).
3. Failed-key rate limit per family; constant-time comparison.
4. `pnpm seed` — creates a local family from the fixture and prints its
   links.

## Tests

- A contributor key cannot call a keeper route; a revoked key gets 401.
- A key of family A never reaches family B (two objects, same request shape).
- Replaying the stored log equals the materialised tables after a random
  sequence of operations.
- A stale revision touching a deleted person returns the conflict error.

## Done when

`pnpm seed` against `wrangler dev` prints working links; the deployed Worker
creates a family from `curl` and refuses a wrong key.
