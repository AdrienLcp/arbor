import { defineDictionary } from '@adrienlcp/i18n'

/** The reference dictionary: its keys are the type every other locale is checked against. */
export const FR_DICTIONARY = defineDictionary({
  app: {
    name: 'Arbor'
  },
  error: {
    screen: {
      home: 'Revenir à l’accueil',
      title: 'Quelque chose s’est mal passé'
    }
  },
  home: {
    tagline: 'L’arbre de famille que toute la famille tient à jour ensemble.'
  },
  notFound: {
    home: 'Revenir à l’accueil',
    title: 'Cette page n’existe pas'
  },
  theme: {
    dark: 'Sombre',
    label: 'Apparence',
    light: 'Clair',
    system: 'Comme le téléphone'
  }
})
