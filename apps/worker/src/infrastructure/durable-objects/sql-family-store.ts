import { z } from 'zod'

import {
  authorSchema,
  type ChangeLogEntry,
  entryCauseSchema
} from '@arbor/protocol/change-log'
import type { EntityId } from '@arbor/protocol/entity-id'
import { familySettingsSchema } from '@arbor/protocol/family'
import { filiationSchema } from '@arbor/protocol/filiation'
import { lifeEventSchema } from '@arbor/protocol/life-event'
import { operationSchema } from '@arbor/protocol/operation'
import { personSchema } from '@arbor/protocol/person'
import { photoSchema } from '@arbor/protocol/photo'
import { unionSchema } from '@arbor/protocol/union'

import type { FamilyState } from '@arbor/core/family/family-state'

import type { FamilyStore } from '@/domain/family/family-store'

import type { SqlDatabase } from './sql-database'

const SETTINGS_KEY = 'family'

/** What SQLite reads as no limit at all. */
const NO_LIMIT = -1

/** The tables holding one kind of entity as JSON, keyed by id. */
const ENTITY_TABLES = {
  events: 'events',
  filiations: 'filiations',
  photos: 'photos',
  unions: 'unions'
} as const

const bodyRowSchema = z.object({ body: z.string() })
const personRowSchema = bodyRowSchema.extend({ is_binned: z.int() })
const valueRowSchema = z.object({ value: z.string() })
const revisionRowSchema = z.object({ revision: z.int() })
const logRowSchema = z.object({
  at: z.string(),
  author: z.string(),
  cause: z.string().nullable(),
  operation: z.string(),
  revision: z.int()
})

/**
 * Parses what this store wrote itself. A row that no longer matches its schema
 * is a bug in a past write, not an input to recover from.
 */
const parseStored = <Value>(
  schema: { parse: (value: unknown) => Value },
  json: string
): Value => schema.parse(JSON.parse(json))

/** The ids whose entry differs between two states of one map: added, changed or removed. */
const changedIds = <Value>(
  before: ReadonlyMap<EntityId, Value>,
  after: ReadonlyMap<EntityId, Value>
): Set<EntityId> =>
  new Set(
    [...before.keys(), ...after.keys()].filter(
      (id) => before.get(id) !== after.get(id)
    )
  )

/**
 * The family's `FamilyStore` over its Durable Object's SQLite storage. The
 * current state is read once and then kept in memory: every write goes
 * through this object, so it never goes stale.
 */
export const createSqlFamilyStore = (database: SqlDatabase): FamilyStore => {
  let cachedFamily: FamilyState | null = null

  const readBodies = <Value>(
    table: string,
    schema: { parse: (value: unknown) => Value & { id: EntityId } }
  ): Map<EntityId, Value> =>
    new Map(
      database
        .exec(`SELECT body FROM ${table}`)
        .map((row) => parseStored(schema, bodyRowSchema.parse(row).body))
        .map((entity) => [entity.id, entity])
    )

  const loadFamily = (): FamilyState => {
    const personRows = database
      .exec('SELECT is_binned, body FROM persons')
      .map((row) => personRowSchema.parse(row))
    const persons = personRows.map((row) => ({
      isBinned: row.is_binned === 1,
      person: parseStored(personSchema, row.body)
    }))
    return {
      binnedPersonIds: new Set(
        persons.filter((row) => row.isBinned).map((row) => row.person.id)
      ),
      events: readBodies(ENTITY_TABLES.events, lifeEventSchema),
      filiations: readBodies(ENTITY_TABLES.filiations, filiationSchema),
      persons: new Map(persons.map((row) => [row.person.id, row.person])),
      photos: readBodies(ENTITY_TABLES.photos, photoSchema),
      unions: readBodies(ENTITY_TABLES.unions, unionSchema)
    }
  }

  const writeEntities = <Value>(
    table: string,
    before: ReadonlyMap<EntityId, Value>,
    after: ReadonlyMap<EntityId, Value>
  ) => {
    for (const id of changedIds(before, after)) {
      const entity = after.get(id)
      if (entity === undefined) {
        database.exec(`DELETE FROM ${table} WHERE id = ?`, id)
      } else {
        database.exec(
          `INSERT OR REPLACE INTO ${table} (id, body) VALUES (?, ?)`,
          id,
          JSON.stringify(entity)
        )
      }
    }
  }

  const writePersons = (before: FamilyState, after: FamilyState) => {
    const binChanges = [
      ...before.binnedPersonIds.symmetricDifference(after.binnedPersonIds)
    ]
    const ids = changedIds(before.persons, after.persons).union(
      new Set(binChanges)
    )
    for (const id of ids) {
      const person = after.persons.get(id)
      if (person === undefined) {
        database.exec('DELETE FROM persons WHERE id = ?', id)
      } else {
        database.exec(
          'INSERT OR REPLACE INTO persons (id, is_binned, body) VALUES (?, ?, ?)',
          id,
          after.binnedPersonIds.has(id) ? 1 : 0,
          JSON.stringify(person)
        )
      }
    }
  }

  return {
    readFamily: () => {
      cachedFamily ??= loadFamily()
      return cachedFamily
    },
    readLog: ({ after, limit }) =>
      database
        .exec(
          'SELECT revision, at, author, cause, operation FROM operations WHERE revision > ? ORDER BY revision LIMIT ?',
          after,
          limit ?? NO_LIMIT
        )
        .map((row): ChangeLogEntry => {
          const stored = logRowSchema.parse(row)
          return {
            at: stored.at,
            author: parseStored(authorSchema, stored.author),
            cause:
              stored.cause === null
                ? null
                : parseStored(entryCauseSchema, stored.cause),
            operation: parseStored(operationSchema, stored.operation),
            revision: stored.revision
          }
        }),
    readRevision: () => {
      const row = database
        .exec('SELECT COALESCE(MAX(revision), 0) AS revision FROM operations')
        .at(0)
      return revisionRowSchema.parse(row).revision
    },
    readSettings: () => {
      const row = database
        .exec('SELECT value FROM settings WHERE key = ?', SETTINGS_KEY)
        .at(0)
      return row === undefined
        ? null
        : parseStored(familySettingsSchema, valueRowSchema.parse(row).value)
    },
    record: ({ after, before, entry }) => {
      database.exec(
        'INSERT INTO operations (revision, at, author, cause, operation) VALUES (?, ?, ?, ?, ?)',
        entry.revision,
        entry.at,
        JSON.stringify(entry.author),
        entry.cause === null ? null : JSON.stringify(entry.cause),
        JSON.stringify(entry.operation)
      )
      writePersons(before, after)
      writeEntities(ENTITY_TABLES.unions, before.unions, after.unions)
      writeEntities(
        ENTITY_TABLES.filiations,
        before.filiations,
        after.filiations
      )
      writeEntities(ENTITY_TABLES.events, before.events, after.events)
      writeEntities(ENTITY_TABLES.photos, before.photos, after.photos)
      cachedFamily = after
    },
    writeSettings: (settings) => {
      database.exec(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        SETTINGS_KEY,
        JSON.stringify(settings)
      )
    }
  }
}
