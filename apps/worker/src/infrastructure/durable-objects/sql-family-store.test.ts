import { describe, expect, it } from 'vitest'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { Operation } from '@arbor/protocol/operation'

import { DEMO_FAMILY_OPERATIONS } from '@arbor/core/family/demo-family'
import type { FamilyState } from '@arbor/core/family/family-state'
import { replayOperations } from '@arbor/core/family/replay-operations'

import { recordOperations } from '@/domain/family/family-service'
import type { FamilyStore } from '@/domain/family/family-store'

import { migrateFamilySchema } from './family-schema'
import { memorySqlDatabase } from './memory-sql-database'
import { createSqlFamilyStore } from './sql-family-store'

const AT = '2026-10-07T18:00:00.000Z'
const RANDOM_BATCHES = 300

/** A small seeded generator (mulberry32), so a failing sequence replays identically. */
const seededRandom = (seed: number) => {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

const randomEdits = (random: () => number) => {
  const pick = <Item>(items: readonly Item[]): Item | undefined =>
    items[Math.floor(random() * items.length)]
  let created = 0

  return (family: FamilyState): Operation | null => {
    const personIds = [...family.persons.keys()]
    const personId = pick(personIds)
    const otherId = pick(personIds)
    if (personId === undefined || otherId === undefined) return null
    const newId = (kind: string): EntityId => `random-${kind}-${++created}`

    const edits: (() => Operation | null)[] = [
      () => ({
        after: { notes: `note ${created++}` },
        before: { notes: '' },
        personId,
        type: 'person.update'
      }),
      () => ({ personId, type: 'person.bin' }),
      () => ({ personId, type: 'person.restore' }),
      () => ({
        filiation: {
          childId: personId,
          id: newId('filiation'),
          kind: 'birth',
          parentId: otherId
        },
        type: 'filiation.create'
      }),
      () => ({
        type: 'union.create',
        union: {
          end: null,
          id: newId('union'),
          kind: 'partnership',
          partnerIds: [personId, otherId],
          start: null
        }
      }),
      () => ({
        event: {
          date: null,
          id: newId('event'),
          kind: 'burial',
          label: null,
          personId,
          place: 'Brest'
        },
        type: 'event.create'
      }),
      () => {
        const filiation = pick([...family.filiations.values()])
        return filiation === undefined
          ? null
          : { filiation, type: 'filiation.remove' }
      }
    ]
    return pick(edits)?.() ?? null
  }
}

const recordAll = (store: FamilyStore, operations: readonly Operation[]) => {
  for (const operation of operations) {
    recordOperations({
      at: AT,
      input: {
        author: { kind: 'named', name: 'Test' },
        baseRevision: store.readRevision(),
        operations: [operation]
      },
      store
    })
  }
}

describe('[log] the stored family', () => {
  it('[log] equals the replay of its stored log after a random sequence of edits', () => {
    const database = memorySqlDatabase()
    migrateFamilySchema(database)
    const store = createSqlFamilyStore(database)
    recordAll(store, DEMO_FAMILY_OPERATIONS)

    const nextEdit = randomEdits(seededRandom(20261007))
    for (let batch = 0; batch < RANDOM_BATCHES; batch++) {
      const edit = nextEdit(store.readFamily())
      if (edit !== null) recordAll(store, [edit])
    }

    const log = store.readLog({ after: 0, limit: Number.MAX_SAFE_INTEGER })
    const replayed = replayOperations(log.map((entry) => entry.operation))
    const stored = createSqlFamilyStore(database).readFamily()

    expect(log.length).toBeGreaterThan(DEMO_FAMILY_OPERATIONS.length + 100)
    expect(replayed).toEqual({ data: stored, status: 'success' })
  })
})
