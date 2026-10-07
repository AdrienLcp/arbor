import { describe, expect, it } from 'vitest'

import { migrateFamilySchema } from '@/infrastructure/durable-objects/family-schema'
import { memorySqlDatabase } from '@/infrastructure/durable-objects/memory-sql-database'

import { admit, issueKey } from './access-service'
import { MAX_FAILED_KEY_CHECKS } from './key-check-limit'
import { createSqlAccessStore } from './sql-access-store'

const KEEPER_DIGEST = 'a'.repeat(64)
const WRONG_DIGEST = 'b'.repeat(64)
const START = Temporal.Instant.from('2026-10-07T18:00:00Z')

const familyAccess = () => {
  const database = memorySqlDatabase()
  migrateFamilySchema(database)
  const store = createSqlAccessStore(database)
  issueKey({
    at: START.toString(),
    minted: { digest: KEEPER_DIGEST, id: 'keeper', key: 'k'.repeat(22) },
    role: 'keeper',
    store
  })
  return store
}

describe('[access] admission', () => {
  it('[access] stops checking keys after too many wrong ones, until the window ends', () => {
    const store = familyAccess()
    for (let attempt = 0; attempt < MAX_FAILED_KEY_CHECKS; attempt++) {
      admit({ digest: WRONG_DIGEST, now: START, store })
    }

    const lockedOut = admit({ digest: KEEPER_DIGEST, now: START, store })
    const afterWindow = admit({
      digest: KEEPER_DIGEST,
      now: START.add({ minutes: 15 }),
      store
    })

    expect(lockedOut).toEqual({ error: 'too_many_attempts', status: 'failure' })
    expect(afterWindow).toEqual({
      data: { keyId: 'keeper', role: 'keeper' },
      status: 'success'
    })
  })
})
