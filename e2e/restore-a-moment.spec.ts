import { expect, test } from '@playwright/test'

import {
  addRelative,
  openHydrated,
  openSheetFromTree
} from './support/journeys'
import {
  createFamilyPage,
  editPersonDialog,
  formDialog,
  historyPage,
  homePage,
  personSheet,
  restoreDialog,
  sharePage,
  treePage,
  whoAmIPage
} from './support/locators'

const PHONE = { height: 844, width: 390 }

const KEEPER = { givenNames: 'Jeanne', surname: 'Delorme' }
const KEEPER_NAME = `${KEEPER.givenNames} ${KEEPER.surname}`
const PARTNER = { givenNames: 'Louis', surname: 'Martin' }
const PARTNER_NAME = `${PARTNER.givenNames} ${PARTNER.surname}`
/** Children take the surname of the person whose sheet adds them. */
const CHILDREN = ['Rose', 'Paul', 'Marc'].map((givenNames) => ({
  givenNames,
  name: `${givenNames} ${KEEPER.surname}`
}))
const RENAMES = [
  { after: 'Jeannette', person: KEEPER },
  { after: 'Lewis', person: PARTNER }
]

/**
 * A contributor's bad afternoon: three people in the bin, two renamed. The
 * keeper puts the whole family back as it was before, in one action, and the
 * history keeps both the mistakes and the return.
 */
test('[e2e] the keeper puts the tree back as it was before a contributor binned three people and renamed two', async ({
  browser
}) => {
  const keeper = await (await browser.newContext({ viewport: PHONE })).newPage()
  const contributor = await (
    await browser.newContext({ viewport: PHONE })
  ).newPage()

  await openHydrated(keeper, '/')
  await homePage(keeper).createTree.click()
  const form = createFamilyPage(keeper)
  await form.givenNames.fill(KEEPER.givenNames)
  await form.surname.fill(KEEPER.surname)
  await form.submit.click()
  const link = await sharePage(keeper).familyLink.innerText()
  await sharePage(keeper).openTree.click()
  await openSheetFromTree(keeper, KEEPER_NAME)
  await addRelative(keeper, 'A partner', PARTNER)
  for (const { givenNames } of CHILDREN) {
    await addRelative(keeper, 'A child', { givenNames })
  }

  await openHydrated(contributor, link)
  await whoAmIPage(contributor).person(PARTNER_NAME).click()
  await expect(treePage(contributor).title(PARTNER_NAME)).toBeAttached()
  const sheet = personSheet(contributor)
  for (const { name } of CHILDREN) {
    await openSheetFromTree(contributor, name)
    await sheet.bin.click()
    await sheet.confirmBin.click()
    await expect(contributor.getByRole('alertdialog')).toBeHidden()
  }
  for (const { after, person } of RENAMES) {
    await openSheetFromTree(
      contributor,
      `${person.givenNames} ${person.surname}`
    )
    await sheet.editPerson.click()
    await editPersonDialog(contributor).givenNames.fill(after)
    await editPersonDialog(contributor).save.click()
    await expect(formDialog(contributor)).toBeHidden()
    await sheet.close.click()
  }

  const familyPath = new URL(link).pathname
  await openHydrated(keeper, `${familyPath}/history`)
  const history = historyPage(keeper)
  await history.goBackAfter(`added ${CHILDREN.at(-1)?.name}, child of`).click()
  const restore = restoreDialog(keeper)
  for (const { name } of CHILDREN) {
    await expect(
      restore.group('Come back into the tree').getByText(name),
      `the preview says ${name} comes back`
    ).toBeVisible()
  }
  for (const { after, person } of RENAMES) {
    await expect(
      restore.dialog.getByText(
        `${after} ${person.surname} becomes ${person.givenNames} ${person.surname} again`
      ),
      'the preview says who gets their name back'
    ).toBeVisible()
  }
  await restore.confirm.click()
  await expect(restore.dialog).toBeHidden()

  await expect(
    history.line('put the tree back as it was on'),
    'the return to the past moment is an entry of the history'
  ).toBeVisible()
  await expect(
    history.undoneBy(KEEPER_NAME),
    'the contributor’s changes stay in the history, marked as undone'
  ).toHaveCount(CHILDREN.length + RENAMES.length)

  await openHydrated(keeper, `${familyPath}/tree`)
  await expect(
    keeper.getByRole('heading', { name: `The tree, around ${KEEPER_NAME}` }),
    'the keeper has their name of before'
  ).toBeVisible()
  for (const name of [PARTNER_NAME, ...CHILDREN.map(({ name }) => name)]) {
    await expect(
      treePage(keeper).person(name),
      `the tree shows ${name} again, by their name of before`
    ).toBeVisible()
  }
})
