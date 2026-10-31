import { classNames } from '@adrienlcp/react'
import type React from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import {
  familyOutline,
  type OutlineBranch,
  type OutlineCouple
} from '@arbor/core/relatives/family-outline'
import type { FamilyLineage } from '@arbor/core/tree-layout/family-lineage'

import { Checkbox } from '@/presentation/components/checkbox'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useKinWords } from './kin-words'
import { type LineStyle, unionLineStyle } from './line-style'
import type { PersonFace } from './person-face'
import { RelativeButton, RelativeLine } from './relative-button'
import { useUnionWords } from './union-words'

import './tree-outline.sass'

/** While choosing who to show: each line is a tick instead of a way to the person. */
export type OutlineChoosing = {
  /** "Holds to the tree only through Pierre Morel" for someone carried away with an unticked person, `null` for anyone else. */
  carriedLineOf: (personId: EntityId) => string | null
  hiddenIds: ReadonlySet<EntityId>
  onToggle: (personId: EntityId) => void
}

type OutlineProps = {
  /** `null` outside "Choose who to show". */
  choosing: OutlineChoosing | null
  faces: ReadonlyMap<EntityId, PersonFace>
  onPressPerson: (personId: EntityId) => void
}

type OutlinePersonProps = {
  choosing: OutlineChoosing | null
  face: PersonFace
  lines: readonly string[]
  onPress: () => void
  swatch?: LineStyle
}

/** One person of the outline: a way to them, or their tick while choosing who to show. */
const OutlinePerson: React.FC<OutlinePersonProps> = ({
  choosing,
  face,
  lines,
  onPress,
  swatch
}) => {
  if (choosing === null) {
    return (
      <RelativeButton
        face={face}
        isMorphing={false}
        lines={lines}
        onPress={onPress}
        swatch={swatch}
      />
    )
  }

  const isHidden = choosing.hiddenIds.has(face.id)
  const carriedLine = choosing.carriedLineOf(face.id)
  return (
    <Checkbox
      className={classNames('outline-tick', isHidden && 'is-hidden')}
      isSelected={!isHidden}
      onChange={() => choosing.onToggle(face.id)}
    >
      <span className='relative-button'>
        <RelativeLine
          face={face}
          isMorphing={false}
          lines={carriedLine === null ? lines : [carriedLine]}
          swatch={carriedLine === null ? swatch : undefined}
        />
      </span>
    </Checkbox>
  )
}

const yearsLines = (face: PersonFace): string[] =>
  face.years === '' ? [] : [face.years]

const CoupleItem: React.FC<
  OutlineProps & { couple: OutlineCouple; person: PersonFace }
> = ({ choosing, couple, faces, onPressPerson, person }) => {
  const translate = useTranslate()
  const kin = useKinWords()
  const unionWords = useUnionWords()
  const partner =
    couple.partnerId === null ? undefined : faces.get(couple.partnerId)
  const when = couple.union === null ? [] : [unionWords(couple.union)]

  return (
    <li className='outline-couple'>
      {partner === undefined ? (
        <p className='outline-unknown'>
          {translate('tree.outline.withUnknown')}
        </p>
      ) : (
        <OutlinePerson
          choosing={choosing}
          face={partner}
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
              choosing={choosing}
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
  choosing,
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
      <OutlinePerson
        choosing={choosing}
        face={face}
        lines={yearsLines(face)}
        onPress={() => onPressPerson(face.id)}
      />
      {branch.couples.length === 0 ? null : (
        <ul className='outline-couples'>
          {branch.couples.map((couple) => (
            <CoupleItem
              choosing={choosing}
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
> = ({ choosing, faces, lineage, onPressPerson }) => {
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
            choosing={choosing}
            faces={faces}
            key={branch.personId}
            onPressPerson={onPressPerson}
          />
        ))}
      </ul>
    </section>
  )
}
