import { expect, type Page, test } from '@playwright/test'

import { openHydrated } from './support/journeys'

const DEMO_TREE_PATH = '/f/dem0fam1ym0re100/tree'

const COMPUTERS = [
  { height: 800, width: 1280 },
  { height: 900, width: 1440 },
  { height: 1080, width: 1920 }
]
const PHONE = { height: 844, width: 390 }
const SIDEWAYS_PHONES = [
  { height: 360, width: 480 },
  { height: 320, width: 568 },
  { height: 390, width: 844 }
]

type Box = { bottom: number; left: number; right: number; top: number }

/** The boxes of what shows: a focus card stepped aside keeps its box, hidden. */
const boxesOf = async (page: Page, selector: string): Promise<Box[]> => {
  const boxes = await Promise.all(
    (await page.locator(selector).all()).map(async (element) =>
      (await element.isVisible()) ? element.boundingBox() : null
    )
  )
  return boxes
    .filter((box) => box !== null)
    .map(({ height, width, x, y }) => ({
      bottom: y + height,
      left: x,
      right: x + width,
      top: y
    }))
}

/** How far the cards spill past the canvas the generation rails, the zoom column and the focus card leave in sight, edge by edge: all zero when the whole tree shows. */
const spillOfTree = async (page: Page): Promise<Box> => {
  const [canvas] = await boxesOf(page, '.tree-viewport')
  if (canvas === undefined) throw new Error('No tree canvas on the page')
  const [zoomTools] = await boxesOf(page, '.tree-zoom')
  const [focusCard] = await boxesOf(page, '.focus-card')
  const rails = await boxesOf(page, '.generation-rail')
  const cards = await boxesOf(page, '.tree-plane .tree-card')
  const sight = {
    bottom: Math.min(canvas.bottom, focusCard?.top ?? Infinity),
    left: Math.max(canvas.left, ...rails.map((rail) => rail.right)),
    // A column of zoom tools hides the canvas's right; a phone's toolbar row lies under the canvas, a sideways phone's row over its top leaves the cards beside or under it.
    right: Math.min(
      canvas.right,
      zoomTools !== undefined &&
        zoomTools.top < canvas.bottom - 1 &&
        zoomTools.bottom - zoomTools.top > zoomTools.right - zoomTools.left
        ? zoomTools.left
        : Infinity
    ),
    top: canvas.top
  }
  const spill = (overrun: number) => Math.max(Math.round(overrun), 0)
  return {
    bottom: spill(Math.max(...cards.map((card) => card.bottom)) - sight.bottom),
    left: spill(sight.left - Math.min(...cards.map((card) => card.left))),
    right: spill(Math.max(...cards.map((card) => card.right)) - sight.right),
    top: spill(sight.top - Math.min(...cards.map((card) => card.top)))
  }
}

const NO_SPILL: Box = { bottom: 0, left: 0, right: 0, top: 0 }

const overlaps = (first: Box, second: Box): boolean =>
  first.left < second.right - 1 &&
  first.right > second.left + 1 &&
  first.top < second.bottom - 1 &&
  first.bottom > second.top + 1

const overlaysOf = async (page: Page): Promise<Box[]> => [
  ...(await boxesOf(page, '.tree-zoom')),
  ...(await boxesOf(page, '.focus-card'))
]

/** How many cards lie under the zoom tools or the focus card: none when those float over bare paper. */
const cardsUnderOverlays = async (page: Page): Promise<number> => {
  const overlays = await overlaysOf(page)
  const cards = await boxesOf(page, '.tree-plane .tree-card')
  return cards.filter((card) =>
    overlays.some((overlay) => overlaps(card, overlay))
  ).length
}

/** Whether the focus person's foil sticker lies clear of the zoom tools and the focus card. Found by its foil rather than its name: other journeys rename people of the demo family meanwhile. */
const isFocusClearOfOverlays = async (page: Page): Promise<boolean> => {
  const sticker = await page.locator('.tree-plane .focus').boundingBox()
  if (sticker === null) return false
  const box = {
    bottom: sticker.y + sticker.height,
    left: sticker.x,
    right: sticker.x + sticker.width,
    top: sticker.y
  }
  return !(await overlaysOf(page)).some((overlay) => overlaps(box, overlay))
}

/** The segmented control's label takes the press: its radio is drawn under it. */
const showScope = (page: Page, name: string) =>
  page.locator('.segmented-option', { hasText: name }).click()

for (const viewport of COMPUTERS) {
  test(`[e2e] at ${viewport.width}×${viewport.height}, the whole family opens with every card in sight`, async ({
    browser
  }) => {
    const page = await (await browser.newContext({ viewport })).newPage()

    await openHydrated(page, DEMO_TREE_PATH)
    await expect(
      page.getByRole('radio', { name: 'The whole family' }),
      'a family opens on its whole tree'
    ).toBeChecked()
    await expect
      .poll(() => spillOfTree(page), 'no card past an edge of the canvas')
      .toEqual(NO_SPILL)

    await showScope(page, 'Around one person')
    await showScope(page, 'The whole family')
    await expect
      .poll(
        () => spillOfTree(page),
        'coming back to the whole family fits it again'
      )
      .toEqual(NO_SPILL)

    await showScope(page, 'By generation')
    await expect
      .poll(() => spillOfTree(page), 'the generations fit beside their rails')
      .toEqual(NO_SPILL)
  })
}

test('[e2e] on a phone, "See the whole tree" brings every card in sight', async ({
  browser
}) => {
  const page = await (
    await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: PHONE
    })
  ).newPage()

  await openHydrated(page, DEMO_TREE_PATH)
  await page.getByRole('button', { name: 'See the whole tree' }).click()
  await expect
    .poll(() => spillOfTree(page), 'no card past an edge of the canvas')
    .toEqual(NO_SPILL)
})

for (const viewport of SIDEWAYS_PHONES) {
  test(`[e2e] on a phone held sideways at ${viewport.width}×${viewport.height}, the person in the centre and the whole tree both show clear of the tools`, async ({
    browser
  }) => {
    const page = await (
      await browser.newContext({ hasTouch: true, isMobile: true, viewport })
    ).newPage()
    const focusCard = page.locator('.focus-card')

    await openHydrated(page, DEMO_TREE_PATH)
    await expect
      .poll(
        () => isFocusClearOfOverlays(page),
        'the tree opens on its person clear of the tools and the focus card'
      )
      .toBe(true)

    await page.getByRole('button', { name: 'See the whole tree' }).click()
    await expect(
      focusCard,
      'the focus card steps aside while the whole tree shows'
    ).toBeHidden()
    await expect
      .poll(() => spillOfTree(page), 'no card past an edge of the canvas')
      .toEqual(NO_SPILL)
    await expect
      .poll(() => cardsUnderOverlays(page), 'no card under the tools')
      .toBe(0)

    await page
      .getByRole('button', { name: 'Back to the person in the centre' })
      .click()
    await expect(
      focusCard,
      'the focus card comes back with the person in the centre'
    ).toBeVisible()
    await expect
      .poll(
        () => isFocusClearOfOverlays(page),
        'the person in the centre clear of the tools and the focus card'
      )
      .toBe(true)
  })
}
