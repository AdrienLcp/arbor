import { defineDictionary } from '@adrienlcp/i18n'

export const EN_DICTIONARY = defineDictionary({
  app: {
    name: 'Arbor'
  },
  error: {
    screen: {
      home: 'Back to the home page',
      title: 'Something went wrong'
    }
  },
  home: {
    tagline: 'The family tree the whole family keeps up to date together.'
  },
  notFound: {
    home: 'Back to the home page',
    title: 'This page does not exist'
  },
  theme: {
    dark: 'Dark',
    label: 'Appearance',
    light: 'Light',
    system: 'Same as the device'
  }
})
