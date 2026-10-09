import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'

/** What leaves the tree with a person put in the bin; everyone named stays in the tree, only the link to them goes. */
export type BinConsequences = {
  childIds: EntityId[]
  parentIds: EntityId[]
  /** Partners of the person's unions; an unknown partner has no one to name. */
  partnerIds: EntityId[]
  photoCount: number
}

/** The links and photos hidden with a person while they sit in the bin, and given back with them. */
export const binConsequences = (
  family: FamilyState,
  personId: EntityId
): BinConsequences => {
  const isShown = (id: EntityId) =>
    family.persons.has(id) && !family.binnedPersonIds.has(id)
  const filiations = [...family.filiations.values()]

  return {
    childIds: filiations
      .filter(({ parentId }) => parentId === personId)
      .map(({ childId }) => childId)
      .filter(isShown),
    parentIds: filiations
      .filter(({ childId }) => childId === personId)
      .map(({ parentId }) => parentId)
      .filter(isShown),
    partnerIds: [...family.unions.values()]
      .filter(({ partnerIds }) => partnerIds.includes(personId))
      .flatMap(({ partnerIds }) =>
        partnerIds.flatMap((id) =>
          id === null || id === personId || !isShown(id) ? [] : [id]
        )
      ),
    photoCount: [...family.photos.values()].filter(
      (photo) => photo.personId === personId
    ).length
  }
}
