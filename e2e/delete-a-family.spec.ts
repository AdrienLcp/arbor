import { expect, test } from '@playwright/test'

import { openHydrated, waitForHydration } from './support/journeys'
import {
  createFamilyPage,
  familyAppBar,
  familySettingsPage,
  homePage,
  linkRefusedScreen,
  sharePage
} from './support/locators'

const FOUNDER = { givenNames: 'Paul', surname: 'Vernier' }
/** What the create form suggests from the surname while the tree name is left alone. */
const TREE_NAME = `The ${FOUNDER.surname} family`

/**
 * The keeper's phone and a relative's: once the keeper types the family's name,
 * the family is gone for both, and the keeper's device no longer lists it.
 */
test('[e2e] a keeper deletes the family after typing its name, and its link opens nothing any more', async ({
  browser
}) => {
  const keeper = await (await browser.newContext()).newPage()
  const relative = await (await browser.newContext()).newPage()

  await openHydrated(keeper, '/')
  await homePage(keeper).createTree.click()
  const form = createFamilyPage(keeper)
  await form.givenNames.fill(FOUNDER.givenNames)
  await form.surname.fill(FOUNDER.surname)
  await form.submit.click()
  const familyLink = sharePage(keeper).familyLink
  await expect(familyLink).toHaveText(/#/)
  await openHydrated(relative, await familyLink.innerText())
  await expect(familyAppBar(relative).familyName(TREE_NAME)).toBeVisible()

  await familyAppBar(keeper).settings.click()
  const settings = familySettingsPage(keeper)
  await settings.deleteFamily.click()
  await expect(
    settings.confirmDelete,
    'nothing is deleted before the name is typed'
  ).toBeDisabled()
  await settings.deleteName.fill('The Vernie family')
  await expect(
    settings.confirmDelete,
    'a name that is not the family’s deletes nothing'
  ).toBeDisabled()
  await settings.deleteName.fill(TREE_NAME.toLowerCase())
  await settings.confirmDelete.click()

  await expect(
    homePage(keeper).deleted(TREE_NAME),
    'the keeper lands on the home page, told the family is gone'
  ).toBeVisible()
  await expect(
    homePage(keeper).rememberedTree(TREE_NAME),
    'the keeper’s device no longer lists the family'
  ).toHaveCount(0)
  expect(
    await keeper.evaluate(() => localStorage.getItem('arbor:families')),
    'the device forgot the family’s keys'
  ).toBe('{}')

  await relative.reload()
  await waitForHydration(relative)
  await expect(
    linkRefusedScreen(relative).title,
    'the family link opens nothing any more'
  ).toBeVisible()
})
