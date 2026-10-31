import type { EntityId } from '@arbor/protocol/entity-id'
import type { EntityOperation } from '@arbor/protocol/operation'

/** Makes a fresh id for each entity the operations create. */
type NewId = () => EntityId

/**
 * Two people made brother and sister through a parent nobody knows yet:
 * siblings are tied through their parents, so when neither has one in the
 * tree, a parent with no name and no dates is added for both, to be completed
 * later.
 */
export const siblingsThroughUnknownParent = ({
  newId,
  personId,
  siblingId
}: {
  newId: NewId
  personId: EntityId
  siblingId: EntityId
}): EntityOperation[] => {
  const parentId = newId()
  return [
    {
      person: {
        birth: null,
        birthSurname: null,
        death: null,
        givenNames: '',
        id: parentId,
        livingOverride: null,
        notes: '',
        portraitPhotoId: null,
        sex: 'unknown',
        surname: ''
      },
      type: 'person.create'
    },
    ...[personId, siblingId].map(
      (childId): EntityOperation => ({
        filiation: { childId, id: newId(), kind: 'birth', parentId },
        type: 'filiation.create'
      })
    )
  ]
}
