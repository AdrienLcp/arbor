import { DatabaseSync } from 'node:sqlite'

import type { SqlDatabase } from './sql-database'

/**
 * A family database on Node's SQLite, in memory: what the tests run the
 * object's code on, since Cloudflare's test pool does not support Vitest 5 yet.
 */
export const memorySqlDatabase = (): SqlDatabase => {
  const sqlite = new DatabaseSync(':memory:')
  return {
    exec: (query, ...bindings) =>
      sqlite
        .prepare(query)
        .all(...bindings)
        .map((row) => ({ ...row })),
    transaction: (run) => {
      sqlite.exec('BEGIN')
      try {
        const outcome = run()
        sqlite.exec('COMMIT')
        return outcome
      } catch (error) {
        sqlite.exec('ROLLBACK')
        throw error
      }
    }
  }
}
