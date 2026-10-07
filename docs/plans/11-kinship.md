# 11 — How are we related?

Goal: pick two people, read how they are related in plain French (and
English), and see the path in the tree.

## Read first

`docs/data-model.md` § Kinship.

## Do

1. `packages/core/kinship`: common ancestors, generation distances, the name
   ("cousin issu de germain", "grand-oncle", "demi-sœur", "belle-fille",
   "par alliance"), gendered from the person's sex, neutral when unknown.
   Table-tested on the fixture family, French and English.
2. Screen: "Quel lien entre…" from the person sheet (defaults to "moi" from
   "Who are you?"), the answer in one sentence, and the path highlighted in
   the tree.

## Done when

Every pair in a table of ~30 fixture pairs gives the expected name in both
languages; the path highlight is checked in a browser.
