import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation } from '@arbor/protocol/filiation'
import type { Union } from '@arbor/protocol/union'

import type { BlockSlot } from './block-slots'
import type { FamilyLineage } from './family-lineage'

export type ChildBranch = {
  block: DescendancyBlock
  /** The child's filiations to the two parents of the group. */
  filiations: readonly Filiation[]
}

/** The children a person had with one partner, or with no known one. */
export type PartnerGroup = {
  children: readonly ChildBranch[]
  partnerSlotIndex: number
  /** `null` when the parents never formed a recorded union. */
  union: Union | null
}

/**
 * A relative by descent and their partners side by side — the first partner
 * on the left, later ones and an unknown one on the right — with each child
 * under the couple it came from. Groups follow the slots, left to right.
 */
export type DescendancyBlock = {
  generation: number
  groups: readonly PartnerGroup[]
  personId: EntityId
  selfSlotIndex: number
  slots: readonly BlockSlot[]
}

type GroupDraft = {
  children: { childId: EntityId; filiations: Filiation[] }[]
  partnerId: EntityId | null
  union: Union | null
}

/** `rootId`'s descendants down to `depth` generations, each person drawn once. */
export const descendancyBlocks = ({
  depth,
  lineage,
  rootId
}: {
  depth: number
  lineage: FamilyLineage
  rootId: EntityId
}): DescendancyBlock => {
  const drawn = new Set<EntityId>()

  const groupsOf = (personId: EntityId, withChildren: boolean) => {
    const groups: GroupDraft[] = lineage.unionsOf(personId).map((union) => ({
      children: [],
      partnerId: union.partnerIds.find((id) => id !== personId) ?? null,
      union
    }))
    if (!withChildren) return groups

    const groupWith = (otherParentIds: readonly EntityId[]): GroupDraft => {
      const existing = groups.find((group) =>
        group.partnerId === null
          ? otherParentIds.length === 0
          : otherParentIds.includes(group.partnerId)
      )
      if (existing !== undefined) return existing
      const added = {
        children: [],
        partnerId: otherParentIds.at(0) ?? null,
        union: null
      }
      groups.push(added)
      return added
    }

    for (const link of lineage.childLinksOf(personId)) {
      if (drawn.has(link.childId)) continue
      drawn.add(link.childId)
      const otherLinks = lineage
        .parentLinksOf(link.childId)
        .filter(({ parentId }) => parentId !== personId)
      const group = groupWith(otherLinks.map(({ parentId }) => parentId))
      group.children.push({
        childId: link.childId,
        filiations: [
          link,
          ...otherLinks.filter(({ parentId }) => parentId === group.partnerId)
        ]
      })
    }
    return groups
  }

  const blockOf = (personId: EntityId, depthLeft: number): DescendancyBlock => {
    drawn.add(personId)
    const groups = groupsOf(personId, depthLeft > 0)
    const known = groups.filter((group) => group.partnerId !== null)
    const unknown = groups.filter((group) => group.partnerId === null)
    const ordered = [...known.slice(0, 1), null, ...known.slice(1), ...unknown]

    const slots = ordered.map((group): BlockSlot => {
      if (group === null) return { isRepeated: false, kind: 'person', personId }
      if (group.partnerId === null) return { kind: 'unknown-parent' }
      const isRepeated = drawn.has(group.partnerId)
      drawn.add(group.partnerId)
      return { isRepeated, kind: 'person', personId: group.partnerId }
    })

    return {
      generation: lineage.generationOf(personId),
      groups: ordered.flatMap((group, slotIndex) =>
        group === null
          ? []
          : {
              children: group.children.map(({ childId, filiations }) => ({
                block: blockOf(childId, depthLeft - 1),
                filiations
              })),
              partnerSlotIndex: slotIndex,
              union: group.union
            }
      ),
      personId,
      selfSlotIndex: ordered.indexOf(null),
      slots
    }
  }

  return blockOf(rootId, depth)
}
