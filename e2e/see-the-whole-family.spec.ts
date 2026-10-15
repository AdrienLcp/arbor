import { expect, type Page, test } from '@playwright/test'

import { openHydrated } from './support/journeys'

const DEMO_TREE_PATH = '/f/dem0fam1ym0re100/tree'

const COMPUTERS = [
  { height: 800, width: 1280 },
  { height: 900, width: 1440 },
  { height: 1080, width: 1920 }
]
const PHONE = { height: 844, width: 390 }

type Box = { bottom: number; left: number; right: number; top: number }

const boxesOf = async (page: Page, selector: string): Promise<Box[]> => {
  const boxes = await Promise.all(
    (await page.locator(selector).all()).map((element) => element.boundingBox())
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
    right: Math.min(canvas.right, zoomTools?.left ?? Infinity),
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
