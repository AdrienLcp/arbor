import { classNames } from '@adrienlcp/react'
import type React from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import { closeFamilyOf } from '@arbor/core/relatives/close-family'
import type { FamilyLineage } from '@arbor/core/tree-layout/family-lineage'

import { generationClass } from '@/presentation/components/generation-class'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { FocusCouples } from './focus-couples'
import { useKinWords } from './kin-words'
import { filiationLineStyle } from './line-style'
import type { PersonFace } from './person-face'
import { RelativeButton } from './relative-button'
import { SpreadBar } from './spread-bar'
import { useUnionWords } from './union-words'

import './tree-spread.sass'

type TreeSpreadProps = {
  faces: ReadonlyMap<EntityId, PersonFace>
  focusId: EntityId
  lineage: FamilyLineage
  onPressPerson: (personId: EntityId) => void
}

const birthsOf = (
  faces: ReadonlyMap<EntityId, PersonFace>,
  generation: number
): { first: number; last: number } | null => {
  const years = [...faces.values()].flatMap((face) =>
    face.generation === generation && face.birthYear !== null
      ? [face.birthYear]
      : []
  )
  return years.length === 0
    ? null
    : { first: Math.min(...years), last: Math.max(...years) }
}

const Band: React.FC<{
  aside?: string
  children: React.ReactNode
  generation: number
  title: string
}> = ({ aside, children, generation, title }) => (
  <section className={classNames('spread-band', generationClass(generation))}>
    <h2 className='spread-band-head'>
      {title}
      {aside === undefined ? null : (
        <span className='spread-band-aside'>{aside}</span>
      )}
    </h2>
    {children}
  </section>
)

/**
 * The tree on a phone, one page at a time around a person: their parents
 * above, themselves between the partners of their unions, their children
 * below, then their brothers and sisters. Every link is written out in words.
 */
export const TreeSpread: React.FC<TreeSpreadProps> = ({
  faces,
  focusId,
  lineage,
  onPressPerson
}) => {
  const translate = useTranslate()
  const kin = useKinWords()
  const unionWords = useUnionWords()
  const focus = faces.get(focusId)
  if (focus === undefined) return null

  const close = closeFamilyOf(lineage, focusId)
  const parents = close.parentFiliations.flatMap((filiation) => {
    const face = faces.get(filiation.parentId)
    return face === undefined ? [] : [{ face, filiation }]
  })
  const couples = close.couples.map(({ partnerId, union }) => ({
    partner: partnerId === null ? null : (faces.get(partnerId) ?? null),
    union
  }))
  const children = close.couples.flatMap(({ children: coupleChildren }) =>
    coupleChildren.flatMap(({ childId, filiation, otherParentFiliations }) => {
      const face = faces.get(childId)
      const otherParentId = otherParentFiliations[0]?.parentId
      return face === undefined
        ? []
        : [
            {
              face,
              filiation,
              otherParent:
                otherParentId === undefined
                  ? null
                  : (faces.get(otherParentId) ?? null)
            }
          ]
    })
  )
  const siblings = close.siblings.flatMap(
    ({ kind, personId, sharedParentId }) => {
      const face = faces.get(personId)
      const sharedParent = faces.get(sharedParentId)
      return face === undefined || sharedParent === undefined
        ? []
        : [{ face, kind, sharedParent }]
    }
  )

  return (
    <div className='tree-spread'>
      <SpreadBar
        births={birthsOf(faces, focus.generation)}
        focus={focus}
        next={children[0]?.face ?? null}
        onTurn={onPressPerson}
        previous={parents[0]?.face ?? null}
      />
      <Band
        aside={
          close.parentsUnion === null
            ? undefined
            : unionWords(close.parentsUnion).join(', ')
        }
        generation={
          parents[0]?.face.generation ?? Math.max(1, focus.generation - 1)
        }
        title={translate('tree.spread.parents')}
      >
        {parents.length === 0 ? (
          <p className='spread-empty'>
            {translate('tree.spread.parentsEmpty')}
          </p>
        ) : (
          <ul className='spread-relatives'>
            {parents.map(({ face, filiation }) => (
              <li key={face.id}>
                <RelativeButton
                  face={face}
                  lines={[kin.parent(face, filiation)]}
                  onPress={() => onPressPerson(face.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </Band>
      <Band
        aside={translate('tree.generationShort', { number: focus.generation })}
        generation={focus.generation}
        title={
          couples.length === 0
            ? focus.name
            : translate('tree.spread.focus', { name: focus.givenNames })
        }
      >
        <FocusCouples
          couples={couples}
          focus={focus}
          onPressPerson={onPressPerson}
        />
      </Band>
      <Band
        generation={children[0]?.face.generation ?? focus.generation + 1}
        title={translate('tree.spread.children')}
      >
        {children.length === 0 ? (
          <p className='spread-empty'>
            {translate('tree.spread.childrenEmpty')}
          </p>
        ) : (
          <ul className='spread-relatives'>
            {children.map(({ face, filiation, otherParent }) => (
              <li key={face.id}>
                <RelativeButton
                  face={face}
                  lines={[
                    kin.child({
                      child: face,
                      filiation,
                      otherParent,
                      parent: focus
                    })
                  ]}
                  onPress={() => onPressPerson(face.id)}
                  swatch={filiationLineStyle(filiation.kind)}
                />
              </li>
            ))}
          </ul>
        )}
      </Band>
      {siblings.length === 0 ? null : (
        <Band
          generation={focus.generation}
          title={translate('tree.spread.siblings')}
        >
          <ul className='spread-relatives'>
            {siblings.map(({ face, kind, sharedParent }) => (
              <li key={face.id}>
                <RelativeButton
                  face={face}
                  lines={[kin.sibling({ kind, sharedParent, sibling: face })]}
                  onPress={() => onPressPerson(face.id)}
                />
              </li>
            ))}
          </ul>
        </Band>
      )}
    </div>
  )
}
