import { expect, test } from '@playwright/test'

import {
  addRelative,
  createFamilyFromHome,
  openSheetFromTree
} from './support/journeys'
import {
  addPersonDialog,
  formDialog,
  personSheet,
  treePage
} from './support/locators'

const PHONE = { height: 844, width: 390 }
const FOUNDER = { givenNames: 'Claire', surname: 'Dubois' }
const FOUNDER_NAME = `${FOUNDER.givenNames} ${FOUNDER.surname}`
/** A brother takes the surname of the person whose sheet adds him. */
const BROTHER_NAME = `Henri ${FOUNDER.surname}`
const GREAT_AUNT = { givenNames: 'Odette', surname: 'Morel' }

test('[e2e] a brother is added to someone with no parents, and someone else to no one', async ({
  browser
}) => {
  const page = await (await browser.newContext({ viewport: PHONE })).newPage()
  await createFamilyFromHome(page, FOUNDER)
  await openSheetFromTree(page, FOUNDER_NAME)

  await addRelative(page, 'Add a brother or a sister', { givenNames: 'Henri' })
  await expect(
    personSheet(page).relative(BROTHER_NAME),
    'the brother joins the sheet, though nobody knows their parents yet'
  ).toBeVisible()

  await personSheet(page).close.click()
  await treePage(page).add.click()
  const dialog = addPersonDialog(page)
  await dialog.givenNames.fill(GREAT_AUNT.givenNames)
  await dialog.surname.fill(GREAT_AUNT.surname)
  await dialog.tie('Not linked yet').click()
  await dialog.save.click()
  await expect(formDialog(page)).toBeHidden()
  await expect(
    treePage(page).unplaced(`${GREAT_AUNT.givenNames} ${GREAT_AUNT.surname}`),
    'someone tied to no one waits beside the tree'
  ).toBeVisible()
})
