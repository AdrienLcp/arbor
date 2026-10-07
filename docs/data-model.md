# Data model

The model follows GEDCOM's shape (person / family-union / filiation) so the
import and export map one-to-one, without inheriting GEDCOM's syntax. Schemas
live in `packages/protocol` (zod); the rules over them (validation, kinship,
layout input) in `packages/core`.

## Entities

**Person** — `id`, given names, surname, birth surname, sex (`female`,
`male`, `unknown`), birth and death (each an *occurrence*: a fuzzy date and a
place, both optional; a death with neither says "died, details unknown"),
`livingOverride`, notes, portrait photo id. Living is derived (no death and
born less than 110 years ago, or no birth date at all) unless overridden.

**Union** — two partners (the second may be unknown), `kind` (`marriage`,
`pacs`, `partnership`, `unknown`), start occurrence, end (`separation` or
`divorce` with its occurrence, or none — a death ends it implicitly). Partners
are fixed for the union's life. A person has any number of unions, ordered by
start date.

**Filiation** — a child, a parent, and a `kind`: `birth`, `adoption`, `step`,
`foster`, `unknown`. A child links to a union through two filiations to its
partners; a single parent is one filiation. Half-siblings fall out of this
(one shared parent), never stored.

**Life event** — what else happened to a person: baptism, burial, or other
with a label; an occurrence. Birth and death sit on the person, marriage and
divorce on the union.

**Fuzzy date** — a calendar point (`{ precision: 'year' | 'month' | 'day',
year, month?, day? }`) with a qualifier `exact | about | before | after`, or
`between` two points. GEDCOM's `ABT`/`CAL`/`EST`, `BEF`, `AFT`, `BET … AND …`
map onto it. Sorting and age computation use the earliest plausible day (the
day before a "before", the day after an "after"); display says the qualifier
("vers 1880"). A warning fires only when no reading of two dates can make them
plausible, an "about" stretching two years either side.

**Photo** — id, owner person (optional), caption, date, the full image and a
thumbnail (see storage in `docs/architecture.md`).

## The change log is the source of truth

Every write is an **operation** — `<entity>.create | update | remove` for
unions, filiations, life events and photos, `person.create | update | bin |
restore | remove`, and `group` for several applied all-or-nothing — appended to
the family's log with `revision`, author (the person picked in "Who are you?",
or a typed name) and timestamp. An update carries the before and after values
of the fields it changes; a removal carries the whole entity. Inverting one
swaps them, so any operation followed by its inverse leaves the family as it
was (tested over the demo family).

Deleting a person **bins** them: every link is kept, the person is hidden, and
restoring brings them back whole. `person.remove` exists only to undo a
creation while nothing links to the person yet.

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
- No new link (union, filiation, event, photo) points at a person in the bin.
- A photo used as someone's portrait cannot be removed.
- Dates: a child born before a parent's birth, or a death before a birth, is
  allowed but flagged (old records are wrong; the tool warns, never blocks).

## Kinship

Given two people, find the closest common ancestors through `birth` and
`adoption` filiations, and name the relation in French and English: generation
distance on each side → parent, grand-parent, oncle/tante, cousin germain,
cousin issu de germain, petit-cousin… with "par alliance" when the path goes
through a union, and "demi-" for a single shared parent. Pure function in
`packages/core`, table-tested.
