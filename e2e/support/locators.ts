import type { Page } from '@playwright/test'

/** Roles and accessible names in one place: a renamed button breaks one line instead of every spec. */
export const homePage = (page: Page) => ({
  createTree: page.getByRole('link', { name: 'Create your family’s tree' })
})

export const createFamilyPage = (page: Page) => ({
  givenNames: page.getByLabel('Your first name'),
  submit: page.getByRole('button', { name: 'Create the tree' }),
  surname: page.getByLabel('Your last name')
})

export const sharePage = (page: Page) => ({
  /**
   * What the QR code encodes and the share sheet sends. A class rather than a role:
   * the address is prose, with no role of its own.
   */
  familyLink: page
    .getByRole('region', { name: 'The family link' })
    .locator('.shared-link-address')
})

export const familyAppBar = (page: Page) => ({
  settings: page.getByRole('link', { name: 'Settings' })
})

export const familyHomePage = (page: Page) => ({
  title: (treeName: string) =>
    page.getByRole('heading', { level: 1, name: treeName }),
  youAre: (name: string) => page.getByText(`You are ${name}.`)
})

export const whoAmIPage = (page: Page) => ({
  person: (name: string) => page.getByRole('button', { name }),
  title: page.getByRole('heading', { name: 'Who are you in this tree?' })
})

export const familySettingsPage = (page: Page) => ({
  /** The dialog repeats the button's name, so the confirmation is found inside it. */
  confirmReplace: page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Replace the link' }),
  replaced: page.getByText('The new link is ready. Send it to the family.'),
  replaceLink: page.getByRole('button', { name: 'Replace the link' })
})

export const linkRefusedScreen = (page: Page) => ({
  title: page.getByRole('heading', { name: 'This link no longer works' })
})
