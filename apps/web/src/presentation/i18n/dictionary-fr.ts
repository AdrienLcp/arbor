import { defineDictionary, defineTranslation } from '@adrienlcp/i18n'

const MEGABYTES = {
  maximumFractionDigits: 1,
  style: 'unit',
  unit: 'megabyte',
  unitDisplay: 'short'
} as const

const UNION_WORDS_FR = {
  marriage: 'le mariage',
  pacs: 'le PACS',
  partnership: 'l’union libre',
  unknown: 'le couple'
} as const

/** The reference dictionary: its keys are the type every other locale is checked against. */
export const FR_DICTIONARY = defineDictionary({
  add: {
    alone: 'Sans autre parent connu',
    childKind: {
      adoption: 'Adoption',
      birth: 'Naissance',
      foster: 'Accueil',
      step: 'Élevé'
    },
    linkKind: 'Son lien avec {name}',
    open: 'Ajouter un enfant, un parent, un conjoint…',
    otherChoice: 'Choisir un autre lien',
    parentKind: {
      adoption: 'Adoption',
      birth: 'Naissance',
      foster: 'Accueil',
      step: 'Beau-parent'
    },
    quick: {
      child: 'Ajouter un enfant',
      parent: 'Ajouter un parent'
    },
    relation: {
      child: {
        dialog: 'Ajouter un enfant de {name}',
        hint: 'né, adopté ou élevé par {name}',
        title: 'Un enfant'
      },
      parent: {
        dialog: 'Ajouter un parent de {name}',
        hint: 'la mère ou le père de {name}, ou qui l’a élevé',
        title: 'Un parent'
      },
      partner: {
        dialog: 'Ajouter un conjoint de {name}',
        hint: 'mariage, PACS ou union libre avec {name}',
        title: 'Un conjoint'
      },
      sibling: {
        dialog: 'Ajouter un frère ou une sœur de {name}',
        hint: 'un autre enfant des parents de {name}',
        needsParent:
          'Ajoutez d’abord un de ses parents : le frère ou la sœur sera leur enfant.',
        title: 'Un frère ou une sœur'
      }
    },
    save: 'Ajouter à l’arbre',
    siblingParents: 'Enfant de {names}, comme {name}.',
    title: 'Ajouter un proche de {name}',
    withPartner: 'Avec {name}',
    withWhom: 'Avec qui ?'
  },
  app: {
    name: 'Arbor'
  },
  bin: {
    cancel: 'Garder la fiche',
    children: 'Lien avec ses enfants : {names}',
    confirm: 'Mettre à la corbeille',
    leaving: 'Quittent l’arbre avec sa fiche :',
    nothingLinked:
      'Rien n’est perdu : la fiche revient dès qu’on la sort de la corbeille.',
    open: 'Mettre à la corbeille',
    parents: 'Lien avec ses parents : {names}',
    partners: 'Union avec {names}',
    photos: 'Photos : {count:number}',
    stays:
      'Ces personnes restent dans l’arbre. Rien n’est perdu : la fiche revient avec ses liens et ses photos dès qu’on la sort de la corbeille.',
    title: 'Mettre {name} à la corbeille ?'
  },
  binPage: {
    binnedBy: 'Mise à la corbeille par {name}, le {moment}',
    comesBack: 'Revient avec sa fiche :',
    empty: 'La corbeille est vide.',
    intro:
      'Une fiche mise à la corbeille quitte l’arbre sans rien perdre. N’importe qui peut l’en sortir : elle revient avec ses liens et ses photos.',
    restore: 'Sortir de la corbeille',
    restored: '{name} est de retour dans l’arbre.',
    title: 'La corbeille'
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
  demo: {
    notice: {
      body: 'Changez ce que vous voulez : chaque nuit, elle revient comme au premier jour.',
      title: 'Une famille inventée, pour essayer.'
    },
    resting:
      'Beaucoup de visiteurs ont modifié cette famille d’exemple aujourd’hui : elle n’accepte plus de changements jusqu’à cette nuit. Vous pouvez toujours la regarder.'
  },
  edit: {
    cancel: 'Annuler',
    date: {
      and: 'et',
      certainty: 'Certitude',
      day: 'Jour',
      from: 'Première date',
      hint: 'L’année seule suffit. Laissez vide si personne ne sait.',
      month: 'Mois',
      noMonth: 'Mois inconnu',
      problem: {
        impossible_date:
          'Cette date n’existe pas : vérifiez le jour et le mois.',
        range_end_missing: 'Écrivez aussi la seconde date.',
        reversed_range: 'La seconde date doit venir après la première.',
        year_missing: 'Écrivez au moins l’année.'
      },
      qualifier: {
        about: 'Environ',
        after: 'Après',
        before: 'Avant',
        between: 'Entre deux dates',
        exact: 'Date sûre'
      },
      to: 'Seconde date',
      when: 'Date',
      year: 'Année'
    },
    failure: {
      movedBy:
        'L’arbre vient d’être modifié par {names}. La fiche est à jour : vérifiez, puis enregistrez à nouveau.',
      movedBySomeone:
        'L’arbre vient d’être modifié par quelqu’un d’autre. La fiche est à jour : vérifiez, puis enregistrez à nouveau.',
      refused: {
        ancestry_cycle:
          'Impossible : une personne ne peut pas être son propre ancêtre.',
        other:
          'L’arbre a refusé ce changement. Fermez, rouvrez la fiche, puis réessayez.',
        person_binned:
          'Cette personne est dans la corbeille : il faut d’abord l’en sortir.',
        same_partner: 'Une union se fait entre deux personnes différentes.',
        too_many_birth_parents:
          'Cette personne a déjà deux parents de naissance.'
      }
    },
    person: {
      birthDate: 'Date de naissance',
      birthPlace: 'Lieu de naissance',
      birthSurname: 'Nom de naissance',
      birthSurnameHint: 'S’il est différent, par exemple avant un mariage.',
      deathDate: 'Date du décès',
      deathPlace: 'Lieu du décès',
      givenNames: 'Prénoms',
      life: 'En vie ou décédé',
      lives: {
        alive: 'En vie',
        deceased: {
          female: 'Décédée',
          male: 'Décédé',
          unknown: 'Décédé(e)'
        }
      },
      notesHint: 'Un métier, un souvenir, d’où vient une information.',
      open: 'Corriger une information',
      sex: 'Femme ou homme',
      sexes: {
        female: 'Femme',
        male: 'Homme',
        unknown: 'Non précisé'
      },
      surname: 'Nom de famille',
      title: 'Corriger la fiche de {name}'
    },
    save: 'Enregistrer',
    whoFirst:
      'Pour compléter l’arbre, dites d’abord qui vous êtes : vos changements seront signés de votre nom.',
    whoFirstAction: 'Dire qui je suis'
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
    print: 'Imprimer',
    settings: 'Réglages',
    share: 'Partager'
  },
  familyHome: {
    bin: 'La corbeille',
    empty: 'Personne dans l’arbre pour l’instant.',
    generation: 'Génération {number:number}',
    history: 'Ce qui a changé',
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
  history: {
    allHistory: 'Voir tout l’historique',
    binWith: 'La corbeille ({count:number})',
    day: defineTranslation('{day:date}', {
      date: { day: { day: 'numeric', month: 'long', weekday: 'long' } }
    }),
    dayOfYear: defineTranslation('{day:date}', {
      date: {
        day: { day: 'numeric', month: 'long', weekday: 'long', year: 'numeric' }
      }
    }),
    event: {
      baptism: 'un baptême',
      burial: 'une inhumation',
      labelled: '« {label} »',
      other: 'un événement'
    },
    failed:
      'L’historique n’a pas pu être chargé. Vérifiez que le téléphone est connecté à Internet.',
    field: {
      birth: 'la naissance',
      birthSurname: 'le nom de naissance',
      death: 'le décès',
      livingOverride: '« en vie ou décédé »',
      notes: 'les notes',
      portraitPhotoId: 'la photo de la vignette',
      sex: '« femme ou homme »'
    },
    intro:
      'Chaque changement est gardé ici, signé par la personne qui l’a fait. Rien n’est perdu : tout peut être annulé.',
    line: {
      added: 'a ajouté {name}',
      binned: 'a mis {name} à la corbeille',
      childOf: 'enfant {ofNames}',
      corrected: 'a corrigé {fields} {ofName}',
      event: {
        create: 'a ajouté {event} sur la fiche {ofName}',
        remove: 'a retiré {event} de la fiche {ofName}',
        update: 'a corrigé {event} sur la fiche {ofName}'
      },
      filiation: {
        create: 'a noté {thatChild} est l’enfant {ofParent}',
        createKind: defineTranslation(
          'a noté {thatChild} est l’enfant {ofParent} ({kind:enum})',
          {
            enum: {
              kind: {
                adoption: 'adoption',
                birth: 'naissance',
                foster: 'accueil',
                step: 'beau-parent',
                unknown: 'lien incertain'
              }
            }
          }
        ),
        remove: 'a retiré le lien entre {child} et {parent}',
        update: 'a corrigé le lien entre {child} et {parent}'
      },
      parentOf: 'parent {ofNames}',
      partnerOf: 'en couple avec {names}',
      photo: {
        create: 'a ajouté une photo {ofName}',
        createUnlinked: 'a ajouté une photo',
        remove: 'a retiré une photo {ofName}',
        removeUnlinked: 'a retiré une photo',
        update: 'a modifié une photo {ofName}',
        updateUnlinked: 'a modifié une photo'
      },
      removed: 'a retiré {name} de l’arbre',
      renamed: 'a renommé {before} en {after}',
      restore: 'a remis l’arbre comme il était le {moment}',
      restored: 'a sorti {name} de la corbeille',
      restoreStart: 'a remis l’arbre comme à sa création',
      undo: defineTranslation('a annulé {count:plural} {ofNames}', {
        plural: { count: { one: 'un changement', other: '{?} changements' } }
      }),
      union: {
        create: defineTranslation('a noté {union:enum} {ofNames}', {
          enum: { union: UNION_WORDS_FR }
        }),
        remove: defineTranslation('a retiré {union:enum} {ofNames}', {
          enum: { union: UNION_WORDS_FR }
        }),
        update: defineTranslation('a corrigé {union:enum} {ofNames}', {
          enum: { union: UNION_WORDS_FR }
        })
      },
      unionEnded: defineTranslation('a noté {ending:enum} {ofNames}', {
        enum: { ending: { divorce: 'le divorce', separation: 'la séparation' } }
      })
    },
    loading: 'L’historique arrive…',
    moment: defineTranslation('{at:date}', {
      date: { at: { dateStyle: 'long', timeStyle: 'short' } }
    }),
    more: defineTranslation('{count:plural}', {
      plural: {
        count: {
          one: 'Voir l’autre changement',
          other: 'Voir les {?} autres changements'
        }
      }
    }),
    nothingForPerson: 'Rien n’a encore changé sur cette fiche.',
    onlyPerson: 'Seulement ce qui touche {name}.',
    personTitle: 'Historique de la fiche {ofName}',
    reader:
      'L’historique s’ouvre avec le lien de la famille. Le lien que vous avez reçu permet de regarder l’arbre, pas de le modifier.',
    restore: {
      action: 'Revenir ici',
      actionLabel:
        'Remettre l’arbre comme il était à {time}, juste après ce changement',
      back: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: 'Revient dans l’arbre',
            other: 'Reviennent dans l’arbre'
          }
        }
      }),
      body: 'Tout ce qui a été fait ensuite sera défait d’un coup.',
      changed: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: 'Retrouve ses anciennes informations',
            other: 'Retrouvent leurs anciennes informations'
          }
        }
      }),
      confirm: 'Revenir à ce moment',
      gone: defineTranslation('{count:plural}', {
        plural: { count: { one: 'Quitte l’arbre', other: 'Quittent l’arbre' } }
      }),
      others:
        'Les liens, les dates et les photos redeviennent aussi comme ce jour-là.',
      quiet: 'L’arbre est déjà comme ce jour-là : rien ne changera à l’écran.',
      renamed: '{now} redevient {past}',
      safe: 'Rien n’est perdu : ce retour sera noté dans l’historique, et vous pourrez le défaire.',
      title: 'Remettre l’arbre comme le {moment} ?'
    },
    retry: 'Réessayer',
    takenBack: 'Annulé par {name}, le {moment}',
    time: defineTranslation('{at:date}', {
      date: { at: { timeStyle: 'short' } }
    }),
    times: '× {count:number}',
    title: 'Historique',
    today: 'Aujourd’hui',
    undo: {
      allOfRun: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: 'Annuler ce changement',
            other: 'Annuler ces {?} changements'
          }
        }
      }),
      body: 'L’arbre redeviendra comme avant. Rien n’est perdu : l’annulation sera notée dans l’historique, et pourra elle-même être annulée.',
      cancel: 'Ne rien changer',
      confirm: 'Oui, annuler',
      confirmAll: 'Tout annuler ensemble',
      dependBody:
        'D’autres changements ont été faits ensuite, sur les mêmes fiches. Pour revenir en arrière, il faut tout annuler en même temps :',
      dependTitle: 'D’autres changements en dépendent',
      entry: 'Annuler',
      entryLabel: 'Annuler le changement de {time}',
      failure: {
        already_undone:
          'Ce changement vient déjà d’être annulé. L’historique est à jour.',
        demo_write_limit:
          'Beaucoup de visiteurs ont modifié cette famille d’exemple aujourd’hui : elle n’accepte plus de changements jusqu’à cette nuit. Vous pouvez toujours la regarder.',
        forbidden:
          'Seul le gardien de l’arbre peut défaire un retour à une date passée.',
        later_changes_depend:
          'Quelqu’un vient de faire un changement qui en dépend. L’historique est à jour : regardez, puis réessayez.',
        not_sent:
          'Ça n’a pas marché. Vérifiez que le téléphone est connecté à Internet, puis réessayez.',
        nothing_to_restore: 'L’arbre est déjà dans cet état.',
        revision_conflict:
          'Quelqu’un vient de modifier l’arbre. L’aperçu est à jour : regardez, puis réessayez.',
        revision_not_found:
          'Ce moment n’est plus dans l’historique. L’historique est à jour : réessayez.'
      },
      redo: 'Rétablir',
      redoBody:
        'Ce qui avait été annulé revient dans l’arbre. Ce retour sera noté dans l’historique, lui aussi.',
      redoConfirm: 'Oui, rétablir',
      redoLabel: 'Rétablir ce qui a été annulé à {time}',
      redoTitle: 'Rétablir ce qui a été annulé ?',
      title: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: 'Annuler ce changement ?',
            other: 'Annuler ces {?} changements ?'
          }
        }
      })
    },
    unknownPerson: 'une personne inconnue',
    yesterday: 'Hier'
  },
  home: {
    create: 'Créer l’arbre de votre famille',
    demo: 'Voir une famille d’exemple',
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
  kinship: {
    backToMe: 'Revenir à votre lien',
    chart: 'Le chemin de {from} à {to}',
    clear: 'Éteindre le chemin',
    compareLabel: 'Comparer avec quelqu’un d’autre',
    lit: 'Le chemin de {from} à {to}, dans l’arbre',
    pickLabel: 'Quel lien entre {name} et…',
    pickLabelForYou: 'Votre lien avec…',
    showInTree: 'Voir le chemin dans l’arbre',
    title: 'Lien de parenté',
    you: 'Vous'
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
  photos: {
    add: 'Ajouter une photo',
    adding: 'Préparation de la photo…',
    asPortrait: 'En faire le portrait de {name}, sur sa vignette',
    caption: 'Légende',
    captionHint:
      'Qui, où, quand : « Mariage de Louis et Jeanne, Quimper, 1931 ».',
    close: 'Fermer',
    dialogTitle: 'Une photo de {name}',
    isPortrait: 'C’est le portrait de {name}, sur sa vignette.',
    makePortrait: 'En faire son portrait',
    portrait: 'Portrait',
    problem: {
      too_large:
        'Cette image reste trop lourde, même réduite. Choisissez-en une autre.',
      unreadable:
        'Ce fichier n’est pas une photo que le téléphone sait lire. Choisissez une photo.'
    },
    save: 'Ajouter la photo',
    title: 'Photos',
    untitled: 'Photo de {name}'
  },
  print: {
    content: {
      hasDates: 'Les dates',
      hasPhotos: 'Les photos',
      hasPlaces: 'Les lieux de naissance et de décès',
      label: 'Sur chaque vignette'
    },
    download: 'Télécharger le PDF',
    failed: 'Le PDF n’a pas pu être préparé. Réessayez dans un instant.',
    fileName: '{name} — arbre.pdf',
    fontsFailed:
      'L’aperçu n’a pas pu se charger. Vérifiez la connexion, puis rouvrez la page.',
    generations: defineTranslation('{count:plural}', {
      plural: {
        count: { one: '{?} génération', other: '{?} générations' }
      }
    }),
    intro:
      'Choisissez qui mettre sur la feuille et sur quel papier. Chaque feuille porte la légende et un code pour retrouver l’arbre à jour.',
    legend: {
      adoption: 'Enfant adopté : trait double',
      child: 'Enfant',
      deceased: 'Décès : vignette mate',
      ended: 'Divorce ou séparation : le trait est coupé',
      freeUnion: 'Union libre',
      marriage: 'Mariage ou PACS',
      step: 'Enfant du conjoint, enfant accueilli : pointillés',
      title: 'Légende',
      unknownLink: 'Lien inconnu',
      unknownPerson: 'Personne inconnue : case à compléter'
    },
    live: {
      text: 'Scannez avec l’appareil photo du téléphone : l’arbre à jour, à consulter.',
      title: 'L’arbre vivant'
    },
    loading: 'L’aperçu arrive…',
    making: 'Préparation du PDF…',
    orientation: {
      label: 'Sens de la feuille',
      landscape: 'En largeur',
      portrait: 'En hauteur'
    },
    paper: {
      a1: 'Une grande feuille A1, chez l’imprimeur',
      a2: 'Une feuille A2, chez l’imprimeur',
      a3: 'Une feuille A3',
      a4: 'Une feuille A4',
      label: 'Sur quel papier',
      poster: 'Une affiche de 6 feuilles A4, à coller'
    },
    posterHint:
      'Six feuilles à imprimer chez vous. Coupez chaque feuille au trait plein, puis collez-la sur sa voisine jusqu’aux pointillés.',
    printedOn: defineTranslation('Imprimé le {day:date} · Arbor', {
      date: { day: { day: 'numeric', month: 'long', year: 'numeric' } }
    }),
    scope: {
      allGenerations: 'Toutes',
      ancestors: 'Les ancêtres de quelqu’un',
      ancestorsOf: 'Les ancêtres de {name}',
      depth: 'Sur combien de générations',
      descendants: 'Les descendants de quelqu’un',
      descendantsOf: 'Les descendants de {name}',
      label: 'Qui mettre sur la feuille',
      other: 'Choisir quelqu’un d’autre',
      whole: 'Toute la famille'
    },
    share: {
      failed: 'L’image n’a pas pu être préparée. Réessayez dans un instant.',
      label: 'Pour l’envoyer dans un message',
      png: 'Une image (PNG)',
      pngFileName: '{name} — arbre.png',
      svg: 'Un dessin (SVG)',
      svgFileName: '{name} — arbre.svg'
    },
    shopHint:
      'Un imprimeur ou une boutique de reprographie imprime ce PDF en grand. Une imprimante de maison ne le peut pas.',
    tile: 'Feuille {number:number} sur {count:number} · rangée {row:number}, colonne {column:number}',
    title: 'Imprimer l’arbre'
  },
  sheet: {
    atPlace: 'à {place}',
    back: 'L’arbre',
    birth: 'Naissance',
    birthSurname: 'Nom de naissance',
    death: 'Décès',
    deathUnknown: 'Date et lieu inconnus',
    generation: 'génération {number:number}',
    history: 'Historique de cette fiche',
    inPeriod: 'en {date}',
    missing: {
      binned: '{name} a mis cette fiche à la corbeille le {moment}.',
      binnedBy:
        '{name} vient de mettre cette fiche à la corbeille : votre modification n’a pas été enregistrée.',
      binnedBySomeone:
        'Quelqu’un vient de mettre cette fiche à la corbeille : votre modification n’a pas été enregistrée.',
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
    showGenerations: 'Générations',
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
  union: {
    date: 'Date de l’union',
    edit: {
      open: 'Corriger l’union',
      title: 'L’union de {names}'
    },
    end: {
      date: 'Date de la fin',
      divorce: 'Divorce',
      label: 'Fin de l’union',
      none: 'Aucune',
      separation: 'Séparation'
    },
    kind: {
      label: 'Leur union',
      marriage: 'Mariage',
      pacs: 'PACS',
      partnership: 'Union libre',
      unknown: 'Sans précision'
    },
    place: 'Lieu de l’union'
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
