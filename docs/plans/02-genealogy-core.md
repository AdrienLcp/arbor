# 02 — Genealogy core

Goal: the family model and every rule over it, pure and tested, before any
storage or screen.

## Read first

`docs/data-model.md` (all of it); `toolkit/conventions/errors.md`,
`typescript.md`, `testing.md`, `abstraction-boundaries.md` (dates: one helper
owns date parsing and comparison).

## Do

1. `packages/protocol`: zod schemas for Person, Union, Filiation, Event,
   FuzzyDate, Photo metadata, every Operation, the API error codes.
2. `packages/core`:
   - `fuzzy-date/` — parse, compare, format (fr, en), earliest-plausible-day.
   - `family/` — apply an operation to a family state → `Result` (rules from
     the data model: cycle check, two birth parents, distinct partners);
     inverse of an operation; replay a log.
   - `family/warnings` — implausible dates flagged, never blocking.
3. Fixture: a fictional family of five generations exercising every case of
   `docs/product.md` § "What a family tree has to say" — remarriage,
   half-siblings, an adoption, a step-child, a divorce, an unknown parent,
   approximate dates, a same-sex couple. It seeds dev, e2e and the public demo.

## Tests (decisions, not plumbing)

- Replaying the fixture's log rebuilds the same state; any operation followed
  by its inverse leaves the state unchanged (property test over the fixture).
- A filiation that would make someone their own ancestor is refused.
- A third birth parent is refused; an adoptive parent is accepted.
- "vers 1880" sorts before "1881-03-02"; `BET 1930 AND 1935` formats as
  "entre 1930 et 1935".

## Done when

`pnpm validate` green; the fixture family loads through `replay` with no error
and the expected warnings.
