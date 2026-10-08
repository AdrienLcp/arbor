import { describe, expect, it } from 'vitest'

import type { EntityId } from '@arbor/protocol/entity-id'

import { DEMO_FAMILY_OPERATIONS } from '../family/demo-family'
import { replayOperations } from '../family/replay-operations'
import { familyLineage } from '../tree-layout/family-lineage'
import { generatedFamily } from '../tree-layout/generated-family'
import { closeFamilyOf } from './close-family'
import { familyOutline, type OutlineBranch } from './family-outline'

const demoLineage = () => {
  const family = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (family.status === 'failure') throw new Error('The demo family is refused')
  return familyLineage(family.data)
}

/** Every person the outline names, by descent or as a partner: a descendant who married another one is named twice. */
const writtenIds = (branches: readonly OutlineBranch[]): EntityId[] =>
  branches.flatMap((branch) =>
    branch.isRepeated
      ? []
      : [
          branch.personId,
          ...branch.couples.flatMap((couple) => [
            ...(couple.partnerId === null ? [] : [couple.partnerId]),
            ...writtenIds(couple.children)
          ])
        ]
  )

describe('[relatives] close family', () => {
  it('[relatives] gives a person’s parents and the union between them', () => {
    const pierre = closeFamilyOf(demoLineage(), 'pierre-morel')

    expect(pierre.parentFiliations.map(({ parentId }) => parentId)).toEqual([
      'louis-morel',
      'helene-roux'
    ])
    expect(pierre.parentsUnion?.id).toBe('louis-helene')
  })

  it('[relatives] puts each child under the couple it came from, a step-child with its own parent', () => {
    const couples = closeFamilyOf(demoLineage(), 'pierre-morel').couples

    expect(
      couples.map(({ children, partnerId }) => ({
        children: children.map(({ childId, filiation }) => [
          childId,
          filiation.kind
        ]),
        partnerId
      }))
    ).toEqual([
      { children: [['anne-morel', 'birth']], partnerId: 'claire-dubois' },
      { children: [['thomas-bertin', 'step']], partnerId: 'odile-bertin' }
    ])
  })

  it('[relatives] tells a half-brother from a full sister', () => {
    const siblings = closeFamilyOf(demoLineage(), 'pierre-morel').siblings

    expect(siblings).toContainEqual({
      kind: 'full',
      personId: 'simone-morel',
      sharedParentId: 'louis-morel'
    })
    expect(siblings).toContainEqual({
      kind: 'half',
      personId: 'michel-morel',
      sharedParentId: 'louis-morel'
    })
  })

  it('[relatives] calls a child raised by the same step-parent a step-sibling, never a half-sibling', () => {
    const siblings = closeFamilyOf(demoLineage(), 'anne-morel').siblings

    expect(siblings).toEqual([
      {
        kind: 'step',
        personId: 'thomas-bertin',
        sharedParentId: 'pierre-morel'
      }
    ])
  })

  it('[relatives] gives a married-in founder no parents and no siblings', () => {
    const claire = closeFamilyOf(demoLineage(), 'claire-dubois')

    expect(claire.parentFiliations).toEqual([])
    expect(claire.parentsUnion).toBeNull()
    expect(claire.siblings).toEqual([])
  })
})

describe('[relatives] family outline', () => {
  it('[relatives] names everyone out of the bin', () => {
    const lineage = demoLineage()
    const written = writtenIds(familyOutline(lineage))

    expect([...new Set(written)].toSorted()).toEqual(
      [...lineage.personIds].toSorted()
    )
  })

  it('[relatives] starts from the oldest founders and hangs a married-in partner beside their spouse', () => {
    const outline = familyOutline(demoLineage())
    const roots = outline.map(({ personId }) => personId)

    expect(roots[0]).toBe('auguste-morel')
    expect(roots).not.toContain('marie-le-goff')
    expect(roots).not.toContain('claire-dubois')
  })

  it('[relatives] names everyone of a generated family of 300', () => {
    const lineage = familyLineage(generatedFamily(300))
    const written = writtenIds(familyOutline(lineage))

    expect([...new Set(written)].toSorted()).toEqual(
      [...lineage.personIds].toSorted()
    )
  })
})
