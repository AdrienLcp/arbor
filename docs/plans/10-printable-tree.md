# 10 — Printable tree

Goal: the father keeps printing — the drawn tree exported as a print-ready
PDF that looks made for paper, not a screenshot of the screen.

Asked by Adrien on 2026-10-07: the father must be able to keep printing the
tree, made from the same drawing as the screen.

## Read first

`DESIGN.md` and the printed-tree example page from step 04; step 06's layout
decision in `docs/architecture.md`. Load `impeccable` before the markup.

## Do

1. "Imprimer l'arbre" dialog:
   - **what**: the whole family, the ancestors of someone, the descendants of
     someone (with depth);
   - **paper**: A4 or A3, portrait or landscape, or a **poster tiled over
     several A4 sheets** with overlap margins and assembly marks, for a home
     printer; or one large page (A2/A1) for a print shop;
   - **content**: photos or not, dates, places;
   - live preview of the pages.
2. Output is vector: the same SVG layout as the screen, re-styled for print
   (black-and-white safe, print type sizes), turned into a PDF — evaluate
   generating the PDF in the browser from the SVG (`svg2pdf.js` + `jsPDF`, or
   `pdf-lib`) against the browser's own print-to-PDF of a print stylesheet;
   pick the one whose tiling and page sizes are reliable on Chrome and
   Firefox. Fonts embedded.
3. Each sheet carries the family name, the date of the print, and a **QR code
   to the live tree** (reader link if one exists, else nothing — never the
   family link on paper without the keeper choosing it).
4. Also: download as SVG and PNG (for sharing in a message).

## Done when

The fixture family prints on one A3 landscape and on a 3×2 A4 poster that
assembles correctly — checked by printing to PDF and opening it; the QR code
scans to the reader view.
