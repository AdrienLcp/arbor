# 06 — Tree view

Goal: the fixture family drawn correctly and beautifully, navigable on a phone.

## Read first

`docs/data-model.md`; `toolkit/conventions/abstraction-boundaries.md` (an
established layout library before a hand-written one); `DESIGN.md`. Load
`impeccable` before the markup.

## Decided

The layout is ours on `d3-hierarchy`'s tidy tree: `docs/architecture.md`,
"The tree layout". The throwaway bench lives outside the repo.

## Do

1. Render in SVG from the layout's coordinates: person cards (photo or
   initials, name, years), union connectors showing kind and end, filiation
   lines distinct for birth / adoption / step (not by colour alone).
2. Views: "around a person" (ancestors above, descendants below, depth
   adjustable) and "whole family". Tapping a person refocuses with a
   transition (reduced motion respected).
3. Pan, pinch-zoom, keyboard navigation between people, search box that
   focuses a person.
4. Accessible alternative: the same family as a nested list view.

## Done when

The fixture family and a generated 300-person family are drawn without a
misreadable case, pan/zoom stays smooth on a throttled mobile profile, seen in
a browser at phone and desktop widths.
