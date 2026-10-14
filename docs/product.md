# Product

## Who it is for

- **The keeper** — the relative who started the tree and cares most about it
  (first: Adrien's father, retired, used to a desktop genealogy program and to
  printing). Creates the family, imports the existing tree, shares the link,
  and can repair anything.
- **Contributors** — any relative with the link, on a phone more often than
  not: adds their newborn, fixes their own birth date, uploads a wedding photo.
  Comes back a few times a year, so must never have to relearn anything.
- **Readers** — the grandmother who wants the paper version, the cousin who
  just looks. Sees the tree; the printed sheet is a first-class output.

## What it must do

1. Show the family as a tree that is beautiful on screen and on paper.
2. Let anyone in the family add or fix a person, a relation, a date, a photo,
   in a few taps.
3. Replace the reprint cycle: the paper tree carries a QR code to the live one,
   and is reprinted only when someone wants paper.
4. Bring in the keeper's existing tree (GEDCOM import) and let it go back out
   (GEDCOM export): never a dead end for the family's data.
5. Answer "how are we related?" between any two people, in plain French
   ("cousin issu de germain", "grand-oncle par alliance").

## What a family tree has to say

Real families are not a binary tree. The model and the screens handle, from the
first version:

- several successive unions per person, with their kind (marriage, PACS,
  partnership) and their end (separation, divorce, death);
- children of a union, of a single parent, or of unknown parents;
- adoption, step-parenting and fostering as filiations distinct from birth;
- half-siblings, shown as such;
- unknown or approximate dates ("vers 1880", "avant 1902", "1930–1935");
- deceased people, and people whose details are unknown.

## Access: a link, not an account

Identity is not verified; possession of the link is the permission, as with a
shared photo album. What protects the family is that **nothing can be lost**,
not that strangers are kept out by a login.

- **Create a family** → the creator becomes the keeper and gets two links:
  the **family link** (to share) and the **keeper link** (to keep). The tree
  starts with one person: the creator, or someone else (a grandparent, an
  ancestor); a creator who starts with someone else types their own name,
  which signs their changes until they pick themselves in the tree.
- A link carries its secret in the fragment (`/f/<familyId>#<key>`): the
  fragment is never sent in requests, server logs or `Referer` headers. The app
  moves it to local storage on arrival and sends it as a header.
- Three roles: **reader** (optional read-only link, for the in-laws or a
  printed QR code), **contributor** (the family link), **keeper**.
- The keeper can **replace** the family link: the old one stops working at once
  (a leaked link is a one-tap fix). Several keepers are possible.
- The link opens the tree, never a list of people. The app asks **"Who are you
  in this tree?"** before the visitor's first change, or when they offer to say
  it, and the visitor taps their own person (or "not in the tree yet" and
  their name). The question says why it is asked, and the answer is kept on
  the device, so it is asked once. Every change is signed with that choice —
  unverified, but enough to know who did what.
- Sharing: copy, the system share sheet (WhatsApp, SMS, mail) and a QR code.

## Nothing is ever lost

- Every edit is an entry in the family's change log: who, when, before, after.
- Any change can be undone from the history; a deleted person goes to a bin,
  restorable by anyone.
- The keeper can roll the whole family back to any past moment.
- GEDCOM export and a full backup download (data + photos, zip) at any time.

## Privacy

- Family pages are `noindex`, carry no analytics and no third-party request.
- Keys are stored hashed; families are isolated by construction (one storage
  per family, see `docs/architecture.md`).
- Living people's details (exact birth date, photos) can be hidden from the
  reader link — a keeper setting, on by default for the read-only link.
- The public demo (portfolio) is a fictional family, reset every night.
- A family's data is kept as long as the family exists. A keeper can delete
  the whole family from its settings, after typing its name: the object's
  storage is erased — people, photos, change log, keys — and the device
  forgets it. It is the one action that cannot be undone. A binned person, or
  a removed photo, stays in the storage (restorable, in the log) until then.
- No inactivity expiry: a tree is an archive some relatives open once a year,
  and without accounts there is no way to warn a keeper before erasing it.
- `/legal`, linked from every screen's footer, says all of this: publisher,
  host, what the server and the device keep, the keepers' responsibility for
  the people they add, how a person asks to be removed, no audience
  measurement, GDPR rights.

## Out of scope

Accounts and passwords, DNA, record search in public archives, a social feed,
comments, notifications by email, a native app.
