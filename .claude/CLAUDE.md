# Ramure

A shared, living family tree. One person creates the family, passes a link
around, and every relative can add people, fix dates, attach photos and print
the tree. First user: Adrien's father, who keeps the family tree in an old
desktop program and reprints it on paper after every birth or separation.
Personal project (`github.com/AdrienLcp/ramure`).

## Conventions

This repo has no `.claude/rules/`: the conventions are `C:/git/toolkit`
(load the `adrien-stack` skill before writing code). Shared code comes from the
`@adrienlcp/*` packages (`C:/git/packages`) before anything is written by hand.
English in everything committed; the UI dictionaries are French (reference)
and English.

## Where things are

- `docs/plans/README.md` — the build plan index. Read it first, then open only
  the step being worked on.
- `docs/product.md` — who it is for, the access model, privacy. Any screen that
  shares, deletes or shows a living person's data must respect it.
- `docs/data-model.md` — people, unions, filiations, events, the change log.
  Read before touching `packages/core` or the storage schema.
- `docs/architecture.md` — the free-tier stack, its limits, and the cheapest
  paid step if a limit is ever reached.

## Rules that matter most

1. **Zero running cost.** Cloudflare free tier only, no card on file. A change
   that needs a paid service is a decision for Adrien, not an implementation
   detail — `docs/architecture.md` lists the cheapest ones.
2. **Nothing is ever lost.** Every edit is an entry in the family's change
   log; deleting is undoable; the keeper can restore any past state.
3. **Usable by a retiree on an old phone.** Large targets, plain French, no
   account, no password, nothing to install. If it needs explaining, redesign it.
4. **A family's data never leaves its family.** No indexing, no analytics on
   family pages, no data shared between families; the public demo uses a
   fictional family only.
