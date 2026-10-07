import { defineDictionary } from '@adrienlcp/i18n'

export const EN_DICTIONARY = defineDictionary({
  app: {
    name: 'Arbor'
  },
  common: {
    home: 'Back to the home page'
  },
  createFamily: {
    title: 'Create your family’s tree'
  },
  error: {
    screen: {
      home: 'Back to the home page',
      title: 'Something went wrong'
    }
  },
  family: {
    refused: {
      newLink: 'I received a new link',
      title: 'This link no longer works',
      what: 'Ask someone in the family for the new link, then open it or paste it here.',
      why: 'The family replaced the tree’s link, or this phone never received it. Nothing is lost: the tree is still there.'
    },
    unreachable: {
      retry: 'Try again',
      title: 'The tree is not answering',
      what: 'Check that the phone is connected to the Internet, then try again.'
    }
  },
  familySettings: {
    title: 'Settings'
  },
  familyShare: {
    title: 'Share the tree'
  },
  home: {
    tagline: 'The family tree the whole family keeps up to date together.'
  },
  notFound: {
    home: 'Back to the home page',
    title: 'This page does not exist'
  },
  openLink: {
    title: 'I received a link'
  },
  theme: {
    dark: 'Dark',
    label: 'Appearance',
    light: 'Light',
    system: 'Same as the device'
  },
  whoAmI: {
    title: 'Who are you in this tree?'
  }
})
