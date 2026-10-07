import { DatabaseSync } from 'node:sqlite'

import { z } from 'zod'

import type { SqlDatabase } from './sql-database'

const sizeRowSchema = z.object({ size: z.int() })

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
    size: () =>
      sizeRowSchema.parse(
        sqlite
          .prepare(
            'SELECT page_count * page_size AS size FROM pragma_page_count(), pragma_page_size()'
          )
          .get()
      ).size,
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
