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
    .locator('.shared-link-address'),
  openTree: page.getByRole('link', { name: 'Open the tree' })
})

export const familyAppBar = (page: Page) => ({
  familyName: (treeName: string) =>
    page.getByRole('banner').getByRole('link', { name: treeName }),
  settings: page.getByRole('link', { name: 'Settings' })
})

/** "Who are you?" over the tree: asked before the first change, or when the visitor offers to say it. */
export const whoAmIDialog = (page: Page) => {
  const dialog = page.locator('.who-am-i-dialog')
  return {
    beforeEdit: page.getByRole('heading', {
      name: 'Before you change anything: who are you in this tree?'
    }),
    person: (name: string) => dialog.getByRole('button', { name })
  }
}

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

/** A class, not the `dialog` role: a react-aria `Select`'s popover is a dialog too, still fading out as the form closes. */
export const formDialog = (page: Page) => page.locator('.form-dialog')

export const treePage = (page: Page) => ({
  /** Touching a person on the tree opens their sheet. */
  person: (name: string) => page.getByRole('button', { name }).first(),
  /** The invitation of a visitor who has not said who they are yet. */
  sayWhoYouAre: page.getByRole('button', { name: 'Say who you are' }),
  title: (focusName: string) =>
    page.getByRole('heading', {
      level: 1,
      name: `The tree, around ${focusName}`
    }),
  youAre: (name: string) => page.getByText(`You are ${name}.`)
})

export const personSheet = (page: Page) => ({
  addPhoto: page.getByRole('button', { name: 'Add a photo' }),
  addRelative: page.getByRole('button', {
    name: 'Add a child, a parent, a partner…'
  }),
  bin: page.getByRole('button', { name: 'Put in the bin' }),
  close: page.getByRole('button', { exact: true, name: 'Close' }),
  /** The dialog repeats the button's name, so the confirmation is found inside it. */
  confirmBin: page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Put in the bin' }),
  editPerson: page.getByRole('button', { name: 'Fix some information' }),
  photo: (caption: string) => page.getByRole('button', { name: caption }),
  /** The `FileTrigger`'s own input: the button opens the phone's picker, which a journey cannot drive. */
  photoInput: page.locator('.person-photos input[type="file"]'),
  /** Anchored: the tree under the sheet has its own buttons naming the same people ("Down to …"). */
  relative: (name: string) =>
    page.getByRole('button', { name: new RegExp(`^${name}`) })
})

export const addRelativeDialog = (page: Page) => {
  const dialog = formDialog(page)
  return {
    choice: (title: string) =>
      dialog.getByRole('button', { name: new RegExp(`^${title}`) }),
    givenNames: dialog.getByLabel('Given names'),
    save: dialog.getByRole('button', { name: 'Add to the tree' }),
    surname: dialog.getByLabel('Surname')
  }
}

export const editPersonDialog = (page: Page) => {
  const dialog = formDialog(page)
  const birth = dialog.getByRole('group', { name: 'Date of birth' })
  return {
    birthCertainty: birth.getByRole('button', { name: /How sure/ }),
    birthYear: birth.getByLabel('Year'),
    /** The certainty is a react-aria `Select`: its options live in a popover outside the dialog. */
    certainty: (word: string) => page.getByRole('option', { name: word }),
    givenNames: dialog.getByLabel('Given names'),
    save: dialog.getByRole('button', { name: 'Save' })
  }
}

export const addPhotoDialog = (page: Page) => {
  const dialog = formDialog(page)
  return {
    asPortrait: dialog.getByText(/Make it .*’s portrait/),
    caption: dialog.getByLabel('Caption'),
    save: dialog.getByRole('button', { name: 'Add the photo' })
  }
}

export const historyPage = (page: Page) => ({
  /** The family comes back to right after the entry that says this. */
  goBackAfter: (sentence: string) =>
    page
      .locator('.history-entry')
      .filter({ hasText: sentence })
      .getByRole('button', { name: /^Put the tree back as it was at/ }),
  line: (sentence: string) =>
    page.getByRole('listitem').filter({ hasText: sentence }).first(),
  undoneBy: (name: string) => page.getByText(`Undone by ${name} on`)
})

export const restoreDialog = (page: Page) => {
  const dialog = page.getByRole('alertdialog')
  return {
    confirm: dialog.getByRole('button', { name: 'Go back to this moment' }),
    dialog,
    group: (title: string) => dialog.getByRole('region', { name: title })
  }
}
