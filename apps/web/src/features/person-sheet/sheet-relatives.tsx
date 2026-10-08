import type React from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'
import { closeFamilyOf } from '@arbor/core/relatives/close-family'
import { familyLineage } from '@arbor/core/tree-layout/family-lineage'

import { useOpenFamily } from '@/features/family-pages/family-loader'
import { useKinWords } from '@/features/family-tree/kin-words'
import {
  filiationLineStyle,
  unionLineStyle
} from '@/features/family-tree/line-style'
import { LineSwatch } from '@/features/family-tree/line-swatch'
import type { PersonFace } from '@/features/family-tree/person-face'
import { RelativeButton } from '@/features/family-tree/relative-button'
import {
  personSheetPathFor,
  useNavigateTo
} from '@/infrastructure/router/navigation'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useUnionStory } from './union-story'

type SheetRelativesProps = {
  face: PersonFace
  faces: ReadonlyMap<EntityId, PersonFace>
  family: FamilyState
}

const SheetGroup: React.FC<{ children: React.ReactNode; title: string }> = ({
  children,
  title
}) => (
  <div className='sheet-group'>
    <h3 className='sheet-group-title'>{title}</h3>
    {children}
  </div>
)

const yearsLine = (relative: PersonFace): string[] =>
  relative.years === '' ? [] : [relative.years]

/** The person's parents, brothers and sisters, unions and children, each one touch away from their own sheet. */
export const SheetRelatives: React.FC<SheetRelativesProps> = ({
  face,
  faces,
  family
}) => {
  const translate = useTranslate()
  const navigateTo = useNavigateTo()
  const { familyId } = useOpenFamily()
  const kin = useKinWords()
  const unionStory = useUnionStory()
  const close = closeFamilyOf(familyLineage(family), face.id)
  // Sheet to sheet replaces: Back closes the sheet rather than walking back through every relative visited.
  const openSheetOf = (personId: EntityId) => () =>
    navigateTo(personSheetPathFor({ familyId, personId }), { replace: true })

  const parents = close.parentFiliations.flatMap((filiation) => {
    const parent = faces.get(filiation.parentId)
    return parent === undefined ? [] : [{ filiation, parent }]
  })
  const siblings = close.siblings.flatMap(
    ({ kind, personId, sharedParentId }) => {
      const sibling = faces.get(personId)
      const sharedParent = faces.get(sharedParentId)
      return sibling === undefined || sharedParent === undefined
        ? []
        : [{ kind, sharedParent, sibling }]
    }
  )
  const unions = close.couples.flatMap(({ partnerId, union }) =>
    union === null
      ? []
      : [
          {
            partner: partnerId === null ? null : (faces.get(partnerId) ?? null),
            union
          }
        ]
  )
  const children = close.couples.flatMap(({ children: coupleChildren }) =>
    coupleChildren.flatMap(({ childId, filiation, otherParentFiliations }) => {
      const child = faces.get(childId)
      const otherParentId = otherParentFiliations[0]?.parentId
      return child === undefined
        ? []
        : [
            {
              child,
              filiation,
              otherParent:
                otherParentId === undefined
                  ? null
                  : (faces.get(otherParentId) ?? null)
            }
          ]
    })
  )

  return (
    <>
      {parents.length === 0 ? null : (
        <SheetGroup title={translate('tree.spread.parents')}>
          {parents.map(({ filiation, parent }) => (
            <RelativeButton
              face={parent}
              isMorphing={false}
              key={filiation.id}
              lines={[kin.parent(parent, filiation), ...yearsLine(parent)]}
              onPress={openSheetOf(parent.id)}
            />
          ))}
        </SheetGroup>
      )}
      {siblings.length === 0 ? null : (
        <SheetGroup title={translate('tree.spread.siblings')}>
          {siblings.map(({ kind, sharedParent, sibling }) => (
            <RelativeButton
              face={sibling}
              isMorphing={false}
              key={sibling.id}
              lines={[
                kin.sibling({ kind, sharedParent, sibling }),
                ...yearsLine(sibling)
              ]}
              onPress={openSheetOf(sibling.id)}
            />
          ))}
        </SheetGroup>
      )}
      {unions.length === 0 ? null : (
        <SheetGroup title={translate('sheet.unions')}>
          {unions.map(({ partner, union }) => (
            <div className='sheet-union' key={union.id}>
              {partner === null ? (
                <p className='sheet-union-unknown'>
                  {translate('sheet.unknownPartner')}
                </p>
              ) : (
                <RelativeButton
                  face={partner}
                  isMorphing={false}
                  lines={[kin.partner(partner, union), ...yearsLine(partner)]}
                  onPress={openSheetOf(partner.id)}
                />
              )}
              <p className='sheet-union-story'>
                <LineSwatch
                  height={22}
                  isEnded={union.end !== null}
                  style={unionLineStyle(union)}
                  width={40}
                />
                <span>{unionStory(union)}</span>
              </p>
            </div>
          ))}
        </SheetGroup>
      )}
      {children.length === 0 ? null : (
        <SheetGroup title={translate('tree.spread.children')}>
          {children.map(({ child, filiation, otherParent }) => (
            <RelativeButton
              face={child}
              isMorphing={false}
              key={filiation.id}
              lines={[
                kin.child({ child, filiation, otherParent, parent: face }),
                ...yearsLine(child)
              ]}
              onPress={openSheetOf(child.id)}
              swatch={filiationLineStyle(filiation.kind)}
            />
          ))}
        </SheetGroup>
      )}
    </>
  )
}
