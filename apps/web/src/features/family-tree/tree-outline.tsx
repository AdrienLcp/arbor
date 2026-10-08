import type React from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import {
  familyOutline,
  type OutlineBranch,
  type OutlineCouple
} from '@arbor/core/relatives/family-outline'
import type { FamilyLineage } from '@arbor/core/tree-layout/family-lineage'

import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useKinWords } from './kin-words'
import { unionLineStyle } from './line-style'
import type { PersonFace } from './person-face'
import { RelativeButton } from './relative-button'
import { useUnionWords } from './union-words'

import './tree-outline.sass'

type OutlineProps = {
  faces: ReadonlyMap<EntityId, PersonFace>
  onPressPerson: (personId: EntityId) => void
}

const yearsLines = (face: PersonFace): string[] =>
  face.years === '' ? [] : [face.years]

const CoupleItem: React.FC<
  OutlineProps & { couple: OutlineCouple; person: PersonFace }
> = ({ couple, faces, onPressPerson, person }) => {
  const translate = useTranslate()
  const kin = useKinWords()
  const unionWords = useUnionWords()
  const partner =
    couple.partnerId === null ? undefined : faces.get(couple.partnerId)
  const when =
    couple.union === null ? [] : [unionWords(couple.union).join(', ')]

  return (
    <li className='outline-couple'>
      {partner === undefined ? (
        <p className='outline-unknown'>
          {translate('tree.outline.withUnknown')}
        </p>
      ) : (
        <RelativeButton
          face={partner}
          isMorphing={false}
          lines={[kin.partner(partner, couple.union), ...when]}
          onPress={() => onPressPerson(partner.id)}
          swatch={unionLineStyle(couple.union)}
        />
      )}
      {couple.children.length === 0 ? null : (
        <ul
          aria-label={translate('tree.outline.children', {
            name:
              partner === undefined
                ? person.name
                : `${person.givenNames} & ${partner.givenNames}`
          })}
          className='outline-list'
        >
          {couple.children.map((child) => (
            <BranchItem
              branch={child}
              faces={faces}
              key={child.personId}
              onPressPerson={onPressPerson}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

const BranchItem: React.FC<OutlineProps & { branch: OutlineBranch }> = ({
  branch,
  faces,
  onPressPerson
}) => {
  const translate = useTranslate()
  const face = faces.get(branch.personId)
  if (face === undefined) return null

  if (branch.isRepeated) {
    return (
      <li className='outline-repeated'>
        {translate('tree.outline.repeated', { name: face.name })}
      </li>
    )
  }

  return (
    <li className='outline-branch'>
      <RelativeButton
        face={face}
        isMorphing={false}
        lines={yearsLines(face)}
        onPress={() => onPressPerson(face.id)}
      />
      {branch.couples.length === 0 ? null : (
        <ul className='outline-couples'>
          {branch.couples.map((couple) => (
            <CoupleItem
              couple={couple}
              faces={faces}
              key={couple.union?.id ?? couple.partnerId ?? 'alone'}
              onPressPerson={onPressPerson}
              person={face}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

/** The whole family as nested lists, founders first: the tree a screen reader can walk, and a plain read on any screen. */
export const TreeOutline: React.FC<
  OutlineProps & { lineage: FamilyLineage }
> = ({ faces, lineage, onPressPerson }) => {
  const translate = useTranslate()

  return (
    <section
      aria-label={translate('tree.outline.label')}
      className='tree-outline'
    >
      <ul className='outline-list'>
        {familyOutline(lineage).map((branch) => (
          <BranchItem
            branch={branch}
            faces={faces}
            key={branch.personId}
            onPressPerson={onPressPerson}
          />
        ))}
      </ul>
    </section>
  )
}
