import { type CDPSession, expect, type Page, test } from '@playwright/test'

import { openHydrated } from './support/journeys'
import { treePage } from './support/locators'

/** Louis's sheet runs well past one screen, and no other journey renames him. */
const LONG_SHEET_PERSON = 'Louis Morel'
const LONG_SHEET_PATH = '/f/dem0fam1ym0re100/tree/louis-morel'
const PHONE = { height: 844, width: 390 }
const FINGER_STEP_PX = 10
const FRAME_MS = 16
/** Long enough for a moving sheet to show it is still moving. */
const SETTLE_CHECK_MS = 150

/** A finger dragged from one height to another, through the browser's own touch events: Playwright's touchscreen only taps. */
const swipe = async (
  page: Page,
  touch: CDPSession,
  from: number,
  to: number
): Promise<void> => {
  const at = (y: number) => [{ id: 1, x: PHONE.width / 2, y }]
  const step = from > to ? -FINGER_STEP_PX : FINGER_STEP_PX
  await touch.send('Input.dispatchTouchEvent', {
    touchPoints: at(from),
    type: 'touchStart'
  })
  for (let y = from + step; step < 0 ? y >= to : y <= to; y += step) {
    await touch.send('Input.dispatchTouchEvent', {
      touchPoints: at(y),
      type: 'touchMove'
    })
    await page.waitForTimeout(FRAME_MS)
  }
  await touch.send('Input.dispatchTouchEvent', {
    touchPoints: [],
    type: 'touchEnd'
  })
}

/** The headless shell sometimes leaves a swiped sheet between its two heights; full Chromium settles it on one, as a phone does. */
test.use({ channel: 'chromium' })

test('[e2e] on a phone, a finger raises a person’s sheet, then scrolls it while the tree stays still', async ({
  browser
}) => {
  const page = await (
    await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: PHONE
    })
  ).newPage()
  const touch = await page.context().newCDPSession(page)
  const sheet = page.locator('.bottom-sheet')
  const content = page.locator('.bottom-sheet-content')
  const scrolled = () => content.evaluate((element) => element.scrollTop)
  /** Where the sheet's top edge stands; gone, it stands at the foot of the screen. */
  const sheetTop = async () => (await sheet.boundingBox())?.y ?? PHONE.height
  /** The sheet rises half way on its own: a finger landing during that rise would only interrupt it. */
  const hasSettled = async () => {
    const before = await sheetTop()
    await page.waitForTimeout(SETTLE_CHECK_MS)
    return before === (await sheetTop())
  }

  await openHydrated(page, LONG_SHEET_PATH)
  const person = treePage(page).person(LONG_SHEET_PERSON)
  await expect(content).toBeFocused()
  await expect.poll(hasSettled).toBe(true)
  const treeBefore = await person.boundingBox()

  await swipe(page, touch, 780, 480)
  await expect(
    sheet,
    'a swipe on the half-open sheet raises it'
  ).toHaveAttribute('data-expanded')

  const raisedTop = await sheetTop()

  await swipe(page, touch, 700, 400)
  await expect
    .poll(scrolled, 'a swipe on the raised sheet scrolls what it holds')
    .toBeGreaterThan(0)
  expect(await person.boundingBox(), 'the tree behind does not move').toEqual(
    treeBefore
  )

  await swipe(page, touch, 300, 700)
  await expect.poll(scrolled, 'a swipe down scrolls back to the top').toBe(0)
  await swipe(page, touch, 300, 700)
  await expect
    .poll(sheetTop, 'at the top, a swipe down lowers the sheet')
    .toBeGreaterThan(raisedTop)
})
