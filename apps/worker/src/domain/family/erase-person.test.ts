import { describe, expect, it } from 'vitest'

import type { Author } from '@arbor/protocol/change-log'
import type { Operation } from '@arbor/protocol/operation'
import type { Person } from '@arbor/protocol/person'

import { replayOperations } from '@arbor/core/family/replay-operations'

import { createSqlPhotoStore } from '@/domain/photos/sql-photo-store'
import { migrateFamilySchema } from '@/infrastructure/durable-objects/family-schema'
import { memorySqlDatabase } from '@/infrastructure/durable-objects/memory-sql-database'

import { erasePerson } from './erase-person'
import { ERASED_AUTHOR } from './erase-person-from-log'
import { recordOperations, undoEntries } from './family-service'
import { createSqlFamilyStore } from './sql-family-store'

const AT = '2026-10-23T18:00:00.000Z'
const ERASED_ID = 'robert'
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])
const TABLES = [
  'operations',
  'persons',
  'unions',
  'filiations',
  'events',
  'photos',
  'photo_files',
  'settings'
] as const

const NAMED: Author = { kind: 'named', name: 'Jeanne' }
const AS_ERASED: Author = { kind: 'person', personId: ERASED_ID }

const person = (id: string, givenNames: string): Person => ({
  birth: null,
  birthSurname: null,
  death: null,
  givenNames,
  id,
  livingOverride: null,
  notes: '',
  portraitPhotoId: null,
  sex: 'female',
  surname: 'Morel'
})

const photoOf = (personId: string): Operation => ({
  photo: { caption: '', date: null, id: `${personId}-photo`, personId },
  type: 'photo.create'
})

/** Jeanne and Robert, a couple, with their daughter Lucie: Robert has an event, a photo, signed edits, and a bin undone. */
const familyWithRobert = () => {
  const database = memorySqlDatabase()
  migrateFamilySchema(database)
  const store = createSqlFamilyStore(database)
  const photos = createSqlPhotoStore(database)
  const record = (operations: Operation[], author: Author = NAMED) => {
    const recorded = recordOperations({
      at: AT,
      input: { author, baseRevision: store.readRevision(), operations },
      store
    })
    if (recorded.status === 'failure') throw new Error(recorded.error)
    return recorded.data.revision
  }

  record([
    { person: person('jeanne', 'Jeanne'), type: 'person.create' },
    { person: person(ERASED_ID, 'Robert'), type: 'person.create' },
    { person: person('lucie', 'Lucie'), type: 'person.create' }
  ])
  record([
    {
      type: 'union.create',
      union: {
        end: null,
        id: 'couple',
        kind: 'marriage',
        partnerIds: ['jeanne', ERASED_ID],
        start: null
      }
    },
    {
      filiation: {
        childId: 'lucie',
        id: 'lucie-jeanne',
        kind: 'birth',
        parentId: 'jeanne'
      },
      type: 'filiation.create'
    },
    {
      filiation: {
        childId: 'lucie',
        id: 'lucie-robert',
        kind: 'birth',
        parentId: ERASED_ID
      },
      type: 'filiation.create'
    }
  ])
  record([
    {
      event: {
        date: null,
        id: 'robert-burial',
        kind: 'burial',
        label: null,
        personId: ERASED_ID,
        place: 'Brest'
      },
      type: 'event.create'
    }
  ])
  record([photoOf(ERASED_ID), photoOf('jeanne')])
  for (const personId of [ERASED_ID, 'jeanne']) {
    photos.writeFiles({
      files: [{ bytes: JPEG, contentType: 'image/jpeg', variant: 'full' }],
      id: `${personId}-photo`
    })
  }
  record(
    [
      {
        after: { notes: 'Born in Quimper' },
        before: { notes: '' },
        personId: 'jeanne',
        type: 'person.update'
      }
    ],
    AS_ERASED
  )
  const binned = record([{ personId: ERASED_ID, type: 'person.bin' }])
  undoEntries({
    at: AT,
    input: { author: NAMED, revisions: [binned] },
    role: 'keeper',
    store
  })
  record([
    {
      after: { notes: 'Fisherman' },
      before: { notes: '' },
      personId: ERASED_ID,
      type: 'person.update'
    }
  ])
  return { database, photos, store }
}

const rowsMentioning = (
  database: ReturnType<typeof memorySqlDatabase>,
  text: string
) =>
  TABLES.flatMap((table) =>
    database
      .exec(`SELECT * FROM ${table}`)
      .filter((row) =>
        Object.values(row).some(
          (value) => typeof value === 'string' && value.includes(text)
        )
      )
  )

describe('[erasure] erasing one person', () => {
  it('[erasure] leaves no row and no JSON naming them, their photo files included', () => {
    const { database, photos, store } = familyWithRobert()

    const erased = erasePerson({ personId: ERASED_ID, photos, store })

    expect(erased).toEqual({
      data: { removedEntries: 4, removedPhotos: 1 },
      status: 'success'
    })
    expect(rowsMentioning(database, ERASED_ID)).toEqual([])
    expect(photos.hasFiles('robert-photo')).toBe(false)
    expect(photos.hasFiles('jeanne-photo')).toBe(true)
  })

  it('[erasure] keeps the stored family equal to the replay of the stored log', () => {
    const { database, photos, store } = familyWithRobert()

    erasePerson({ personId: ERASED_ID, photos, store })
    const reread = createSqlFamilyStore(database)
    const log = reread.readLog({ after: 0 })
    const family = reread.readFamily()

    expect(replayOperations(log.map((entry) => entry.operation))).toEqual({
      data: family,
      status: 'success'
    })
    expect(store.readFamily()).toEqual(family)
    expect([...family.persons.keys()]).toEqual(['jeanne', 'lucie'])
    expect([...family.filiations.keys()]).toEqual(['lucie-jeanne'])
    expect(family.unions.size).toBe(0)
    expect(family.events.size).toBe(0)
  })

  it('[erasure] signs their edits of others as a person no longer in the tree', () => {
    const { photos, store } = familyWithRobert()

    erasePerson({ personId: ERASED_ID, photos, store })
    const signed = store
      .readLog({ after: 0 })
      .find(
        (entry) =>
          entry.operation.type === 'person.update' &&
          entry.operation.personId === 'jeanne'
      )

    expect(signed?.author).toEqual(ERASED_AUTHOR)
  })

  it('[erasure] never hands out a revision twice, though their last entry is gone', () => {
    const { photos, store } = familyWithRobert()
    const revision = store.readRevision()

    erasePerson({ personId: ERASED_ID, photos, store })
    const next = recordOperations({
      at: AT,
      input: {
        author: NAMED,
        baseRevision: revision,
        operations: [{ personId: 'lucie', type: 'person.bin' }]
      },
      store
    })

    expect(store.readLog({ after: 0 }).at(-2)?.revision).toBeLessThan(revision)
    expect(next).toEqual({
      data: { revision: revision + 1 },
      status: 'success'
    })
  })

  it('[erasure] refuses a person the family never had, and writes nothing', () => {
    const { photos, store } = familyWithRobert()
    const log = store.readLog({ after: 0 })

    const erased = erasePerson({ personId: 'nobody', photos, store })

    expect(erased).toEqual({ error: 'person_not_found', status: 'failure' })
    expect(store.readLog({ after: 0 })).toEqual(log)
  })
})
