import { expect, type Page } from '@playwright/test'

import {
  addRelativeDialog,
  createFamilyPage,
  familyAppBar,
  formDialog,
  homePage,
  personSheet,
  sharePage,
  treePage
} from './locators'

/** The page has hydrated: a press before it would land on server markup that does nothing. */
export const waitForHydration = (page: Page) =>
  page.locator('html[data-hydrated]').waitFor()

export const openHydrated = async (page: Page, url: string): Promise<void> => {
  await page.goto(url)
  await waitForHydration(page)
}

/**
 * Creates a family from the home page, lands on its tree with the creator as
 * its first person, and reads the family link from the share page the app bar
 * opens, then goes back to the tree. Returns the family link.
 */
export const createFamilyFromHome = async (
  page: Page,
  creator: { givenNames: string; surname: string }
): Promise<string> => {
  await openHydrated(page, '/')
  await homePage(page).createTree.click()
  const form = createFamilyPage(page)
  await form.givenNames.fill(creator.givenNames)
  await form.surname.fill(creator.surname)
  await form.submit.click()
  await expect(
    treePage(page).person(`${creator.givenNames} ${creator.surname}`),
    'the creator lands on the tree, holding their own sticker'
  ).toBeVisible()

  await familyAppBar(page).share.click()
  const familyLink = sharePage(page).familyLink
  await expect(
    familyLink,
    'the share page shows the family link once the tree exists'
  ).toHaveText(/#/)
  const link = await familyLink.innerText()
  await sharePage(page).openTree.click()
  return link
}

const isInViewport = async (page: Page, name: string): Promise<boolean> => {
  const box = await treePage(page).person(name).boundingBox()
  const viewport = page.viewportSize()
  if (box === null || viewport === null) return false
  return (
    box.x >= 0 &&
    box.y >= 0 &&
    box.x + box.width <= viewport.width &&
    box.y + box.height <= viewport.height
  )
}

/** A phone shows three stickers across: someone off screen is found by name, as a visitor would rather than pan. */
const bringIntoView = async (page: Page, name: string): Promise<void> => {
  if (await isInViewport(page, name)) return
  await treePage(page).find.fill(name)
  await page.getByRole('option', { name }).click()
  await expect(treePage(page).person(name)).toBeInViewport()
}

/**
 * Opens a person's sheet from the tree and raises it to its whole height, as a
 * swipe up does: half open, what lies under its fold is out of reach. The
 * keyboard raises it here, a headless browser having no finger to swipe with.
 */
export const openSheetFromTree = async (
  page: Page,
  name: string
): Promise<void> => {
  await bringIntoView(page, name)
  await treePage(page).person(name).click()
  await expect(page.locator('.bottom-sheet-content')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.locator('.bottom-sheet')).toHaveAttribute('data-expanded')
}

/** Adds a relative from the open sheet, through the "add" dialog, and waits for it to close. */
export const addRelative = async (
  page: Page,
  relation: string,
  person: { givenNames: string; surname?: string }
): Promise<void> => {
  await personSheet(page).addRelative.click()
  const dialog = addRelativeDialog(page)
  await dialog.choice(relation).click()
  await dialog.givenNames.fill(person.givenNames)
  if (person.surname !== undefined) await dialog.surname.fill(person.surname)
  await dialog.save.click()
  await expect(formDialog(page)).toBeHidden()
}
