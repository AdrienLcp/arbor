import { z } from 'zod'

import type { DemoWriteCount } from '@/domain/demo/demo-write-limit'

import type { SqlDatabase } from './sql-database'

const DEMO_WRITES_KEY = 'demo_writes'

const countRowSchema = z.object({ value: z.coerce.number().int() })

/** The demo's `DemoWriteCount`, one row in the settings table. */
export const createSqlDemoWriteCount = (
  database: SqlDatabase
): DemoWriteCount => ({
  add: () => {
    database.exec(
      "INSERT INTO settings (key, value) VALUES (?, '1') ON CONFLICT (key) DO UPDATE SET value = CAST(value AS INTEGER) + 1",
      DEMO_WRITES_KEY
    )
  },
  read: () => {
    const row = database
      .exec('SELECT value FROM settings WHERE key = ?', DEMO_WRITES_KEY)
      .at(0)
    return row === undefined ? 0 : countRowSchema.parse(row).value
  }
})
