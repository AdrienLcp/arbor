import { defineDictionary } from '@adrienlcp/i18n'

/** The reference dictionary: its keys are the type every other locale is checked against. */
export const FR_DICTIONARY = defineDictionary({
  app: {
    name: 'Arbor'
  },
  common: {
    home: 'Revenir à l’accueil'
  },
  createFamily: {
    title: 'Créer l’arbre de votre famille'
  },
  error: {
    screen: {
      home: 'Revenir à l’accueil',
      title: 'Quelque chose s’est mal passé'
    }
  },
  family: {
    refused: {
      newLink: 'J’ai reçu un nouveau lien',
      title: 'Ce lien ne fonctionne plus',
      what: 'Demandez le nouveau lien à quelqu’un de la famille, puis ouvrez-le ou collez-le ici.',
      why: 'La famille a remplacé le lien de l’arbre, ou ce téléphone ne l’a jamais reçu. Rien n’est perdu : l’arbre est toujours là.'
    },
    unreachable: {
      retry: 'Réessayer',
      title: 'L’arbre ne répond pas',
      what: 'Vérifiez que le téléphone est connecté à Internet, puis réessayez.'
    }
  },
  familySettings: {
    title: 'Réglages'
  },
  familyShare: {
    title: 'Partager l’arbre'
  },
  home: {
    tagline: 'L’arbre de famille que toute la famille tient à jour ensemble.'
  },
  notFound: {
    home: 'Revenir à l’accueil',
    title: 'Cette page n’existe pas'
  },
  openLink: {
    title: 'J’ai reçu un lien'
  },
  theme: {
    dark: 'Sombre',
    label: 'Apparence',
    light: 'Clair',
    system: 'Comme le téléphone'
  },
  whoAmI: {
    title: 'Qui êtes-vous dans cet arbre ?'
  }
})
