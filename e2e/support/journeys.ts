import { expect, type Page } from '@playwright/test'

import { addRelativeDialog, formDialog, personSheet } from './locators'

/** The page has hydrated: a press before it would land on server markup that does nothing. */
export const waitForHydration = (page: Page) =>
  page.locator('html[data-hydrated]').waitFor()

export const openHydrated = async (page: Page, url: string): Promise<void> => {
  await page.goto(url)
  await waitForHydration(page)
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
