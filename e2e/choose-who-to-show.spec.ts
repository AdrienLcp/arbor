import { expect, test } from '@playwright/test'

import { openHydrated } from './support/journeys'
import { treePage } from './support/locators'

const DEMO_TREE_PATH = '/f/dem0fam1ym0re100/tree'
const DEMO_PRINT_PATH = '/f/dem0fam1ym0re100/print'
const COMPUTER = { height: 900, width: 1440 }

test('[e2e] unticking someone hides who hangs on the tree through them, on screen and on paper, until a tick brings them back', async ({
  browser
}) => {
  const page = await (
    await browser.newContext({ viewport: COMPUTER })
  ).newPage()
  await openHydrated(page, DEMO_TREE_PATH)
  const tree = treePage(page)
  // Not a substring: "Jeanne Morel" holds "anne Morel".
  const anne = page.getByRole('button', { name: /^Anne Morel/ })

  await tree.choose.click()
  await tree.person('Pierre Morel').click()
  await expect(
    tree.chooseSentence,
    'Pierre leaves, and his descendants and partners with him'
  ).toContainText('Hidden: Pierre Morel. Leaving with them:')
  await expect(tree.chooseSentence).toContainText('Anne Morel')
  await tree.chooseDone.click()

  await expect(anne).toHaveCount(0)
  await expect(tree.person('Simone Morel')).toBeVisible()
  await expect(page.getByText(/people hidden on this device/)).toBeVisible()

  await openHydrated(page, DEMO_PRINT_PATH)
  await expect(
    page.getByText('Simone', { exact: true }).first(),
    'the print shows who is kept'
  ).toBeVisible()
  await expect(
    page.getByText('Anne', { exact: true }),
    'and follows the choice'
  ).toHaveCount(0)

  await openHydrated(page, DEMO_TREE_PATH)
  await tree.choose.click()
  await anne.click()
  await expect(
    tree.chooseSentence,
    'ticking Anne back brings back the link she hangs from'
  ).toContainText(
    'Back: Anne Morel, and Pierre Morel, their link with the tree'
  )
  await tree.chooseDone.click()
  await expect(anne).toBeVisible()
})
