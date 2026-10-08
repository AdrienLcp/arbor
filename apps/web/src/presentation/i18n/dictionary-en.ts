import { defineDictionary, defineTranslation } from '@adrienlcp/i18n'

const MEGABYTES = {
  maximumFractionDigits: 1,
  style: 'unit',
  unit: 'megabyte',
  unitDisplay: 'short'
} as const

export const EN_DICTIONARY = defineDictionary({
  app: {
    name: 'Arbor'
  },
  common: {
    failed:
      'That did not work. Check that the phone is connected to the Internet, then try again.',
    home: 'Back to the home page',
    openTree: 'Open the tree',
    unnamedPerson: 'No name',
    unnamedTree: 'Unnamed tree'
  },
  createFamily: {
    givenNames: 'Your first name',
    givenNamesMissing: 'Write your first name.',
    intro:
      'Start with yourself: you will be the first person in the tree. The others will follow.',
    preview: {
      hint: 'you',
      label: 'Your sticker',
      title: 'Stick here'
    },
    submit: 'Create the tree',
    surname: 'Your last name',
    surnameHint: 'The one you go by today.',
    title: 'Create your family’s tree',
    treeName: 'Name of the tree',
    treeNameHint: 'It shows at the top of the tree and on the printed sheet.',
    treeNameMissing: 'Give the tree a name.',
    treeNameSuggestion: 'The {surname} family'
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
  familyBar: {
    label: 'Tree',
    settings: 'Settings',
    share: 'Share'
  },
  familyHome: {
    empty: 'Nobody in the tree yet.',
    generation: 'Generation {number:number}',
    openTree: 'See the tree',
    people: defineTranslation('{count:plural}', {
      plural: { count: { one: '{?} person', other: '{?} people' } }
    }),
    share: 'Invite the family',
    you: 'you'
  },
  familySettings: {
    device: {
      title: 'On this phone',
      trees: 'See all my trees'
    },
    familyLink: {
      body: 'If the link reached someone who should not have it, replace it: the old one stops working at once.',
      confirm: {
        body: 'People who have the old link will not be able to open the tree until you send them the new one. Nothing in the tree is erased.',
        no: 'Cancel',
        title: 'Replace the family link?',
        yes: 'Replace the link'
      },
      done: 'The new link is ready. Send it to the family.',
      replace: 'Replace the link',
      sendNew: 'Send the new link',
      title: 'The family link'
    },
    keeper: {
      title: 'Keeper of the tree'
    },
    loading: 'Loading…',
    newKeeper: {
      body: 'A keeper can set everything up, as you can. Create a keeper link and send it to the person you chose.',
      create: 'Create a keeper link',
      linkTitle: 'Keeper link',
      ready: 'Send this link now: for safety, it will not be shown again.',
      title: 'Another keeper'
    },
    readerLink: {
      active: 'A read-only link is active.',
      body: 'It shows the tree without letting anyone change it: for the in-laws, or the QR code on a printed sheet.',
      create: 'Create the link',
      hideLiving:
        'Hide the exact birth date, notes and photos of living people from readers',
      none: 'No read-only link yet.',
      otherDevice:
        'It was created on another device: you can turn it off and create a new one.',
      revoke: 'Turn the link off',
      see: 'See and send the link',
      title: 'The read-only link'
    },
    title: 'Settings',
    usage: {
      label: 'Space used by the tree and its photos',
      nearLimit:
        'The tree is close to its limit. Removing duplicate photos frees space.',
      title: 'Space',
      value: defineTranslation('{used:number} of {limit:number}', {
        number: { limit: MEGABYTES, used: MEGABYTES }
      })
    }
  },
  familyShare: {
    copied: 'Link copied',
    copy: 'Copy the link',
    copyRefused:
      'The phone refused to copy. The link is selected: copy it by hand.',
    familyLink: {
      description:
        'Send it to the whole family. Whoever opens it sees the tree and can add to it.',
      title: 'The family link',
      unknown:
        'The family link is only known on the device that created the tree. To have one here, replace it with a new one in the settings.',
      unknownAction: 'Open the settings'
    },
    intro:
      'Send the link by WhatsApp, text message or email, or have the QR code scanned with a phone camera.',
    keeperLink: {
      description:
        'Keep it to yourself. It sets everything up, including replacing the family link: only send it to someone who will keep the tree with you.',
      title: 'Your keeper link'
    },
    qrLabel: 'QR code: {link}',
    readerLink: {
      description:
        'To look at the tree without changing it: the in-laws, a printed sheet.',
      title: 'The read-only link'
    },
    send: 'Send',
    sendTitle: 'The {name} tree',
    title: 'Share the tree'
  },
  home: {
    create: 'Create your family’s tree',
    fine: 'Free. No account, no password. Nothing is lost: every change can be undone.',
    lead: 'Your family tree, online and shared. Send it on WhatsApp, everyone adds their own, and it prints large.',
    openLink: 'I received a link',
    spread: {
      eldest: 'the eldest you know of',
      firstChild: 'their first child',
      generation: 'Generation {number:number}',
      hint: 'Every person has a numbered place, even those nobody knows yet.',
      otherChild: 'another child',
      partner: 'their wife or husband',
      slotTitle: 'Stick here'
    },
    steps: {
      complete: {
        body: 'Everyone adds their own, a date, a photo. Print whenever you like.',
        title: 'Complete'
      },
      create: {
        body: 'Give your name: you are the first sticker in the tree.',
        title: 'Create'
      },
      label: 'In three steps',
      send: {
        body: 'A link by WhatsApp, text or email, or a QR code to scan.',
        title: 'Send'
      }
    },
    title: 'Your family’s tree',
    titleBlank: 'completed by the whole family',
    trees: {
      keeper: 'You keep this tree',
      reader: 'Read only',
      title: 'Your trees'
    }
  },
  me: {
    change: 'Change',
    is: 'You are {name}.',
    nobody: 'You have not said who you are yet.',
    onlooker: 'You are looking at the tree without changing it.',
    reader: 'This link lets you look at the tree, not change it.'
  },
  notFound: {
    home: 'Back to the home page',
    title: 'This page does not exist'
  },
  openLink: {
    field: 'The link you received',
    intro:
      'Paste the tree’s link you received in a message. The whole message works too.',
    notALink:
      'This text holds no tree link. Copy the whole link from the message you received, then paste it here.',
    qr: {
      body: 'Open the phone’s camera and aim at the code: the tree opens by itself.',
      title: 'Have a QR code?'
    },
    submit: 'Open the tree',
    title: 'I received a link'
  },
  theme: {
    dark: 'Dark',
    label: 'Appearance',
    light: 'Light',
    system: 'Same as the device'
  },
  tree: {
    dated: '{word} {year}',
    depth: {
      label: 'Generations each way',
      option: '{count:number}'
    },
    descent: {
      adoption: 'adoption',
      foster: 'foster family',
      step: 'stepchild'
    },
    empty: 'Nobody in the tree yet.',
    generation: 'Generation {number:number}',
    generationShort: 'Gen. {number:number}',
    instructions:
      'The arrow keys move from one person to the next. Enter centres the tree on them.',
    kin: {
      child: {
        adoption: {
          female: 'adopted daughter',
          male: 'adopted son',
          unknown: 'adopted child'
        },
        birth: { female: 'daughter', male: 'son', unknown: 'child' },
        foster: {
          female: 'fostered by {name}',
          male: 'fostered by {name}',
          unknown: 'fostered by {name}'
        },
        step: {
          female: 'raised by {name}',
          male: 'raised by {name}',
          unknown: 'raised by {name}'
        },
        unknown: { female: 'daughter', male: 'son', unknown: 'child' }
      },
      halfSibling: {
        female: 'half-sister',
        male: 'half-brother',
        unknown: 'half-sibling'
      },
      parent: {
        adoption: {
          female: 'adoptive mother',
          male: 'adoptive father',
          unknown: 'adoptive parent'
        },
        birth: { female: 'mother', male: 'father', unknown: 'parent' },
        foster: {
          female: 'foster mother',
          male: 'foster father',
          unknown: 'foster parent'
        },
        step: {
          female: 'stepmother',
          male: 'stepfather',
          unknown: 'step-parent'
        },
        unknown: { female: 'mother', male: 'father', unknown: 'parent' }
      },
      partner: {
        marriage: { female: 'wife', male: 'husband', unknown: 'spouse' },
        none: {
          female: 'other parent',
          male: 'other parent',
          unknown: 'other parent'
        },
        pacs: {
          female: 'civil partner',
          male: 'civil partner',
          unknown: 'civil partner'
        },
        partnership: { female: 'partner', male: 'partner', unknown: 'partner' },
        unknown: { female: 'partner', male: 'partner', unknown: 'partner' }
      },
      sibling: { female: 'sister', male: 'brother', unknown: 'sibling' },
      stepSibling: {
        female: 'also raised by {name}',
        male: 'also raised by {name}',
        unknown: 'also raised by {name}'
      },
      withParent: '{word}, with {name}'
    },
    missing: defineTranslation('{count:plural}', {
      plural: { count: { one: '{?} to complete', other: '{?} to complete' } }
    }),
    outline: {
      children: '{name}’s children',
      label: 'The whole family, as a list',
      repeated: '{name}, named above',
      with: 'with {name}',
      withUnknown: 'with an unknown person'
    },
    people: defineTranslation('{count:plural}', {
      plural: { count: { one: '{?} person', other: '{?} people' } }
    }),
    scope: {
      around: 'Around one person',
      label: 'Show',
      list: 'As a list',
      page: 'Page by page',
      whole: 'The whole family'
    },
    search: {
      empty: 'Nobody by that name in the tree.',
      label: 'Find someone',
      placeholder: 'A first name, a surname'
    },
    spread: {
      children: 'Children',
      childrenEmpty: 'No children in the tree yet.',
      focus: '{name} and their unions',
      next: 'Down to {name}',
      page: '{name}’s page',
      parents: 'Parents',
      parentsEmpty: 'Their parents are not in the tree yet.',
      previous: 'Up to {name}',
      siblings: 'Brothers and sisters',
      unknownPartner: {
        hint: 'other parent',
        title: 'Unknown'
      }
    },
    titleAround: 'The tree, around {name}',
    titleWhole: 'The whole family’s tree',
    union: {
      marriage: 'married',
      pacs: 'civil union',
      partnership: 'partners',
      unknown: 'a couple'
    },
    unionEnd: {
      divorce: 'divorced',
      separation: 'separated'
    },
    unknownParent: {
      hint: 'unknown parent',
      title: 'Unknown'
    },
    years: '{first} – {last}',
    zoom: {
      fit: 'See the whole tree',
      in: 'Zoom in',
      label: 'Zoom',
      out: 'Zoom out',
      recentre: 'Back to the person in the centre'
    }
  },
  whoAmI: {
    intro:
      'Tap your name. Your changes will be signed with it: the family will know who did what.',
    noMatch: 'Nobody in the tree has that name.',
    notInTree: {
      action: 'I am not in the tree',
      field: 'Your first and last name',
      hint: 'They will sign your changes until you have your own sticker.',
      missing: 'Write your first and last name.',
      submit: 'Continue'
    },
    onlooker: 'I only want to look',
    search: {
      clear: 'Clear',
      label: 'Find your name',
      placeholder: 'First or last name'
    },
    title: 'Who are you in this tree?'
  }
})
