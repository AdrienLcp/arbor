import { expect, test } from '@playwright/test'

import {
  addRelative,
  openHydrated,
  openSheetFromTree,
  waitForHydration
} from './support/journeys'
import {
  addPhotoDialog,
  createFamilyPage,
  editPersonDialog,
  formDialog,
  homePage,
  personSheet,
  sharePage,
  treePage,
  whoAmIDialog
} from './support/locators'

const PHONE = { height: 844, width: 390 }

const FOUNDER = { givenNames: 'Jeanne', surname: 'Delorme' }
const FOUNDER_NAME = `${FOUNDER.givenNames} ${FOUNDER.surname}`
const RENAMED_GIVEN_NAMES = 'Jeanne Marie'
const RENAMED_FOUNDER_NAME = `${RENAMED_GIVEN_NAMES} ${FOUNDER.surname}`
const FIRST_SPOUSE = { givenNames: 'Louis', surname: 'Martin' }
const FIRST_SPOUSE_NAME = `${FIRST_SPOUSE.givenNames} ${FIRST_SPOUSE.surname}`
const SECOND_SPOUSE = { givenNames: 'Paul', surname: 'Garnier' }
const SECOND_SPOUSE_NAME = `${SECOND_SPOUSE.givenNames} ${SECOND_SPOUSE.surname}`
/** A child takes the surname of the person the sheet belongs to. */
const CHILD_NAME = `Rose ${FOUNDER.surname}`
const PHOTO_CAPTION = 'Jeanne at the seaside'

/** The smallest PNG a browser decodes: the photo is resized in the page before it is sent. */
const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

/**
 * Two phones again: the founder edits from Jeanne's sheet while a relative,
 * signed as Louis, only sees the edits once their page reloads, then saves over stale sheets.
 */
test('[e2e] a sheet adds a couple’s child, a second spouse, an approximate date and a photo, seen from a second phone', async ({
  browser
}) => {
  const founder = await (
    await browser.newContext({ viewport: PHONE })
  ).newPage()
  const relative = await (
    await browser.newContext({ viewport: PHONE })
  ).newPage()

  await openHydrated(founder, '/')
  await homePage(founder).createTree.click()
  const form = createFamilyPage(founder)
  await form.givenNames.fill(FOUNDER.givenNames)
  await form.surname.fill(FOUNDER.surname)
  await form.submit.click()
  const link = await sharePage(founder).familyLink.innerText()

  await sharePage(founder).openTree.click()
  await openSheetFromTree(founder, FOUNDER_NAME)
  const sheet = personSheet(founder)

  await addRelative(founder, 'A partner', FIRST_SPOUSE)
  await expect(
    sheet.relative(FIRST_SPOUSE_NAME),
    'the first spouse joins the sheet’s unions'
  ).toBeVisible()

  await openHydrated(relative, link)
  await expect(treePage(relative).sayWhoYouAre).toBeAttached()

  await addRelative(founder, 'A child', { givenNames: 'Rose' })
  await expect(
    sheet.relative(CHILD_NAME),
    'the child of the couple shows on the sheet'
  ).toBeVisible()

  await addRelative(founder, 'A partner', SECOND_SPOUSE)
  await expect(
    sheet.relative(SECOND_SPOUSE_NAME),
    'a second spouse sits beside the first'
  ).toBeVisible()
  await expect(sheet.relative(FIRST_SPOUSE_NAME)).toBeVisible()

  await sheet.editPerson.click()
  const edit = editPersonDialog(founder)
  await edit.birthCertainty.click()
  await edit.certainty('About').click()
  await edit.birthYear.fill('1948')
  await edit.save.click()
  await expect(formDialog(founder)).toBeHidden()
  await expect(
    founder.getByText(/about 1948/i).first(),
    'the approximate birth date reads as such on the sheet'
  ).toBeVisible()

  await sheet.photoInput.setInputFiles({
    buffer: ONE_PIXEL_PNG,
    mimeType: 'image/png',
    name: 'jeanne.png'
  })
  const photo = addPhotoDialog(founder)
  await photo.caption.fill(PHOTO_CAPTION)
  await photo.asPortrait.click()
  await photo.save.click()
  await expect(formDialog(founder)).toBeHidden()
  await expect(
    sheet.photo(PHOTO_CAPTION),
    'the photo joins the sheet'
  ).toBeVisible()

  await sheet.close.click()
  for (const name of [FIRST_SPOUSE_NAME, SECOND_SPOUSE_NAME, CHILD_NAME]) {
    await expect(
      treePage(founder).person(name),
      `the tree shows ${name}`
    ).toBeVisible()
  }

  await relative.reload()
  await waitForHydration(relative)
  await openSheetFromTree(relative, FOUNDER_NAME)
  const relativeSheet = personSheet(relative)
  for (const name of [SECOND_SPOUSE_NAME, CHILD_NAME]) {
    await expect(
      relativeSheet.relative(name),
      `the second phone sees ${name} after reloading`
    ).toBeVisible()
  }
  await expect(relative.getByText(/about 1948/i).first()).toBeVisible()
  await expect(relativeSheet.photo(PHOTO_CAPTION)).toBeVisible()

  await relativeSheet.editPerson.click()
  await whoAmIDialog(relative).person(FIRST_SPOUSE_NAME).click()
  const relativeEdit = editPersonDialog(relative)
  await relativeEdit.birthYear.fill('1947')
  await openSheetFromTree(founder, FOUNDER_NAME)
  await sheet.editPerson.click()
  await edit.givenNames.fill(RENAMED_GIVEN_NAMES)
  await edit.save.click()
  await expect(formDialog(founder)).toBeHidden()
  await relativeEdit.save.click()
  await expect(formDialog(relative)).toBeHidden()
  await expect(
    relative.getByRole('heading', { exact: true, name: RENAMED_FOUNDER_NAME }),
    'a change made over an older sheet keeps what someone else changed meanwhile'
  ).toBeVisible()
  await expect(relative.getByText(/about 1947/i).first()).toBeVisible()

  await relativeSheet.relative(SECOND_SPOUSE_NAME).click()
  await relativeSheet.editPerson.click()
  await sheet.relative(SECOND_SPOUSE_NAME).click()
  await sheet.bin.click()
  await sheet.confirmBin.click()
  await expect(founder.getByRole('alertdialog')).toBeHidden()
  await relativeEdit.givenNames.fill('Paul Henri')
  await relativeEdit.save.click()
  await expect(
    relative.getByText(
      `${RENAMED_FOUNDER_NAME} just put this sheet in the bin: your change was not saved.`
    ),
    'a change to someone put in the bin meanwhile is refused, saying who binned them, by the name they have now'
  ).toBeVisible()
})
