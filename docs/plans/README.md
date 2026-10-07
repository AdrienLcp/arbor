# Build plan — index

**Reading a step.** This table is enough to choose; then open only the file of
the step taken. A delivered step keeps its line here (with the date) and loses
its file; what it taught goes into `docs/architecture.md` or
`docs/data-model.md`.

Steps run in order: each one ends deployed and seen in a browser.

| # | Step | In one line | State |
|---|---|---|---|
| 01 | Bootstrap | Workspace, Worker + web skeleton, CI, deploy to `arbor.adrienlcp.com` | done 2026-10-07 |
| 02 | Genealogy core | Schemas, operations, log projection, fuzzy dates, rules, fixture family | to do |
| 03 | Family storage | FamilyRoom Durable Object: SQLite schema, keys, change log, API | to do |
| 04 | Design direction | `impeccable`: full example pages per direction, Adrien picks, DESIGN.md + tokens | to do |
| 05 | Create and join | Landing, create a family, links + QR, "Who are you?", keeper settings | to do |
| 06 | Tree view | Layout of real families, pan/zoom, focus on a person, mobile first | to do |
| 07 | Person sheet and editing | Add/edit people, unions, filiations, events, photos | to do |
| 08 | History and undo | Change log screen, undo, bin, restore to a moment | to do |
| 09 | Printable tree | The drawing exported as a print-ready PDF: scope, paper size, tiling, QR code | to do |
| 10 | How are we related? | Kinship between two people, named in plain French | to do |
| 11 | GEDCOM import and export | Bring in the father's existing tree; export back; full backup zip | to do |
| 12 | Launch | Public demo family, Lighthouse, README, portfolio project page, the father onboarded | to do |
