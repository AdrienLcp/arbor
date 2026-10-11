import { expect, type Locator, type Page, test } from '@playwright/test'

import { openHydrated } from './support/journeys'
import { personSheet, whoAmIDialog } from './support/locators'

const LAPTOP = { height: 800, width: 1280 }

const DEMO_FAMILY_PATH = '/f/demo-famille-morel-001'
/** Far from Emma on the tree: were the tree to turn to the visitor, Emma would leave the screen. */
const VISITOR_NAME = 'Noah Morel'

/** Long enough for the tree to glide to a new centre, were it to turn. */
const GLIDE_WAIT_MS = 1_000

const onTree = (page: Page) => page.locator('.tree-plane')

const centreOf = async (locator: Locator) => {
  const box = await locator.boundingBox()
  if (box === null) throw new Error('The card is not drawn')
  return {
    x: Math.round(box.x + box.width / 2),
    y: Math.round(box.y + box.height / 2)
  }
}

/** The header gains a line once the visitor is named, which nudges the canvas a few pixels; turning the tree moves cards by hundreds. */
const STILL_TOLERANCE = 24

const expectStill = async (card: Locator, before: { x: number; y: number }) => {
  await card.page().waitForTimeout(GLIDE_WAIT_MS)
  const after = await centreOf(card)
  expect(
    Math.max(Math.abs(after.x - before.x), Math.abs(after.y - before.y)),
    'the tree stays on what the visitor is changing'
  ).toBeLessThanOrEqual(STILL_TOLERANCE)
}

test('[e2e] saying who you are before adding to an open sheet leaves the tree where it was', async ({
  browser
}) => {
  const page = await (await browser.newContext({ viewport: LAPTOP })).newPage()
  await openHydrated(page, `${DEMO_FAMILY_PATH}/tree/emma-bertin`)
  const emma = onTree(page).getByRole('button', { name: /^Emma Bertin/ })
  const before = await centreOf(emma)

  await personSheet(page).addRelative.click()
  await whoAmIDialog(page).person(VISITOR_NAME).click()

  await expectStill(emma, before)
})

test('[e2e] saying who you are before completing an unknown parent leaves the tree where it was', async ({
  browser
}) => {
  const page = await (await browser.newContext({ viewport: LAPTOP })).newPage()
  await openHydrated(page, `${DEMO_FAMILY_PATH}/tree/rene-morel`)
  await personSheet(page).close.click()
  await page.getByRole('button', { name: 'Zoom out' }).click()
  await page.waitForTimeout(GLIDE_WAIT_MS)
  const unknownParent = onTree(page).getByRole('button', {
    name: 'Add René’s unknown parent'
  })
  await expect(unknownParent).toBeInViewport({ ratio: 1 })
  const before = await centreOf(unknownParent)

  await unknownParent.click()
  await whoAmIDialog(page).person(VISITOR_NAME).click()

  await expectStill(unknownParent, before)
})
