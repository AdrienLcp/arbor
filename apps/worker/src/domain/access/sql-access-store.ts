import { z } from 'zod'

import { keyIdSchema, ROLES } from '@arbor/protocol/access'

import { parseInstant, toIsoString } from '@/infrastructure/dates'
import type { SqlDatabase } from '@/infrastructure/durable-objects/sql-database'

import type { AccessStore } from './access-store'

const keyRowSchema = z.object({
  created_at: z.string(),
  digest: z.string(),
  id: keyIdSchema,
  revoked_at: z.string().nullable(),
  role: z.enum(ROLES)
})
const windowRowSchema = z.object({
  failures: z.int(),
  started_at: z.string()
})

/** The family's `AccessStore` over its Durable Object's SQLite storage. */
export const createSqlAccessStore = (database: SqlDatabase): AccessStore => ({
  insertKey: (key) => {
    database.exec(
      'INSERT INTO access_keys (id, digest, role, created_at, revoked_at) VALUES (?, ?, ?, ?, ?)',
      key.id,
      key.digest,
      key.role,
      key.createdAt,
      key.revokedAt
    )
  },
  readKeyCheckWindow: () => {
    const row = database
      .exec('SELECT failures, started_at FROM key_check_window WHERE id = 1')
      .at(0)
    if (row === undefined) return null
    const stored = windowRowSchema.parse(row)
    const startedAt = parseInstant(stored.started_at)
    if (startedAt.status === 'failure') {
      throw new Error(`Stored an unreadable instant: ${stored.started_at}`)
    }
    return { failures: stored.failures, startedAt: startedAt.data }
  },
  readKeys: () =>
    database
      .exec(
        'SELECT id, digest, role, created_at, revoked_at FROM access_keys ORDER BY created_at, id'
      )
      .map((row) => {
        const stored = keyRowSchema.parse(row)
        return {
          createdAt: stored.created_at,
          digest: stored.digest,
          id: stored.id,
          revokedAt: stored.revoked_at,
          role: stored.role
        }
      }),
  revokeKeys: ({ at, ids }) => {
    for (const id of ids) {
      database.exec(
        'UPDATE access_keys SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL',
        at,
        id
      )
    }
  },
  writeKeyCheckWindow: ({ failures, startedAt }) => {
    database.exec(
      'INSERT OR REPLACE INTO key_check_window (id, failures, started_at) VALUES (1, ?, ?)',
      failures,
      toIsoString(startedAt)
    )
  }
})
