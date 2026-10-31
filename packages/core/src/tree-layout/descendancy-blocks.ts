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

type BuiltBlock = {
  block: DescendancyBlock
  /** Whether the block draws anyone not in `drawnBefore`, itself or below. */
  bringsSomeoneNew: boolean
}

/**
 * `rootId`'s descendants down to `depth` generations, each person drawn once.
 * Someone in `drawnBefore` — already in another tree of the same canvas — is
 * drawn as a repeat, and below a repeat only the branches leading to someone
 * new are kept: the bride stands under her parents, without her children
 * again.
 */
export const descendancyBlocks = ({
  depth,
  drawnBefore = new Set(),
  lineage,
  rootId
}: {
  depth: number
  drawnBefore?: ReadonlySet<EntityId>
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

  const blockOf = (personId: EntityId, depthLeft: number): BuiltBlock => {
    const isRepeated = drawnBefore.has(personId)
    drawn.add(personId)
    const groups = groupsOf(personId, depthLeft > 0)
    const known = groups.filter((group) => group.partnerId !== null)
    const unknown = groups.filter((group) => group.partnerId === null)
    const ordered = [...known.slice(0, 1), null, ...known.slice(1), ...unknown]

    const partnerSlots = ordered.map((group): BlockSlot | null => {
      if (group === null || group.partnerId === null) return null
      const isPartnerRepeated =
        drawn.has(group.partnerId) || drawnBefore.has(group.partnerId)
      drawn.add(group.partnerId)
      return {
        isRepeated: isPartnerRepeated,
        kind: 'person',
        personId: group.partnerId
      }
    })

    const columns = ordered.map((group, slotIndex) => {
      if (group === null) return null
      const children = group.children
        .map(({ childId, filiations }) => ({
          built: blockOf(childId, depthLeft - 1),
          filiations
        }))
        .filter(({ built }) => !isRepeated || built.bringsSomeoneNew)
      const partnerSlot = partnerSlots[slotIndex] ?? null
      const isKept =
        !isRepeated ||
        children.length > 0 ||
        (partnerSlot?.kind === 'person' && !partnerSlot.isRepeated)
      return isKept ? { children, partnerSlot, union: group.union } : undefined
    })
    const kept = columns.filter((column) => column !== undefined)

    const slots = kept.map((column): BlockSlot => {
      if (column === null) return { isRepeated, kind: 'person', personId }
      return (
        column.partnerSlot ?? {
          childIds: column.children.map(({ built }) => built.block.personId),
          kind: 'unknown-parent'
        }
      )
    })

    return {
      block: {
        generation: lineage.generationOf(personId),
        groups: kept.flatMap((column, slotIndex) =>
          column === null
            ? []
            : {
                children: column.children.map(({ built, filiations }) => ({
                  block: built.block,
                  filiations
                })),
                partnerSlotIndex: slotIndex,
                union: column.union
              }
        ),
        personId,
        selfSlotIndex: kept.indexOf(null),
        slots
      },
      bringsSomeoneNew: !isRepeated || kept.length > 1
    }
  }

  return blockOf(rootId, depth).block
}
