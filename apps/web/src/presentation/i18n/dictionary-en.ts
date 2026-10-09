import { defineDictionary, defineTranslation } from '@adrienlcp/i18n'

const MEGABYTES = {
  maximumFractionDigits: 1,
  style: 'unit',
  unit: 'megabyte',
  unitDisplay: 'short'
} as const

const UNION_WORDS_EN = {
  marriage: 'the marriage',
  pacs: 'the civil partnership',
  partnership: 'the free union',
  unknown: 'the couple'
} as const

export const EN_DICTIONARY = defineDictionary({
  add: {
    alone: 'No other parent known',
    childKind: {
      adoption: 'Adoption',
      birth: 'Birth',
      foster: 'Fostering',
      step: 'Raised'
    },
    linkKind: 'Their link to {name}',
    open: 'Add a child, a parent, a partner…',
    otherChoice: 'Choose another link',
    parentKind: {
      adoption: 'Adoption',
      birth: 'Birth',
      foster: 'Fostering',
      step: 'Step-parent'
    },
    quick: {
      child: 'Add a child',
      parent: 'Add a parent'
    },
    relation: {
      child: {
        dialog: 'Add a child of {name}',
        hint: 'born to, adopted or raised by {name}',
        title: 'A child'
      },
      parent: {
        dialog: 'Add a parent of {name}',
        hint: 'the mother or father of {name}, or who raised them',
        title: 'A parent'
      },
      partner: {
        dialog: 'Add a partner of {name}',
        hint: 'marriage, civil partnership or living together with {name}',
        title: 'A partner'
      },
      sibling: {
        dialog: 'Add a brother or sister of {name}',
        hint: 'another child of the parents of {name}',
        needsParent:
          'Add one of their parents first: the brother or sister will be their child.',
        title: 'A brother or a sister'
      }
    },
    save: 'Add to the tree',
    siblingParents: 'Child of {names}, like {name}.',
    title: 'Add a relative of {name}',
    withPartner: 'With {name}',
    withWhom: 'With whom?'
  },
  app: {
    name: 'Arbor'
  },
  bin: {
    cancel: 'Keep the sheet',
    children: 'Link with their children: {names}',
    confirm: 'Put in the bin',
    leaving: 'Leaving the tree with this sheet:',
    nothingLinked:
      'Nothing is lost: the sheet comes back as soon as someone takes it out of the bin.',
    open: 'Put in the bin',
    parents: 'Link with their parents: {names}',
    partners: 'Union with {names}',
    photos: 'Photos: {count:number}',
    stays:
      'These people stay in the tree. Nothing is lost: the sheet comes back with its links and photos as soon as someone takes it out of the bin.',
    title: 'Put {name} in the bin?'
  },
  binPage: {
    binnedBy: 'Put in the bin by {name} on {moment}',
    comesBack: 'Comes back with the sheet:',
    empty: 'The bin is empty.',
    intro:
      'A sheet put in the bin leaves the tree without losing anything. Anyone can take it out: it comes back with its links and photos.',
    restore: 'Take out of the bin',
    restored: '{name} is back in the tree.',
    title: 'The bin'
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
  demo: {
    notice: {
      body: 'Change anything you like: every night, it goes back to how it started.',
      title: 'A made-up family, to try things out.'
    },
    resting:
      'Many visitors have changed this example family today: it takes no more changes until tonight. You can still look around.'
  },
  edit: {
    cancel: 'Cancel',
    date: {
      and: 'and',
      certainty: 'How sure',
      day: 'Day',
      from: 'First date',
      hint: 'The year alone is enough. Leave it empty if nobody knows.',
      month: 'Month',
      noMonth: 'Month unknown',
      problem: {
        impossible_date:
          'This date does not exist: check the day and the month.',
        range_end_missing: 'Write the second date too.',
        reversed_range: 'The second date must come after the first.',
        year_missing: 'Write at least the year.'
      },
      qualifier: {
        about: 'About',
        after: 'After',
        before: 'Before',
        between: 'Between two dates',
        exact: 'Exact date'
      },
      to: 'Second date',
      when: 'Date',
      year: 'Year'
    },
    failure: {
      movedBy:
        'The tree was just changed by {names}. The sheet is up to date: check it, then save again.',
      movedBySomeone:
        'The tree was just changed by someone else. The sheet is up to date: check it, then save again.',
      refused: {
        ancestry_cycle: 'Impossible: nobody can be their own ancestor.',
        other:
          'The tree refused this change. Close, reopen the sheet, then try again.',
        person_binned: 'This person is in the bin: bring them back first.',
        same_partner: 'A union is between two different people.',
        too_many_birth_parents: 'This person already has two birth parents.'
      }
    },
    person: {
      birthDate: 'Date of birth',
      birthPlace: 'Place of birth',
      birthSurname: 'Birth name',
      birthSurnameHint: 'If it is different, for instance before a marriage.',
      deathDate: 'Date of death',
      deathPlace: 'Place of death',
      givenNames: 'Given names',
      life: 'Living or deceased',
      lives: {
        alive: 'Living',
        deceased: {
          female: 'Deceased',
          male: 'Deceased',
          unknown: 'Deceased'
        }
      },
      notesHint: 'A trade, a memory, where a piece of information comes from.',
      open: 'Fix some information',
      sex: 'Woman or man',
      sexes: {
        female: 'Woman',
        male: 'Man',
        unknown: 'Not said'
      },
      surname: 'Surname',
      title: 'Fix {name}’s sheet'
    },
    save: 'Save',
    whoFirst:
      'To add to the tree, first say who you are: your changes will be signed with your name.',
    whoFirstAction: 'Say who I am'
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
    bin: 'The bin',
    history: 'What changed',
    label: 'Tree',
    print: 'Print',
    settings: 'Settings',
    share: 'Share'
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
  history: {
    allHistory: 'See the whole history',
    binWith: 'The bin ({count:number})',
    day: defineTranslation('{day:date}', {
      date: { day: { day: 'numeric', month: 'long', weekday: 'long' } }
    }),
    dayOfYear: defineTranslation('{day:date}', {
      date: {
        day: { day: 'numeric', month: 'long', weekday: 'long', year: 'numeric' }
      }
    }),
    event: {
      baptism: 'a baptism',
      burial: 'a burial',
      labelled: '“{label}”',
      other: 'an event'
    },
    failed:
      'The history could not be loaded. Check that the phone is connected to the Internet.',
    field: {
      birth: 'the birth',
      birthSurname: 'the birth surname',
      death: 'the death',
      livingOverride: '“living or deceased”',
      notes: 'the notes',
      portraitPhotoId: 'the sticker photo',
      sex: '“woman or man”'
    },
    intro:
      'Every change is kept here, signed by whoever made it. Nothing is lost: anything can be undone.',
    line: {
      added: 'added {name}',
      binned: 'put {name} in the bin',
      childOf: 'child {ofNames}',
      corrected: 'corrected {fields} {ofName}',
      event: {
        create: 'added {event} to the sheet {ofName}',
        remove: 'removed {event} from the sheet {ofName}',
        update: 'corrected {event} on the sheet {ofName}'
      },
      filiation: {
        create: 'noted {thatChild} is the child {ofParent}',
        createKind: defineTranslation(
          'noted {thatChild} is the child {ofParent} ({kind:enum})',
          {
            enum: {
              kind: {
                adoption: 'adoption',
                birth: 'birth',
                foster: 'foster care',
                step: 'step-parent',
                unknown: 'uncertain link'
              }
            }
          }
        ),
        remove: 'removed the link between {child} and {parent}',
        update: 'corrected the link between {child} and {parent}'
      },
      parentOf: 'parent {ofNames}',
      partnerOf: 'partner of {names}',
      photo: {
        create: 'added a photo {ofName}',
        createUnlinked: 'added a photo',
        remove: 'removed a photo {ofName}',
        removeUnlinked: 'removed a photo',
        update: 'changed a photo {ofName}',
        updateUnlinked: 'changed a photo'
      },
      removed: 'removed {name} from the tree',
      renamed: 'renamed {before} to {after}',
      restore: 'put the tree back as it was on {moment}',
      restored: 'took {name} out of the bin',
      restoreStart: 'put the tree back as it was when it was created',
      undo: defineTranslation('undid {count:plural} {ofNames}', {
        plural: { count: { one: 'a change', other: '{?} changes' } }
      }),
      union: {
        create: defineTranslation('noted {union:enum} {ofNames}', {
          enum: { union: UNION_WORDS_EN }
        }),
        remove: defineTranslation('removed {union:enum} {ofNames}', {
          enum: { union: UNION_WORDS_EN }
        }),
        update: defineTranslation('corrected {union:enum} {ofNames}', {
          enum: { union: UNION_WORDS_EN }
        })
      },
      unionEnded: defineTranslation('noted {ending:enum} {ofNames}', {
        enum: {
          ending: { divorce: 'the divorce', separation: 'the separation' }
        }
      })
    },
    loading: 'The history is on its way…',
    moment: defineTranslation('{at:date}', {
      date: { at: { dateStyle: 'long', timeStyle: 'short' } }
    }),
    more: defineTranslation('{count:plural}', {
      plural: {
        count: {
          one: 'See the other change',
          other: 'See the {?} other changes'
        }
      }
    }),
    nothingForPerson: 'Nothing has changed on this sheet yet.',
    onlyPerson: 'Only what concerns {name}.',
    personTitle: 'History of the sheet {ofName}',
    reader:
      'The history opens with the family link. The link you received lets you look at the tree, not change it.',
    restore: {
      action: 'Go back here',
      actionLabel:
        'Put the tree back as it was at {time}, right after this change',
      back: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: 'Comes back into the tree',
            other: 'Come back into the tree'
          }
        }
      }),
      body: 'Everything done since will be undone at once.',
      changed: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: 'Gets their earlier details back',
            other: 'Get their earlier details back'
          }
        }
      }),
      confirm: 'Go back to this moment',
      gone: defineTranslation('{count:plural}', {
        plural: { count: { one: 'Leaves the tree', other: 'Leave the tree' } }
      }),
      others: 'Links, dates and photos go back to how they were that day too.',
      quiet:
        'The tree is already as it was that day: nothing will change on screen.',
      renamed: '{now} becomes {past} again',
      safe: 'Nothing is lost: this return is noted in the history, and you can undo it.',
      title: 'Put the tree back as it was on {moment}?'
    },
    retry: 'Try again',
    takenBack: 'Undone by {name} on {moment}',
    time: defineTranslation('{at:date}', {
      date: { at: { timeStyle: 'short' } }
    }),
    times: '× {count:number}',
    title: 'History',
    today: 'Today',
    undo: {
      allOfRun: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: 'Undo this change',
            other: 'Undo these {?} changes'
          }
        }
      }),
      body: 'The tree will be as it was before. Nothing is lost: the undo is noted in the history, and can itself be undone.',
      cancel: 'Change nothing',
      confirm: 'Yes, undo',
      confirmAll: 'Undo them all together',
      dependBody:
        'Other changes were made afterwards, on the same sheets. To go back, everything must be undone at the same time:',
      dependTitle: 'Other changes depend on it',
      entry: 'Undo',
      entryLabel: 'Undo the change made at {time}',
      failure: {
        already_undone:
          'This change has just been undone already. The history is up to date.',
        demo_write_limit:
          'Many visitors have changed this example family today: it takes no more changes until tonight. You can still look around.',
        forbidden:
          'Only the keeper of the tree can undo a return to a past date.',
        later_changes_depend:
          'Someone has just made a change that depends on it. The history is up to date: have a look, then try again.',
        not_sent:
          'That did not work. Check that the phone is connected to the Internet, then try again.',
        nothing_to_restore: 'The tree is already in that state.',
        revision_conflict:
          'Someone has just changed the tree. The preview is up to date: have a look, then try again.',
        revision_not_found:
          'That moment is no longer in the history. The history is up to date: try again.'
      },
      redo: 'Bring back',
      redoBody:
        'What was undone comes back into the tree. This is noted in the history too.',
      redoConfirm: 'Yes, bring it back',
      redoLabel: 'Bring back what was undone at {time}',
      redoTitle: 'Bring back what was undone?',
      title: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: 'Undo this change?',
            other: 'Undo these {?} changes?'
          }
        }
      })
    },
    unknownPerson: 'an unknown person',
    yesterday: 'Yesterday'
  },
  home: {
    create: 'Create your family’s tree',
    demo: 'See an example family',
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
  kinship: {
    backToMe: 'Back to your own link',
    chart: 'The path from {from} to {to}',
    clear: 'Turn the path off',
    compareLabel: 'Compare with someone else',
    lit: 'The path from {from} to {to}, in the tree',
    pickLabel: 'How is {name} related to…',
    pickLabelForYou: 'How you are related to…',
    showInTree: 'Show the path in the tree',
    title: 'Family relationship',
    you: 'You'
  },
  me: {
    change: 'Change',
    is: 'You are {name}.',
    nobody: 'You have not said who you are yet.',
    onlooker: 'You are looking at the tree without changing it.',
    reader: 'This link lets you look at the tree, not change it.',
    you: 'you'
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
  photos: {
    add: 'Add a photo',
    adding: 'Getting the photo ready…',
    asPortrait: 'Make it {name}’s portrait, on their sticker',
    caption: 'Caption',
    captionHint:
      'Who, where, when: “Louis and Jeanne’s wedding, Quimper, 1931”.',
    close: 'Close',
    dialogTitle: 'A photo of {name}',
    isPortrait: 'This is {name}’s portrait, on their sticker.',
    makePortrait: 'Make it their portrait',
    portrait: 'Portrait',
    problem: {
      too_large:
        'This image is still too heavy once reduced. Pick another one.',
      unreadable: 'This file is not a photo the phone can read. Pick a photo.'
    },
    save: 'Add the photo',
    title: 'Photos',
    untitled: 'Photo of {name}'
  },
  print: {
    content: {
      hasDates: 'Dates',
      hasPhotos: 'Photos',
      hasPlaces: 'Places of birth and death',
      label: 'On each sticker'
    },
    download: 'Download the PDF',
    failed: 'The PDF could not be made. Try again in a moment.',
    fileName: '{name} — tree.pdf',
    fontsFailed:
      'The preview could not load. Check the connection, then open the page again.',
    generations: defineTranslation('{count:plural}', {
      plural: {
        count: { one: '{?} generation', other: '{?} generations' }
      }
    }),
    intro:
      'Choose who goes on the sheet and on which paper. Every sheet carries the legend and a code to find the up-to-date tree.',
    legend: {
      adoption: 'Adopted child: double line',
      child: 'Child',
      deceased: 'Death: matte sticker',
      ended: 'Divorce or separation: the line is cut',
      freeUnion: 'Living together',
      marriage: 'Marriage or civil partnership',
      step: 'Partner’s child, foster child: dotted',
      title: 'Legend',
      unknownLink: 'Unknown link',
      unknownPerson: 'Unknown person: a slot to fill'
    },
    live: {
      text: 'Scan with the phone’s camera: the up-to-date tree, to look at.',
      title: 'The living tree'
    },
    loading: 'The preview is coming…',
    making: 'Making the PDF…',
    orientation: {
      label: 'Sheet direction',
      landscape: 'Wide',
      portrait: 'Tall'
    },
    paper: {
      a1: 'A large A1 sheet, at a print shop',
      a2: 'An A2 sheet, at a print shop',
      a3: 'One A3 sheet',
      a4: 'One A4 sheet',
      label: 'Which paper',
      poster: 'A poster of 6 A4 sheets, to glue'
    },
    posterHint:
      'Six sheets to print at home. Cut each sheet along the solid mark, then glue it onto its neighbour up to the dotted mark.',
    printedOn: defineTranslation('Printed on {day:date} · Arbor', {
      date: { day: { day: 'numeric', month: 'long', year: 'numeric' } }
    }),
    scope: {
      allGenerations: 'All',
      ancestors: 'Someone’s ancestors',
      ancestorsOf: 'The ancestors of {name}',
      depth: 'How many generations',
      descendants: 'Someone’s descendants',
      descendantsOf: 'The descendants of {name}',
      label: 'Who goes on the sheet',
      other: 'Choose someone else',
      whole: 'The whole family'
    },
    share: {
      failed: 'The picture could not be made. Try again in a moment.',
      label: 'To send it in a message',
      png: 'A picture (PNG)',
      pngFileName: '{name} — tree.png',
      svg: 'A drawing (SVG)',
      svgFileName: '{name} — tree.svg'
    },
    shopHint: 'A print shop prints this PDF large. A home printer cannot.',
    tile: 'Sheet {number:number} of {count:number} · row {row:number}, column {column:number}',
    title: 'Print the tree'
  },
  sheet: {
    atPlace: 'in {place}',
    birth: 'Birth',
    birthSurname: 'Birth name',
    close: 'Close',
    death: 'Death',
    deathUnknown: 'Date and place unknown',
    generation: 'generation {number:number}',
    history: 'History of this sheet',
    inPeriod: 'in {date}',
    missing: {
      binned: '{name} put this sheet in the bin on {moment}.',
      binnedBy:
        '{name} just put this sheet in the bin: your change was not saved.',
      binnedBySomeone:
        'Someone just put this sheet in the bin: your change was not saved.',
      body: 'They may have been moved to the bin. Nothing is lost: they can be brought back.',
      title: 'This person is no longer in the tree'
    },
    notes: 'Notes',
    onDay: 'on {date}',
    open: 'Open {name}’s sheet',
    openShort: 'Their sheet',
    slot: 'No. {number}',
    title: '{name}’s sheet',
    union: {
      start: {
        marriage: 'Married',
        pacs: 'Civil partners',
        partnership: 'Living together',
        unknown: 'Together'
      },
      told: '{word} {when}'
    },
    unions: 'Unions',
    unknownPartner: 'With an unknown person',
    warning: {
      bornAfterChild: '{name}, their child, is dated as born before them.',
      bornBeforeParent:
        'their birth is dated before that of {name}, their parent.',
      deathBeforeBirth: 'the death is dated before the birth.',
      title: 'Date to check:'
    }
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
      tree: 'The tree',
      whole: 'The whole family'
    },
    search: {
      empty: 'Nobody by that name in the tree.',
      label: 'Find someone',
      placeholder: 'A first name, a surname'
    },
    showGenerations: 'Generations',
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
  union: {
    date: 'Date of the union',
    edit: {
      open: 'Fix the union',
      title: 'The union of {names}'
    },
    end: {
      date: 'Date it ended',
      divorce: 'Divorce',
      label: 'End of the union',
      none: 'None',
      separation: 'Separation'
    },
    kind: {
      label: 'Their union',
      marriage: 'Marriage',
      pacs: 'Civil partnership',
      partnership: 'Living together',
      unknown: 'Not said'
    },
    place: 'Place of the union'
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
