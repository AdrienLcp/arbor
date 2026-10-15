import { expect, test } from '@playwright/test'

import {
  createFamilyFromHome,
  openHydrated,
  waitForHydration
} from './support/journeys'
import {
  familyAppBar,
  familySettingsPage,
  linkRefusedScreen,
  treePage,
  whoAmIDialog
} from './support/locators'

const FOUNDER = { givenNames: 'Jeanne', surname: 'Delorme' }
const FOUNDER_NAME = `${FOUNDER.givenNames} ${FOUNDER.surname}`
/** What the create form suggests from the surname while the tree name is left alone. */
const TREE_NAME = `The ${FOUNDER.surname} family`
const RENAMED_TREE_NAME = `The ${FOUNDER.surname} tree`

/**
 * Two phones: the founder's, and a relative's that only ever receives the link.
 * Separate browser contexts, so nothing the founder's device remembers leaks to the relative's.
 */
test('[e2e] a family is created, joined through its link, renamed, and locked out once the link is replaced', async ({
  browser
}) => {
  const founder = await (await browser.newContext()).newPage()
  const relative = await (await browser.newContext()).newPage()

  const link = await createFamilyFromHome(founder, FOUNDER)

  await openHydrated(relative, link)
  await expect(
    familyAppBar(relative).familyName(TREE_NAME),
    'a relative arriving by the link lands on the family’s tree'
  ).toBeVisible()
  await expect(
    treePage(relative).sayWhoYouAre,
    'the tree invites the relative to say who they are, without asking first'
  ).toBeVisible()
  await treePage(relative).sayWhoYouAre.click()
  await whoAmIDialog(relative).person(FOUNDER_NAME).click()
  await expect(
    treePage(relative).youAre(FOUNDER_NAME),
    'the relative’s choice is remembered'
  ).toBeVisible()

  await familyAppBar(founder).settings.click()
  const settings = familySettingsPage(founder)
  await settings.familyName.fill(RENAMED_TREE_NAME)
  await settings.saveName.click()
  await expect(
    familyAppBar(founder).familyName(RENAMED_TREE_NAME),
    'the keeper renames the family, and the bar shows the new name'
  ).toBeVisible()

  await settings.replaceLink.click()
  await settings.confirmReplace.click()
  await expect(
    settings.replaced,
    'the keeper is told the new link is ready'
  ).toBeVisible()

  await relative.reload()
  await waitForHydration(relative)
  await expect(
    linkRefusedScreen(relative).title,
    'the old link no longer opens the tree'
  ).toBeVisible()
})
