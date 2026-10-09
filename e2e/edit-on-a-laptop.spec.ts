import { expect, test } from '@playwright/test'

import { openHydrated } from './support/journeys'
import {
  editPersonDialog,
  formDialog,
  personSheet,
  whoAmIDialog
} from './support/locators'

/** A common laptop screen: shorter than the person form, which must scroll inside its floating panel. */
const LAPTOP = { height: 768, width: 1366 }

const DEMO_FAMILY_PATH = '/f/demo-famille-morel-001'
const VISITOR_NAME = 'Michel Morel'
const RENAMED_GIVEN_NAMES = 'Auguste Jean'

test('[e2e] on a laptop, the person form scrolls to its save button and saves', async ({
  browser
}) => {
  const page = await (await browser.newContext({ viewport: LAPTOP })).newPage()

  await openHydrated(page, `${DEMO_FAMILY_PATH}/tree/auguste-morel`)

  await personSheet(page).editPerson.click()
  await expect(
    whoAmIDialog(page).beforeEdit,
    'a visitor who never said who they are is asked before their first change'
  ).toBeVisible()
  await whoAmIDialog(page).person(VISITOR_NAME).click()
  const dialog = editPersonDialog(page)
  await dialog.givenNames.fill(RENAMED_GIVEN_NAMES)
  await dialog.save.click()

  await expect(formDialog(page), 'the saved form closes').toBeHidden()
  await expect(
    page.getByRole('heading', { name: `${RENAMED_GIVEN_NAMES} Morel` }),
    'the sheet shows the new given names'
  ).toBeVisible()
})
