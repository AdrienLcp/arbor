---
name: Arbor
description: A shared family tree laid out as a collector sticker album that every relative helps complete.
colors:
  paper: "oklch(0.968 0.006 235)"
  paper-2: "oklch(0.938 0.010 235)"
  paper-deep: "oklch(0.905 0.012 235)"
  ink: "oklch(0.24 0.035 262)"
  ink-soft: "oklch(0.42 0.030 262)"
  line: "oklch(0.32 0.035 262)"
  ghost: "oklch(0.60 0.025 250)"
  ghost-soft: "oklch(0.84 0.014 245)"
  sticker: "oklch(0.995 0.002 95)"
  sticker-edge: "oklch(0.88 0.008 245)"
  shadow: "oklch(0.22 0.04 262)"
  matte: "oklch(0.55 0.005 260)"
  focus: "oklch(0.48 0.17 262)"
  warn: "oklch(0.47 0.11 65)"
  warn-bg: "oklch(0.95 0.05 85)"
  action: "oklch(0.24 0.035 262)"
  on-action: "oklch(0.985 0.004 235)"
  cover: "oklch(0.53 0.19 32)"
  on-cover: "oklch(0.99 0.004 80)"
  g1: "oklch(0.80 0.14 82)"
  on-g1: "oklch(0.26 0.05 70)"
  g1-ink: "oklch(0.47 0.10 70)"
  g2: "oklch(0.53 0.19 32)"
  on-g2: "oklch(0.99 0.004 80)"
  g2-ink: "oklch(0.49 0.18 32)"
  g3: "oklch(0.49 0.10 165)"
  on-g3: "oklch(0.99 0.004 80)"
  g3-ink: "oklch(0.44 0.09 165)"
  g4: "oklch(0.47 0.15 262)"
  on-g4: "oklch(0.99 0.004 80)"
  g4-ink: "oklch(0.45 0.15 262)"
  g5: "oklch(0.47 0.16 350)"
  on-g5: "oklch(0.99 0.004 80)"
  g5-ink: "oklch(0.45 0.16 350)"
  foil-a: "oklch(0.95 0.03 200)"
  foil-b: "oklch(0.96 0.045 95)"
  foil-c: "oklch(0.94 0.04 330)"
  foil-d: "oklch(0.95 0.035 160)"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.875rem, 0.875rem + 5vw, 5rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(1.75rem, 1.0441rem + 1.7647vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.01em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.04em"
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
  numeral:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
    fontFeature: "tnum, lnum"
  body:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.35
  name:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.1
rounded:
  art: "4px"
  sticker: "7px"
  control: "8px"
  frame: "10px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "48px"
  section: "88px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    typography: "{typography.name}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "52px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.name}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "52px"
  button-cover:
    backgroundColor: "{colors.on-cover}"
    textColor: "{colors.cover}"
    rounded: "{rounded.control}"
    padding: "0 28px"
    height: "60px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    size: "44px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.frame}"
    padding: "0 12px"
    height: "56px"
  sticker:
    backgroundColor: "{colors.sticker}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sticker}"
    padding: "5px"
    width: "112px"
    height: "150px"
  ghost-slot:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.sticker}"
    padding: "8px"
  generation-band-head:
    textColor: "{colors.on-g3}"
    backgroundColor: "{colors.g3}"
    typography: "{typography.title}"
    padding: "7px 22px 7px 10px"
  relation-pill:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
  verify-tag:
    backgroundColor: "{colors.warn-bg}"
    textColor: "{colors.warn}"
    rounded: "3px"
    padding: "2px 4px"
---

# Design System: Arbor

## Overview

**Creative North Star: "The Family Sticker Album"**

Genealogy is collecting. The family is a French collector sticker album that every relative helps complete: each generation is a spread under its own coloured band, each person is a glossy sticker pressed into a numbered slot printed on matte paper, and a missing ancestor is a printed outline with its number, waiting, never a hole. The whole system is built from the materials of that object: cool matte paper, varnished stickers that stand proud of the page, bold clipped section bands, condensed numbers, and a vermilion cover.

The audience is a retiree on an old phone, and relatives who visit a few times a year. Density is low and targets are large: nothing interactive is smaller than 44px, the main action is 52px tall (60px on the cover), reading text is 18px, and phone views never go under 16px. Everything that carries meaning (death, relation kind, uncertainty, absence) is carried by shape and words as well as colour, because the printed sheet is often black and white and the eyes reading it are not always young.

The world is playful in its materials and sober in its behaviour: one foil sticker per view, one motion, flat paper everywhere except the stickers themselves.

**Key Characteristics:**
- Matte cool paper with glossy stickers as the only raised objects.
- Five generation inks (ochre, vermilion, green, blue, magenta) used as identity, never as decoration or status.
- Numbered slots, including empty ones: absence is shown as a dashed outline with an invitation.
- Two voices: condensed uppercase Barlow for structure and numbers, Atkinson Hyperlegible for anything read.
- Relation kinds told by line style plus a word, never by colour.
- One signature motion: a sticker pressing into its slot.

## Colors

A cool, blue-grey matte paper and navy ink carry every screen; five saturated generation inks and a vermilion cover supply all the colour, each with its own readable "on" and "ink" partners.

### Primary
- **Album Vermilion** (`cover`, same value as `g2`): the album cover. The landing page surface, the small book glyph next to the family name in app bars and the first-visit screen. It is the brand; outside the cover it appears only as a glyph or as the generation-2 ink.
- **Navy Ink** (`action`): primary buttons in light theme. In dark theme `action` switches to Generation Ochre (`oklch(0.82 0.14 82)`) with navy text, so the main action always reads as the brightest solid on the page.

### Secondary: the generation inks
Each generation `gN` has three tokens: `gN` (the band and sticker art fill), `on-gN` (text on that fill), `gN-ink` (the hue darkened to pass as text on paper: slot numbers, band titles on phone, counts). Components receive them through the scoped `--gc`, `--on-gc`, `--gc-ink` properties set by a `.gN` class.
- **Generation Ochre** (`g1`): the oldest generation; also the text-selection colour and the "on" state of switches.
- **Generation Vermilion** (`g2`).
- **Generation Pine** (`g3`): also the current-tab fill in the tree navigation and the phone spread bar.
- **Generation Ultramarine** (`g4`).
- **Generation Magenta** (`g5`): the youngest; the welcome screen tint.
A sixth or later generation cycles back to `g1`.

### Tertiary
- **Foil** (`foil-a` to `foil-d`): pale cyan, straw, pink and mint stops of the holographic gradient on the focus person's sticker. Only ever used together, as one 128deg gradient.
- **Check Amber** (`warn` on `warn-bg`): the "date à vérifier" tag stuck on a sticker corner. The only status colour in the system.

### Neutral
- **Matte Paper** (`paper`): the page. Never pure white.
- **Shaded Paper** (`paper-2`): hover fills, ghost-slot fill, scrollbar track.
- **Spine Paper** (`paper-deep`): the deepest recess (browser chrome, dark-mode wells).
- **Sticker White** (`sticker`): the sticker stock; the only near-white surface.
- **Sticker Edge** (`sticker-edge`): the 1px die-cut edge around every sticker.
- **Navy Ink** (`ink`) and **Faded Ink** (`ink-soft`): text and secondary text.
- **Line Ink** (`line`): relation lines and pill borders in the tree.
- **Printed Outline** (`ghost`) and **Faint Outline** (`ghost-soft`): dashed ghost slots, control borders, dividers and the printed slot frames.
- **Matte Grey** (`matte`): mixed 58% into a generation ink to dull a deceased person's sticker art.
- **Shadow** (`shadow`): the base of every shadow, always applied through `color-mix` at a stated strength.
- **Focus Blue** (`focus`): the 3px focus outline; ochre in dark theme.

Dark theme (`prefers-color-scheme: dark` unless `data-theme="light"`, or `data-theme="dark"`): the paper becomes deep navy (`oklch(0.205 0.028 262)`), stickers become a raised navy (`oklch(0.300 0.030 262)`), inks lighten to around L 0.73 with dark navy text on them. The printed sheet (`.paper-light`) forces the light palette with pure-white paper whatever the screen theme.

### Named Rules
**The Generation Ink Rule.** A generation hue means "this generation" and nothing else: its band, its slot numbers, its sticker art, its tinted band (ink at 9% into paper, top border at 55%). Never use a generation ink for status, emphasis or decoration.

**The Matte Means Gone Rule.** A deceased person's sticker loses its varnish and its halftone, its art is dulled toward `matte`, a thin ink rule sits over the caption, and the dates carry a "†". Death is never told by colour alone and never by removing the person from view.

**The Line Speaks Rule.** Relation kinds are told by stroke, not hue: plain 2px for birth, heavy 3.2px for marriage, heavy dashed 7/5 for a free union, cut with two slashes for divorce, a hollow double line for adoption, dotted for a step-child, faint short dashes in `ghost` for an unknown link. Every line kind appears with its French word in the legend, and union lines carry a word pill on the canvas.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow, sans-serif), weights 600 to 800.
**Body Font:** Atkinson Hyperlegible (with system-ui, sans-serif), 400 and 700.

**Character:** the condensed uppercase is the printed furniture of a sticker album: band titles, slot numbers, dates and labels, packed tight and loud. Atkinson Hyperlegible is the voice that talks to the reader, chosen for low-vision legibility; it carries sentences, buttons and given names.

### Hierarchy
- **Display** (800, clamp(2.875rem, 0.875rem + 5vw, 5rem), 0.92, uppercase): the cover headline only. The A3 print title uses the same voice at 104px.
- **Headline** (800, clamp(1.75rem, 1.0441rem + 1.7647vw, 2.5rem), 1, uppercase): band ribbons, a person's name at the top of their sheet (44px, 0.95), welcome and first-visit titles (40px).
- **Title** (800, 18 to 22px, 1, uppercase, 0.04em): generation band heads, group headings in the person sheet, the app bar family name (24px, 28px on desktop).
- **Label** (600 to 700, 16px, 1.2, uppercase, 0.04 to 0.08em): navigation tabs, fact labels, surnames on stickers, the "Compléter" action, phone frame captions.
- **Numeral** (700, 15 to 18px, tabular lining figures): slot numbers ("09"), dates, generation ranges. Every number in the album uses tabular figures.
- **Body** (400, 18px, 1.5): running text, max 66 to 72ch. Lead text on the cover 21px/1.45.
- **Body small** (400, 16px, 1.35): secondary lines under names, notes, hints. The phone floor.
- **Name** (700, 16 to 24px, 1.1, Atkinson): given names on stickers and in relation rows; also button labels (18px/1.15).

### Named Rules
**The Two Voices Rule.** Anything read as a sentence, a button label or a given name is Atkinson Hyperlegible; anything that is a heading, a number, a date or a printed label is Barlow Condensed uppercase. Surnames are labels (uppercase, tracked); given names are names.

**The 16px Floor Rule.** On phone views nothing is smaller than 16px, including slot numbers, surnames, dates, the verify tag and the ghost-slot text. Smaller sizes (12 to 15px) exist only inside the zoomable desktop tree canvas and the print sheet, where stickers are scaled as a whole.

## Layout

The page is a 1320px max-width column with 24px gutters (16px under 640px); sections are spaced by 88px (64px on phone). Breakpoints are 1100px (two-column layouts stack, the cover spread stops tilting) and 640px (single column everywhere, compact header).

The tree is organised as horizontal generation bands stacked top to bottom, oldest first. On desktop each band is a full-width tinted strip with a rail on the left (band head, year range, count) and stickers positioned absolutely along it, with the SVG relation lines and word pills drawn underneath. On a phone the tree is one spread at a time around a focus person: parents strip above, the focus person large in the middle (160 by 200px) between their unions, children strip below, with a spread bar in Generation Pine for moving between spreads and a sticky bottom dock for the main action.

Slots have a fixed sticker ratio of roughly 3:4: 112 by 150px by default, 104 by 140 on the cover spread, 132 by 164 in phone rows, 124 by 158 in the sheet hero. The slot number sits above the slot, 18px tall.

Spacing is loose rather than a strict scale: 4, 8, 12, 16, 24, 32, 48 and 88px are the recurring steps, with 10, 14, 18 and 22 used inside components. Touch targets are 44px minimum, list rows 64 to 76px.

## Elevation & Depth

Hybrid: paper is flat and divided by 1px `ghost-soft` rules and tinted bands; only stickers, the primary button and floating panels are lifted. Every shadow is built from the `shadow` token through `color-mix`, layered as a tight contact shadow plus a soft negative-spread drop, so depth reads as "a thing lying on paper", not as hovering cards.

### Shadow Vocabulary
- **Sticker** (`box-shadow: 0 0 0 1px var(--sticker-edge), 0 1px 1.5px color-mix(in oklch, var(--shadow) 30%, transparent), 0 6px 12px -6px color-mix(in oklch, var(--shadow) 55%, transparent)`): every living person's sticker, together with a varnish gloss overlay (`linear-gradient(118deg, oklch(1 0 0 / 0.42) 0%, oklch(1 0 0 / 0.08) 22%, transparent 38%, transparent 78%, oklch(1 0 0 / 0.14) 100%)`).
- **Matte sticker** (`box-shadow: 0 0 0 1px var(--sticker-edge), 0 1px 2px color-mix(in oklch, var(--shadow) 26%, transparent)`): deceased people; no gloss.
- **Foil sticker** (`box-shadow: 0 0 0 1px var(--sticker-edge), 0 0 0 4px var(--paper), 0 0 0 7px var(--ink), 0 14px 22px -10px color-mix(in oklch, var(--shadow) 70%, transparent)`): the focus person, over the foil gradient. Ring widths grow on phone (5px / 8.5px).
- **Far sticker** (`box-shadow: 0 0 0 1px var(--sticker-edge)`): distant relatives in the tree, flattened back into the page; their lines drop to 42% opacity.
- **Primary button** (`box-shadow: 0 6px 14px -8px var(--shadow)` plus a contact layer; lifts 1px on hover, presses 1px down on active).
- **Side sheet** (`box-shadow: -24px 0 40px -30px var(--shadow)`): the desktop person sheet sliding over the canvas.

### Named Rules
**The Stickers Stand Proud Rule.** Only stickers carry a gloss and a drop shadow. Bands, cards, lists, fields and panels are paper: flat, separated by rules and tints. If a new surface wants a shadow, it should either be a sticker or a floating panel.

## Shapes

Small, printed corners. Sticker art is 4px, the sticker itself 7px, the printed slot frame around it 10px (it peeks out 4px around the sticker in `ghost-soft`). Buttons and icon buttons are 8px, fields, union boxes and zoom controls 10px. Pills (relation words, the "Compléter" action, switches) are fully round.

Two silhouettes are the world's own. The **band**: section ribbons, generation band heads and spread heads are solid generation-ink blocks with the right edge cut on a slant (`clip-path: polygon(0 0, 100% 0, calc(100% - 22px) 100%, 0 100%)`, 12 to 22px cut depending on size). The **album cover**: a vermilion block with a binding on its left edge, shaped `6px 14px 14px 6px`.

Dashed 2px outlines in `ghost` always mean "empty, to fill": ghost slots, the photo drop slot, unknown-person legend boxes.

## Components

### Buttons
Solid, tall, plain-spoken.
- **Shape:** gently rounded (8px), 52px tall, 22px side padding, Atkinson 700 18px, optional 24px leading icon.
- **Primary:** `action` fill with `on-action` text; one per view. On the cover, inverted: `on-cover` fill with vermilion text, 60px tall, 20px label.
- **Hover / Focus:** primary lifts 1px with a deeper drop; active presses 1px down. All transitions 160ms on the ease-out curve. Focus is the global 3px `focus` outline, offset 3px.
- **Ghost:** transparent with a 2px `currentColor` border; hover fills 8% of `currentColor`.
- **Link button:** underlined 700 text with an icon, 44px tall, for secondary paths ("J'ai déjà un arbre dans un logiciel").
- **Icon button:** 44px square, transparent, `paper-2` on hover.

### Sticker (signature)
The person. A `sticker`-white card (7px, 5px padding) inside a numbered slot. Top 47% is the art: the generation ink with a fine 5px halftone dot and a 1px inner rule in `on-gc`, holding a Barlow 800 monogram or a greyscale photo. Below, centred: given name (Atkinson 700), surname (Barlow 600 uppercase, tracked 0.08em, `ink-soft`), dates (Barlow 600 tabular, "†" before a death date). Variants: **deceased** (matte, see Colors), **focus** (foil gradient and double ring, slot frame hidden), **far** (flattened). A **verify tag** (amber, Barlow 700 uppercase, rotated 4deg, alert icon) is stuck on the top-right corner when a date is inconsistent.

### Ghost slot
An empty numbered slot: 2px dashed `ghost` outline, `paper-2` wash, "INCONNU" in Barlow 800, a one-line hint ("le père de Louis"), and a round "+ Compléter" pill. The whole slot is the button; hover darkens the outline to `ink`.

### Generation band
A full-width strip tinted with the generation ink at 9% into paper, a 2px top border at 55%. Its head is the slanted band block ("GÉNÉRATION 3") with the year range and a count in `gc-ink` below it.

### Relation lines and pills
SVG strokes in `line`, round caps (see The Line Speaks Rule). Union lines carry a pill: paper fill, 1.5px `line` border, Barlow 600 13.5px with the kind and year ("mariés 1957"); a dashed pill border for a free union.

### Inputs / Fields
- **Style:** 2px `ink` border, 10px radius, 56px tall, paper fill, 18px Atkinson text, leading search icon; placeholder in `ink-soft`.
- **Focus:** the 3px `focus` outline, offset 2px, on the whole field.

### Switch
52 by 30px track in `ghost-soft` with a `ghost` border and an `ink` knob; checked fills Generation Ochre and slides the knob 22px over 200ms.

### Navigation
- **Tree app bar:** book glyph in vermilion, family name in Barlow 800 uppercase, search field, then actions and "who am I" on the right, divided by a `ghost-soft` rule.
- **View switcher:** a segmented group (1.5px `ghost` border, 10px radius, 4px inset); tabs in Barlow 700 uppercase `ink-soft`, the current one filled with Generation Pine.
- **Phone spread bar:** Generation Pine bar with previous / next icon buttons and the generation title in Barlow 800.

### Relation row
A 68px row in the person sheet: a mini sticker (48 by 60), the name in Atkinson 700 18px, the relation in `ink-soft` 16px, a 40px line sample showing the relation kind, a chevron. Unions group their rows in a 10px rounded `ghost-soft` box headed by the union line and its dates.

### Motion
One motion: when a person is added, their sticker presses into its slot (starts lifted 16px, tilted -3.5deg, scaled 1.07 with a deep shadow; overshoots to 0.985; settles), 560ms on `cubic-bezier(0.16, 1, 0.3, 1)`. It is switched off under `prefers-reduced-motion`. Everything else is a 160 to 200ms state transition.

## Do's and Don'ts

### Do:
- **Do** give every person a numbered slot, including unknown ones; show absence as a dashed `ghost` outline with "Inconnu" and a "Compléter" action.
- **Do** colour a person only by their generation (`.g1` to `.g5`, cycling), through `--gc`, `--on-gc`, `--gc-ink`.
- **Do** mark the deceased with all four signs: matte sticker, dulled art, ink rule over the caption, "†" in the dates.
- **Do** tell relation kinds by stroke style and a French word, and keep the legend on every printed sheet.
- **Do** keep one foil sticker per view: the focus person.
- **Do** use tabular lining figures for every number and date.
- **Do** keep targets at 44px minimum, primary actions at 52px, and phone text at 16px minimum.
- **Do** render the print sheet on the forced light palette, and check it in greyscale: every meaning must survive black and white.

### Don't:
- **Don't** use a generation ink for status, warnings or emphasis; amber `warn` is the only status colour.
- **Don't** put a gloss or drop shadow on anything that is not a sticker, the primary button or a floating panel.
- **Don't** tell a relation kind, a death or an absence by colour alone.
- **Don't** set sentences, buttons or given names in Barlow Condensed, or headings and numbers in Atkinson.
- **Don't** add motion beyond the sticker press and short state transitions.
- **Don't** use pure white for the page; pure white is reserved for the printed sheet and the sticker stock.
