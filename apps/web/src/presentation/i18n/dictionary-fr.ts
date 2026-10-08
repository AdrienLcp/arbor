import { defineDictionary, defineTranslation } from '@adrienlcp/i18n'

const MEGABYTES = {
  maximumFractionDigits: 1,
  style: 'unit',
  unit: 'megabyte',
  unitDisplay: 'short'
} as const

/** The reference dictionary: its keys are the type every other locale is checked against. */
export const FR_DICTIONARY = defineDictionary({
  app: {
    name: 'Arbor'
  },
  common: {
    failed:
      'Ça n’a pas marché. Vérifiez que le téléphone est connecté à Internet, puis réessayez.',
    home: 'Revenir à l’accueil',
    openTree: 'Ouvrir l’arbre',
    unnamedPerson: 'Sans nom',
    unnamedTree: 'Arbre sans nom'
  },
  createFamily: {
    givenNames: 'Votre prénom',
    givenNamesMissing: 'Écrivez votre prénom.',
    intro:
      'Commencez par vous : vous serez la première personne de l’arbre. Les autres suivront.',
    preview: {
      hint: 'vous',
      label: 'Votre vignette',
      title: 'À coller'
    },
    submit: 'Créer l’arbre',
    surname: 'Votre nom de famille',
    surnameHint: 'Celui que vous portez aujourd’hui.',
    title: 'Créer l’arbre de votre famille',
    treeName: 'Nom de l’arbre',
    treeNameHint: 'Il s’affiche en haut de l’arbre et sur la feuille imprimée.',
    treeNameMissing: 'Donnez un nom à l’arbre.',
    treeNameSuggestion: 'Famille {surname}'
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
      why: 'La famille a remplacé le lien de l’arbre, ou ce téléphone ne l’a jamais reçu. Rien n’est perdu : l’arbre est toujours là.'
    },
    unreachable: {
      retry: 'Réessayer',
      title: 'L’arbre ne répond pas',
      what: 'Vérifiez que le téléphone est connecté à Internet, puis réessayez.'
    }
  },
  familyBar: {
    label: 'Arbre',
    settings: 'Réglages',
    share: 'Partager'
  },
  familyHome: {
    empty: 'Personne dans l’arbre pour l’instant.',
    generation: 'Génération {number:number}',
    openTree: 'Voir l’arbre',
    people: defineTranslation('{count:plural}', {
      plural: { count: { one: '{?} personne', other: '{?} personnes' } }
    }),
    share: 'Inviter la famille',
    you: 'vous'
  },
  familySettings: {
    device: {
      title: 'Sur ce téléphone',
      trees: 'Voir tous mes arbres'
    },
    familyLink: {
      body: 'Si le lien est arrivé chez quelqu’un qui ne devrait pas l’avoir, remplacez-le : l’ancien cessera de marcher tout de suite.',
      confirm: {
        body: 'Les personnes qui ont l’ancien lien ne pourront plus ouvrir l’arbre, jusqu’à ce que vous leur envoyiez le nouveau. Rien de l’arbre n’est effacé.',
        no: 'Annuler',
        title: 'Remplacer le lien de la famille ?',
        yes: 'Remplacer le lien'
      },
      done: 'Le nouveau lien est prêt. Envoyez-le à la famille.',
      replace: 'Remplacer le lien',
      sendNew: 'Envoyer le nouveau lien',
      title: 'Le lien de la famille'
    },
    keeper: {
      title: 'Gardien de l’arbre'
    },
    loading: 'Chargement…',
    newKeeper: {
      body: 'Un gardien peut tout régler, comme vous. Créez un lien de gardien et envoyez-le à la personne choisie.',
      create: 'Créer un lien de gardien',
      linkTitle: 'Lien de gardien',
      ready:
        'Envoyez ce lien maintenant : par sécurité, il ne s’affichera plus ensuite.',
      title: 'Un autre gardien'
    },
    readerLink: {
      active: 'Un lien en lecture seule est actif.',
      body: 'Il montre l’arbre sans permettre de le modifier : pour la belle-famille, ou le QR code d’une feuille imprimée.',
      create: 'Créer le lien',
      hideLiving:
        'Cacher aux lecteurs la date de naissance exacte, les notes et les photos des personnes vivantes',
      none: 'Aucun lien en lecture seule pour l’instant.',
      otherDevice:
        'Il a été créé sur un autre appareil : vous pouvez le désactiver et en créer un nouveau.',
      revoke: 'Désactiver le lien',
      see: 'Voir et envoyer le lien',
      title: 'Le lien en lecture seule'
    },
    title: 'Réglages',
    usage: {
      label: 'Place utilisée par l’arbre et ses photos',
      nearLimit:
        'L’arbre approche de sa limite. Retirer les photos en double libère de la place.',
      title: 'Place',
      value: defineTranslation('{used:number} sur {limit:number}', {
        number: { limit: MEGABYTES, used: MEGABYTES }
      })
    }
  },
  familyShare: {
    copied: 'Lien copié',
    copy: 'Copier le lien',
    copyRefused:
      'Le téléphone a refusé de copier. Le lien est sélectionné : copiez-le à la main.',
    familyLink: {
      description:
        'À envoyer à toute la famille. En l’ouvrant, chacun voit l’arbre et peut le compléter.',
      title: 'Le lien de la famille',
      unknown:
        'Le lien de la famille n’est connu que sur l’appareil qui a créé l’arbre. Pour en avoir un ici, remplacez-le par un nouveau dans les réglages.',
      unknownAction: 'Ouvrir les réglages'
    },
    intro:
      'Envoyez le lien par WhatsApp, SMS ou mail, ou faites scanner le QR code avec l’appareil photo.',
    keeperLink: {
      description:
        'Gardez-le pour vous. Il permet de tout régler, y compris de remplacer le lien de la famille : ne l’envoyez qu’à quelqu’un qui gardera l’arbre avec vous.',
      title: 'Votre lien de gardien'
    },
    qrLabel: 'QR code : {link}',
    readerLink: {
      description:
        'Pour regarder l’arbre sans le modifier : la belle-famille, une feuille imprimée.',
      title: 'Le lien en lecture seule'
    },
    send: 'Envoyer',
    sendTitle: 'L’arbre {name}',
    title: 'Partager l’arbre'
  },
  home: {
    create: 'Créer l’arbre de votre famille',
    fine: 'Gratuit. Pas de compte, pas de mot de passe. Rien ne se perd : chaque modification peut être annulée.',
    lead: 'Votre arbre généalogique, en ligne et à plusieurs. Vous l’envoyez sur WhatsApp, chacun y ajoute les siens, et il s’imprime en grand.',
    openLink: 'J’ai reçu un lien',
    spread: {
      eldest: 'l’aîné que vous connaissez',
      firstChild: 'leur premier enfant',
      generation: 'Génération {number:number}',
      hint: 'Chaque personne a sa place numérotée, même celles qu’on ne connaît pas encore.',
      otherChild: 'un autre enfant',
      partner: 'son épouse ou son époux',
      slotTitle: 'À coller'
    },
    steps: {
      complete: {
        body: 'Chacun ajoute les siens, une date, une photo. Vous imprimez quand vous voulez.',
        title: 'Complétez'
      },
      create: {
        body: 'Donnez votre nom : vous êtes la première vignette de l’arbre.',
        title: 'Créez'
      },
      label: 'En trois étapes',
      send: {
        body: 'Un lien par WhatsApp, SMS ou mail, ou un QR code à scanner.',
        title: 'Envoyez'
      }
    },
    title: 'L’arbre de votre famille',
    titleBlank: 'complété par toute la famille',
    trees: {
      keeper: 'Vous gardez cet arbre',
      reader: 'Lecture seule',
      title: 'Vos arbres'
    }
  },
  me: {
    change: 'Changer',
    is: 'Vous êtes {name}.',
    nobody: 'Vous n’avez pas encore dit qui vous êtes.',
    onlooker: 'Vous regardez l’arbre sans le modifier.',
    reader: 'Ce lien permet de regarder l’arbre, pas de le modifier.'
  },
  notFound: {
    home: 'Revenir à l’accueil',
    title: 'Cette page n’existe pas'
  },
  openLink: {
    field: 'Le lien reçu',
    intro:
      'Collez ici le lien de l’arbre reçu par message. Le message entier convient aussi.',
    notALink:
      'Ce texte ne contient pas de lien d’arbre. Copiez le lien en entier depuis le message reçu, puis collez-le ici.',
    qr: {
      body: 'Ouvrez l’appareil photo du téléphone et visez le code : l’arbre s’ouvre tout seul.',
      title: 'Vous avez un QR code ?'
    },
    submit: 'Ouvrir l’arbre',
    title: 'J’ai reçu un lien'
  },
  sheet: {
    atPlace: 'à {place}',
    back: 'L’arbre',
    birth: 'Naissance',
    birthSurname: 'Nom de naissance',
    death: 'Décès',
    deathUnknown: 'Date et lieu inconnus',
    generation: 'génération {number:number}',
    inPeriod: 'en {date}',
    missing: {
      body: 'Elle a peut-être été mise à la corbeille. Rien n’est perdu : on peut l’en sortir.',
      title: 'Cette personne n’est plus dans l’arbre'
    },
    notes: 'Notes',
    onDay: 'le {date}',
    open: 'Ouvrir la fiche de {name}',
    openShort: 'Sa fiche',
    slot: 'n° {number}',
    title: 'Fiche de {name}',
    union: {
      start: {
        marriage: 'Mariés',
        pacs: 'Pacsés',
        partnership: 'En union libre',
        unknown: 'En couple'
      },
      told: '{word} {when}'
    },
    unions: 'Ses unions',
    unknownPartner: 'Avec une personne inconnue',
    warning: {
      bornAfterChild:
        '{name}, son enfant, a une naissance datée avant la sienne.',
      bornBeforeParent:
        'sa naissance est datée avant celle de {name}, son parent.',
      deathBeforeBirth: 'le décès est daté avant la naissance.',
      title: 'Date à vérifier :'
    }
  },
  theme: {
    dark: 'Sombre',
    label: 'Apparence',
    light: 'Clair',
    system: 'Comme le téléphone'
  },
  tree: {
    dated: '{word} {year}',
    depth: {
      label: 'Générations de chaque côté',
      option: '{count:number}'
    },
    descent: {
      adoption: 'adoption',
      foster: 'famille d’accueil',
      step: 'enfant du conjoint'
    },
    empty: 'Personne dans l’arbre pour l’instant.',
    generation: 'Génération {number:number}',
    generationShort: 'Gén. {number:number}',
    instructions:
      'Les flèches passent d’une personne à sa voisine. Entrée centre l’arbre sur elle.',
    kin: {
      child: {
        adoption: {
          female: 'sa fille adoptive',
          male: 'son fils adoptif',
          unknown: 'son enfant adoptif'
        },
        birth: { female: 'sa fille', male: 'son fils', unknown: 'son enfant' },
        foster: {
          female: 'accueillie par {name}',
          male: 'accueilli par {name}',
          unknown: 'accueilli par {name}'
        },
        step: {
          female: 'élevée par {name}',
          male: 'élevé par {name}',
          unknown: 'élevé par {name}'
        },
        unknown: { female: 'sa fille', male: 'son fils', unknown: 'son enfant' }
      },
      halfSibling: {
        female: 'sa demi-sœur',
        male: 'son demi-frère',
        unknown: 'demi-frère ou demi-sœur'
      },
      parent: {
        adoption: {
          female: 'sa mère adoptive',
          male: 'son père adoptif',
          unknown: 'son parent adoptif'
        },
        birth: { female: 'sa mère', male: 'son père', unknown: 'son parent' },
        foster: {
          female: 'sa mère d’accueil',
          male: 'son père d’accueil',
          unknown: 'son parent d’accueil'
        },
        step: {
          female: 'sa belle-mère',
          male: 'son beau-père',
          unknown: 'son beau-parent'
        },
        unknown: { female: 'sa mère', male: 'son père', unknown: 'son parent' }
      },
      partner: {
        marriage: {
          female: 'son épouse',
          male: 'son époux',
          unknown: 'son conjoint'
        },
        none: {
          female: 'l’autre parent',
          male: 'l’autre parent',
          unknown: 'l’autre parent'
        },
        pacs: {
          female: 'sa partenaire de PACS',
          male: 'son partenaire de PACS',
          unknown: 'partenaire de PACS'
        },
        partnership: {
          female: 'sa compagne',
          male: 'son compagnon',
          unknown: 'en couple'
        },
        unknown: {
          female: 'sa compagne',
          male: 'son compagnon',
          unknown: 'en couple'
        }
      },
      sibling: {
        female: 'sa sœur',
        male: 'son frère',
        unknown: 'son frère ou sa sœur'
      },
      stepSibling: {
        female: 'élevée aussi par {name}',
        male: 'élevé aussi par {name}',
        unknown: 'élevé aussi par {name}'
      },
      withParent: '{word}, avec {name}'
    },
    missing: defineTranslation('{count:plural}', {
      plural: { count: { one: '{?} à compléter', other: '{?} à compléter' } }
    }),
    outline: {
      children: 'Les enfants de {name}',
      label: 'Toute la famille, en liste',
      repeated: '{name}, déjà nommé plus haut',
      with: 'avec {name}',
      withUnknown: 'avec une personne inconnue'
    },
    people: defineTranslation('{count:plural}', {
      plural: { count: { one: '{?} personne', other: '{?} personnes' } }
    }),
    scope: {
      around: 'Autour d’une personne',
      label: 'Afficher',
      list: 'En liste',
      page: 'Page par page',
      whole: 'Toute la famille'
    },
    search: {
      empty: 'Personne de ce nom dans l’arbre.',
      label: 'Chercher quelqu’un',
      placeholder: 'Un prénom, un nom'
    },
    spread: {
      children: 'Ses enfants',
      childrenEmpty: 'Pas encore d’enfant dans l’arbre.',
      focus: '{name} et ses unions',
      next: 'Descendre vers {name}',
      page: 'page de {name}',
      parents: 'Ses parents',
      parentsEmpty: 'Ses parents ne sont pas encore dans l’arbre.',
      previous: 'Monter vers {name}',
      siblings: 'Ses frères et sœurs',
      unknownPartner: {
        hint: 'l’autre parent',
        title: 'Inconnu'
      }
    },
    titleAround: 'L’arbre, autour de {name}',
    titleWhole: 'L’arbre de toute la famille',
    union: {
      marriage: 'mariés',
      pacs: 'pacsés',
      partnership: 'union libre',
      unknown: 'en couple'
    },
    unionEnd: {
      divorce: 'divorcés',
      separation: 'séparés'
    },
    unknownParent: {
      hint: 'parent inconnu',
      title: 'Inconnu'
    },
    years: '{first} – {last}',
    zoom: {
      fit: 'Voir tout l’arbre',
      in: 'Agrandir',
      label: 'Zoom',
      out: 'Réduire',
      recentre: 'Revenir sur la personne au centre'
    }
  },
  whoAmI: {
    intro:
      'Touchez votre nom. Vos modifications seront signées ainsi : la famille saura qui a fait quoi.',
    noMatch: 'Personne ne porte ce nom dans l’arbre.',
    notInTree: {
      action: 'Je ne suis pas dans l’arbre',
      field: 'Votre prénom et votre nom',
      hint: 'Ils signeront vos modifications, en attendant que vous ayez votre vignette.',
      missing: 'Écrivez votre prénom et votre nom.',
      submit: 'Continuer'
    },
    onlooker: 'Je veux seulement regarder',
    search: {
      clear: 'Effacer',
      label: 'Chercher votre nom',
      placeholder: 'Prénom ou nom'
    },
    title: 'Qui êtes-vous dans cet arbre ?'
  }
})
