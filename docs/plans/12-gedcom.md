# 12 — GEDCOM import and export

On hold: not started before the launch, and only if Adrien asks for it.

Goal: the father's existing tree comes in without retyping, and the family's
data can always leave.

## Needs Adrien

- The name of his father's genealogy program, and a `.ged` export from it
  (usually "Fichier → Exporter → GEDCOM"). Real family data: keep it out of
  git (`*.ged` is ignored); commit only trimmed, anonymised fixtures.

## Read first

`docs/data-model.md`; `toolkit/conventions/abstraction-boundaries.md` (a
GEDCOM parser library before a hand-written one; evaluate what exists for
5.5.1 and 7.0).

## Traps known in advance

- **Encoding**: French desktop programs export ANSEL, Windows-1252 or UTF-8,
  declared in `HEAD.CHAR` — and sometimes declared wrong. Decode by the
  declaration, verify on accented names, offer a choice if it looks broken.
- Dates in French programs can be French (`VERS 1880`, `ENTRE … ET …`) or
  standard; map both to the fuzzy date.
- Program-specific tags (`_` prefix) are kept in notes, never dropped silently.
- Photos referenced by local file paths cannot be imported from the `.ged`
  alone: list them for a manual upload or a zip import.

## Do

1. Import into a **new** family or merge into an empty one: parse in the
   browser, show a summary (people, unions, warnings, unreadable lines), then
   send as one operation batch — undoable like anything else.
2. Export GEDCOM 5.5.1 (widest support) with UTF-8, plus the full backup zip
   (JSON state + log + photos).
3. Round trip test: fixture → export → import → same family.

## Done when

The father's real file imports with every person present and accents intact,
and a round trip of the fixture is lossless.
