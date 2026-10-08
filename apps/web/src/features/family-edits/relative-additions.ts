import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation, FiliationKind } from '@arbor/protocol/filiation'
import type { Occurrence } from '@arbor/protocol/occurrence'
import type { EntityOperation } from '@arbor/protocol/operation'
import type { Person } from '@arbor/protocol/person'
import type { Union } from '@arbor/protocol/union'

/** What the add form asks of a new relative; everything else starts empty. */
export type NewRelative = Pick<
  Person,
  'birth' | 'givenNames' | 'sex' | 'surname'
>

/** Makes a fresh id for each entity the addition creates. */
type NewId = () => EntityId

const created = (relative: NewRelative, id: EntityId): EntityOperation => ({
  person: {
    ...relative,
    birthSurname: null,
    death: null,
    id,
    livingOverride: null,
    notes: '',
    portraitPhotoId: null
  },
  type: 'person.create'
})

const linked = ({
  childId,
  kind,
  newId,
  parentId
}: {
  childId: EntityId
  kind: FiliationKind
  newId: NewId
  parentId: EntityId
}): EntityOperation => ({
  filiation: { childId, id: newId(), kind, parentId },
  type: 'filiation.create'
})

/**
 * A child of the person, with the other parent of the union it is born of,
 * or of the person alone. A child the person raised but did not have is
 * their step-child, and the other parent's by birth.
 */
export const childAddition = ({
  child,
  kind,
  newId,
  otherParentId,
  parentId
}: {
  child: NewRelative
  /** The child's link to the person whose sheet it is. */
  kind: FiliationKind
  newId: NewId
  otherParentId: EntityId | null
  parentId: EntityId
}): EntityOperation[] => {
  const childId = newId()
  return [
    created(child, childId),
    linked({ childId, kind, newId, parentId }),
    ...(otherParentId === null
      ? []
      : [
          linked({
            childId,
            kind: kind === 'step' ? 'birth' : kind,
            newId,
            parentId: otherParentId
          })
        ])
  ]
}

export const parentAddition = ({
  childId,
  kind,
  newId,
  parent
}: {
  childId: EntityId
  kind: FiliationKind
  newId: NewId
  parent: NewRelative
}): EntityOperation[] => {
  const parentId = newId()
  return [created(parent, parentId), linked({ childId, kind, newId, parentId })]
}

export const partnerAddition = ({
  kind,
  newId,
  partner,
  personId,
  start
}: {
  kind: Union['kind']
  newId: NewId
  partner: NewRelative
  personId: EntityId
  start: Occurrence | null
}): EntityOperation[] => {
  const partnerId = newId()
  return [
    created(partner, partnerId),
    {
      type: 'union.create',
      union: {
        end: null,
        id: newId(),
        kind,
        partnerIds: [personId, partnerId],
        start
      }
    }
  ]
}

/** A brother or a sister, made a child of each of the person's parents, by the same kind of link. */
export const siblingAddition = ({
  newId,
  parentFiliations,
  sibling
}: {
  newId: NewId
  /** The person's own links to their parents. */
  parentFiliations: readonly Filiation[]
  sibling: NewRelative
}): EntityOperation[] => {
  const siblingId = newId()
  return [
    created(sibling, siblingId),
    ...parentFiliations.map(({ kind, parentId }) =>
      linked({ childId: siblingId, kind, newId, parentId })
    )
  ]
}
