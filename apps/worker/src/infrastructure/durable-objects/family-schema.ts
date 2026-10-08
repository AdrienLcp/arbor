import { z } from 'zod'

import type { SqlDatabase } from './sql-database'

/**
 * Each entry upgrades the schema by one version; an entry, once deployed, is
 * never edited — a change is a new entry. A family's object runs the ones it
 * has not seen yet.
 */
const MIGRATIONS: readonly (readonly string[])[] = [
  [
    'CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)',
    'CREATE TABLE operations (revision INTEGER PRIMARY KEY, at TEXT NOT NULL, author TEXT NOT NULL, operation TEXT NOT NULL)',
    'CREATE TABLE persons (id TEXT PRIMARY KEY, is_binned INTEGER NOT NULL, body TEXT NOT NULL)',
    'CREATE TABLE unions (id TEXT PRIMARY KEY, body TEXT NOT NULL)',
    'CREATE TABLE filiations (id TEXT PRIMARY KEY, body TEXT NOT NULL)',
    'CREATE TABLE events (id TEXT PRIMARY KEY, body TEXT NOT NULL)',
    'CREATE TABLE photos (id TEXT PRIMARY KEY, body TEXT NOT NULL)',
    'CREATE TABLE photo_files (photo_id TEXT NOT NULL, variant TEXT NOT NULL, content_type TEXT NOT NULL, bytes BLOB NOT NULL, PRIMARY KEY (photo_id, variant))',
    'CREATE TABLE access_keys (id TEXT PRIMARY KEY, digest TEXT NOT NULL UNIQUE, role TEXT NOT NULL, created_at TEXT NOT NULL, revoked_at TEXT)',
    'CREATE TABLE key_check_window (id INTEGER PRIMARY KEY CHECK (id = 1), failures INTEGER NOT NULL, started_at TEXT NOT NULL)'
  ],
  ['ALTER TABLE operations ADD COLUMN cause TEXT']
]

const versionRowSchema = z.object({ version: z.int() })

/**
 * Whether this object holds a family. Asked before anything is written, so a
 * request for a family that does not exist leaves no trace in storage.
 */
export const hasFamilySchema = (database: SqlDatabase): boolean =>
  database.exec(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'schema_version'"
  ).length > 0

/** Brings the schema to the latest version; running it again changes nothing. */
export const migrateFamilySchema = (database: SqlDatabase): void => {
  database.transaction(() => {
    database.exec(
      'CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)'
    )
    const stored = database.exec('SELECT version FROM schema_version').at(0)
    const version =
      stored === undefined ? 0 : versionRowSchema.parse(stored).version
    if (stored === undefined) {
      database.exec('INSERT INTO schema_version (version) VALUES (0)')
    }

    for (const [index, statements] of MIGRATIONS.entries()) {
      if (index < version) continue
      for (const statement of statements) database.exec(statement)
      database.exec('UPDATE schema_version SET version = ?', index + 1)
    }
  })
}
