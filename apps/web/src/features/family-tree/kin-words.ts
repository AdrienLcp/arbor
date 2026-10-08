import type { Filiation } from '@arbor/protocol/filiation'
import type { Union } from '@arbor/protocol/union'

import type { SiblingKind } from '@arbor/core/relatives/close-family'

import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { PersonFace } from './person-face'

/** What a relative is to the person whose page it is, in the words the family uses: "mother", "half-brother". */
export const useKinWords = () => {
  const translate = useTranslate()

  return {
    /** "daughter, with Claire"; a step-child or a foster child is named by who raised them. */
    child: ({
      child,
      filiation,
      otherParent,
      parent
    }: {
      child: PersonFace
      /** The child's link to the person whose page it is. */
      filiation: Filiation
      otherParent: PersonFace | null
      parent: PersonFace
    }): string => {
      const { kind } = filiation
      const word =
        kind === 'step' || kind === 'foster'
          ? translate(`tree.kin.child.${kind}.${child.sex}`, {
              name: parent.givenNames
            })
          : translate(`tree.kin.child.${kind}.${child.sex}`)
      return otherParent === null
        ? word
        : translate('tree.kin.withParent', {
            name: otherParent.givenNames,
            word
          })
    },
    parent: (parent: PersonFace, filiation: Filiation): string =>
      translate(`tree.kin.parent.${filiation.kind}.${parent.sex}`),
    partner: (partner: PersonFace, union: Union | null): string =>
      translate(`tree.kin.partner.${union?.kind ?? 'none'}.${partner.sex}`),
    /** A step-sibling is named by the parent who raised them both: "also raised by Pierre". */
    sibling: ({
      kind,
      sharedParent,
      sibling
    }: {
      kind: SiblingKind
      sharedParent: PersonFace
      sibling: PersonFace
    }): string => {
      switch (kind) {
        case 'full':
          return translate(`tree.kin.sibling.${sibling.sex}`)
        case 'half':
          return translate(`tree.kin.halfSibling.${sibling.sex}`)
        case 'step':
          return translate(`tree.kin.stepSibling.${sibling.sex}`, {
            name: sharedParent.givenNames
          })
        default:
          return kind satisfies never
      }
    }
  }
}
