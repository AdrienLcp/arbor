# Data model

The model follows GEDCOM's shape (person / family-union / filiation) so the
import and export map one-to-one, without inheriting GEDCOM's syntax. Schemas
live in `packages/protocol` (zod); the rules over them (validation, kinship,
layout input) in `packages/core`.

## Entities

**Person** — `id`, given names, surname, birth surname, sex (`female`,
`male`, `unknown`), birth and death as events, `living` (derived: no death
event and born less than 110 years ago, overridable), notes, portrait photo id.

**Union** — two partners (one may be unknown), `kind` (`marriage`, `pacs`,
`partnership`, `unknown`), start event, end (`separation`, `divorce`, or
none — a death ends it implicitly). A person has any number of unions, ordered
by start date.

**Filiation** — a child, a parent, and a `kind`: `birth`, `adoption`, `step`,
`foster`, `unknown`. A child links to a union through two filiations to its
partners; a single parent is one filiation. Half-siblings fall out of this
(one shared parent), never stored.

**Event** — a kind (birth, death, marriage, divorce, baptism, burial, other with
a label), a fuzzy date, a free-text place.

**Fuzzy date** — `{ precision: 'day' | 'month' | 'year', value }` plus a
qualifier `exact | about | before | after | between` (with a second value for
`between`). GEDCOM's `ABT`, `BEF`, `AFT`, `BET … AND …` map onto it. Sorting
and age computation use the earliest plausible day; display says the qualifier
("vers 1880").

**Photo** — id, owner person (optional), caption, date, the full image and a
thumbnail (see storage in `docs/architecture.md`).

## The change log is the source of truth

Every write is an **operation** (`person.create`, `person.update` with the
changed fields, `union.end`, `filiation.remove`, `photo.attach`, …) appended to
the family's log with `revision`, author (the person picked in "Who are you?",
or a typed name), timestamp, and the before/after values of each field.

- The current state is a projection of the log, kept materialised in tables
  for reads; replaying the log rebuilds it exactly (tested).
- Undo = a new operation that applies the inverse; nothing is rewritten.
- Restore to a moment = inverse operations back to that revision, as one
  grouped operation, itself undoable.
- Concurrency: a write carries the revision it was based on; per-field last
  write wins, and the history shows both values. Structural conflicts (a person
  deleted while someone edits them) are rejected with a typed error and the
  client refetches.

## Rules core must enforce

- No one is their own ancestor (cycle check on every filiation write).
- At most two `birth` parents per child.
- A union's partners are two distinct people.
- Dates: a child born before a parent's birth, or a death before a birth, is
  allowed but flagged (old records are wrong; the tool warns, never blocks).

## Kinship

Given two people, find the closest common ancestors through `birth` and
`adoption` filiations, and name the relation in French and English: generation
distance on each side → parent, grand-parent, oncle/tante, cousin germain,
cousin issu de germain, petit-cousin… with "par alliance" when the path goes
through a union, and "demi-" for a single shared parent. Pure function in
`packages/core`, table-tested.
