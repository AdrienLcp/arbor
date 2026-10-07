# 05 — Create and join

Goal: a stranger lands, creates a family, shares it, and a relative joins it
from the link — on a phone, without reading any help.

## Read first

`docs/product.md` § Access; `toolkit/conventions/routing.md`, `i18n.md`,
`react-components.md`, `requests.md`; `DESIGN.md` and the example pages from
step 04. Load `impeccable` before the markup.

## Do

1. Router (data mode), dictionaries fr (reference) + en, theme, layout.
2. Landing: what Arbor is in one screen, "Créer l'arbre de ma famille", and
   "J'ai reçu un lien" (paste a link or scan a QR code).
3. Create: family name, the creator's own first person (themselves), then the
   two links shown with copy / share sheet / QR code, and a plain warning
   that the keeper link must be kept safe.
4. Join `/f/:familyId#key`: key moved to `@adrienlcp/safe-storage`, fragment
   removed from the URL, then "Qui êtes-vous dans cet arbre ?" (search + tap a
   person, or "pas encore dans l'arbre" → add yourself). Remembered per
   family; changeable from the menu.
5. Several families on one device: a small "my trees" list on the landing.
6. Keeper settings: replace the family link, create/revoke the reader link,
   hide living people from readers, storage usage, add another keeper.
7. Wrong or revoked link: a clear screen saying to ask the family for the new
   link — not a generic error.

## Done when

On a phone-sized browser: create → share link opened in a second browser
profile → pick yourself → both see the same family. Replacing the family link
locks the second profile out with the dedicated screen. e2e covers this path.
