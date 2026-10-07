# 07 — Person sheet and editing

Goal: anyone with the family link adds a newborn, records a wedding or fixes a
date in a few taps, from the tree.

## Read first

`docs/data-model.md`; `toolkit/conventions/react-components.md`,
`requests.md`; `DESIGN.md`. Load `impeccable` before the markup.

## Do

1. Person sheet: portrait, names, birth/death, unions (in order), parents,
   children, photos, notes, warnings from core.
2. Contextual adds from the sheet or the tree: "ajouter un enfant" (asks
   which union, or single parent), "un parent", "un conjoint", "un frère ou
   une sœur" (creates through the parents). Kinds default to the common case
   (birth, marriage) and are changeable in one tap.
3. Fuzzy date input: day/month/year with "environ", "avant", "après",
   "entre"; never forces a full date.
4. End a union (separation, divorce) with an optional date; record a death.
5. Photos: pick or take a photo, resize and thumbnail in the browser
   (canvas → WebP, sizes in `docs/architecture.md`), set as portrait, caption.
6. Every save is an operation batch with the base revision; a conflict
   refetches and tells the user in one line what changed.
7. Delete a person → bin (step 08), with what else goes with it spelled out.

## Done when

e2e on phone width: add a child to a couple, add a second spouse, set an
approximate birth date, attach a photo; the tree shows each change; a second
browser sees them after reload.
