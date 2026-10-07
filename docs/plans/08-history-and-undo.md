# 08 — History and undo

Goal: no mistake and no vandal can cost the family anything.

## Read first

`docs/product.md` § Nothing is ever lost; `docs/data-model.md` § change log.

## Do

1. History screen: entries grouped by author and day, in plain sentences
   ("Marie a ajouté Léo, fils de Marie et Thomas"), filterable by person.
2. Undo an entry (or a group) → inverse operations; refused with an
   explanation when later changes depend on it (undo those first, offered).
3. Bin: deleted people with their links, restorable by anyone.
4. Keeper: restore the whole family to a moment (one grouped, undoable
   operation), shown as a preview first.
5. Person sheet: "historique de cette fiche".

## Done when

e2e: a contributor deletes three people and renames two; the keeper restores
the state of before with one action; the history shows both the vandalism and
the restore.
