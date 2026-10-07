# 04 — Design direction

Goal: a visual direction Adrien picked by comparing complete example pages,
written down as `PRODUCT.md`, `DESIGN.md` and tokens in `apps/web`.

**Start with the `impeccable` skill**, before any markup or style. Every
direction it proposes becomes a **complete example page** — openable HTML,
real content from the fixture family, empty state included — that Adrien opens
and compares. A board of cards or a prose summary does not let him choose.

## The brief to give impeccable

> Ramure is a shared family tree for a French family. The keeper is a retired
> man who has kept the family's genealogy for years in an old desktop program
> and prints it on paper for everyone; his relatives will open the tree from a
> WhatsApp link on their phones a few times a year, from teenagers to
> grandparents. Nothing to install, no account.
>
> The tree is the product: it must be beautiful enough to frame once printed,
> and legible at a glance on a phone held at arm's length. It holds real
> families — remarriages, half-siblings, adoptions, unknown ancestors,
> approximate dates ("vers 1880"), people who died young, people with no
> photo. Each of those must look intentional, never like a missing case.
>
> Warm and heirloom-like without pastiche: no parchment texture, no clip-art
> leaves, no generic SaaS dashboard. Think of a well-made family album or a
> printed almanac — typography carries it. French is the reference language;
> English must fit too.
>
> Screens to show for each direction, as complete pages with the fixture
> family (five generations, ~40 people):
> 1. the landing / "create your family" page, empty state;
> 2. the tree, phone and desktop, focused on one person;
> 3. a person's sheet (photo, dates, unions, children, parents);
> 4. the "Who are you in this tree?" first visit;
> 5. the printed tree, as an A3 landscape page.
>
> Hard constraints: WCAG AA in light and dark; touch targets ≥ 44 px; text
> ≥ 16 px on mobile; fonts self-hosted (`@adrienlcp/styles` font mixin); works
> on an old Android phone; prints in black and white without losing meaning
> (relation kinds are not told by colour alone).

## Also feed it

`docs/product.md` (users, access, the cases a tree must handle) and the
fixture family from step 02. Impeccable writes `PRODUCT.md` at the root from
the product doc; keep the two consistent rather than duplicated (PRODUCT.md
points to `docs/product.md` for the access model).

## Done when

- Adrien has picked a direction from the example pages (or mixed two).
- `DESIGN.md`, OKLCH tokens, type scale and the theme switch
  (`@adrienlcp/theme-preference`) are in `apps/web`, checked in a browser in
  light and dark, phone and desktop widths.
- The example pages are kept under `.impeccable/` as the reference for steps
  05 to 10.
