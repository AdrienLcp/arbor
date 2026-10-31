import { describe, expect, it } from 'vitest'

import { DEMO_FAMILY_OPERATIONS } from '../family/demo-family'
import { replayOperations } from '../family/replay-operations'
import { withoutPeople } from '../family/without-people'
import { familyLineage } from '../tree-layout/family-lineage'
import { hiddenPeople, linkBackOf, toggleShown } from './hidden-people'

const demoLineage = () => {
  const replayed = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (replayed.status !== 'success') throw new Error('the demo family replays')
  return familyLineage(replayed.data)
}

const PIERRE_SIDE = [
  'anne-morel',
  'claire-dubois',
  'emma-bertin',
  'lucie-morel',
  'odile-bertin',
  'sophie-garnier',
  'thomas-bertin'
]

describe('hiddenPeople', () => {
  it('hides nobody while nobody is unticked', () => {
    const hidden = hiddenPeople(demoLineage(), [])
    expect(hidden.anchorId).toBe('auguste-morel')
    expect(hidden.hiddenIds.size).toBe(0)
  })

  it('hides a married-in person alone when the tree still holds their children', () => {
    const hidden = hiddenPeople(demoLineage(), ['claire-dubois'])
    expect([...hidden.hiddenIds]).toEqual(['claire-dubois'])
    expect(hidden.carriedIds.size).toBe(0)
  })

  it('carries away whoever hangs on the tree only through the unticked person', () => {
    const hidden = hiddenPeople(demoLineage(), ['pierre-morel'])
    expect([...hidden.carriedIds].toSorted()).toEqual(PIERRE_SIDE)
    expect(hidden.hiddenIds.has('pierre-morel')).toBe(true)
    expect(hidden.hiddenIds.has('simone-morel')).toBe(false)
  })

  it('hangs the tree from the largest group left once its top is unticked', () => {
    const hidden = hiddenPeople(demoLineage(), ['auguste-morel'])
    expect(hidden.anchorId).not.toBeNull()
    expect(hidden.hiddenIds.has('louis-morel')).toBe(false)
    expect(hidden.hiddenIds.has('auguste-morel')).toBe(true)
  })

  it('forgets an unticked person who left the family', () => {
    const hidden = hiddenPeople(demoLineage(), ['nobody'])
    expect(hidden.uncheckedIds.size).toBe(0)
  })
})

describe('linkBackOf', () => {
  it('finds the unticked person a carried one hangs from', () => {
    const lineage = demoLineage()
    const hidden = hiddenPeople(lineage, ['pierre-morel', 'thomas-bertin'])
    expect(linkBackOf(lineage, hidden, 'emma-bertin')).toEqual([
      'pierre-morel',
      'thomas-bertin'
    ])
  })
})

describe('toggleShown', () => {
  it('tells who left with the person unticked', () => {
    const lineage = demoLineage()
    const { change } = toggleShown(
      lineage,
      hiddenPeople(lineage, []),
      'pierre-morel'
    )
    expect(change.kind).toBe('hidden')
    expect(
      change.kind === 'hidden' ? change.carriedIds.toSorted() : []
    ).toEqual(PIERRE_SIDE)
  })

  it('brings a carried person back with their link to the tree', () => {
    const lineage = demoLineage()
    const { after, change } = toggleShown(
      lineage,
      hiddenPeople(lineage, ['pierre-morel']),
      'anne-morel'
    )
    expect(change).toMatchObject({ kind: 'shown', linkIds: ['pierre-morel'] })
    expect(after.hiddenIds.size).toBe(0)
  })

  it('ticks back an unticked person, and whoever they carried', () => {
    const lineage = demoLineage()
    const { after, change } = toggleShown(
      lineage,
      hiddenPeople(lineage, ['pierre-morel']),
      'pierre-morel'
    )
    expect(change).toMatchObject({ kind: 'shown', linkIds: [] })
    expect(change.kind === 'shown' ? change.withIds.toSorted() : []).toEqual(
      PIERRE_SIDE
    )
    expect(after.uncheckedIds.size).toBe(0)
  })
})

describe('withoutPeople', () => {
  it('leaves the hidden people and their links out of the drawing', () => {
    const replayed = replayOperations(DEMO_FAMILY_OPERATIONS)
    if (replayed.status !== 'success')
      throw new Error('the demo family replays')
    const lineage = familyLineage(
      withoutPeople(replayed.data, new Set(['claire-dubois']))
    )
    expect(lineage.personIds).not.toContain('claire-dubois')
    expect(
      lineage.parentLinksOf('anne-morel').map(({ parentId }) => parentId)
    ).toEqual(['pierre-morel'])
  })
})
