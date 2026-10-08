import type { ChangeLogEntry, EntryCause } from '@arbor/protocol/change-log'
import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation, FiliationKind } from '@arbor/protocol/filiation'
import type { LifeEvent } from '@arbor/protocol/life-event'
import type { EntityOperation } from '@arbor/protocol/operation'
import type { PersonFields } from '@arbor/protocol/person'
import type { Union } from '@arbor/protocol/union'

import { partsOf } from '@arbor/core/history/operation-reach'

import { personName } from '@/features/people/person-name'

/** A person as a sentence names them, as they were called then; `null` for someone recorded without a name. */
export type NamedPerson = string | null

type Change = 'create' | 'remove' | 'update'

/** A person field a correction may touch, names apart: a rename has its own sentence. */
export type CorrectedField = Exclude<
  keyof PersonFields,
  'givenNames' | 'surname'
>

/** One sentence of an entry, before the interface words it. */
export type StoryLine =
  | {
      childNames: NamedPerson[]
      kind: 'added'
      name: NamedPerson
      parentNames: NamedPerson[]
      partnerNames: NamedPerson[]
    }
  | { after: NamedPerson; before: NamedPerson; kind: 'renamed' }
  | { fields: CorrectedField[]; kind: 'corrected'; name: NamedPerson }
  | { kind: 'binned' | 'removed' | 'restored'; name: NamedPerson }
  | {
      change: Change
      ending: NonNullable<Union['end']>['kind'] | null
      kind: 'union'
      partnerNames: [NamedPerson, NamedPerson | 'unknown']
      unionKind: Union['kind']
    }
  | {
      change: Change
      childName: NamedPerson
      filiationKind: FiliationKind
      kind: 'filiation'
      parentName: NamedPerson
    }
  | {
      change: Change
      eventKind: LifeEvent['kind']
      kind: 'event'
      label: string | null
      name: NamedPerson
    }
  | { change: Change; kind: 'photo'; name: NamedPerson | 'none' }
  | EntryCause

/** What the log said so far about who is who: a sentence names people as they were called at that moment. */
type LogMemory = {
  eventOwners: Map<EntityId, EntityId>
  filiations: Map<EntityId, Filiation>
  names: Map<EntityId, Pick<PersonFields, 'givenNames' | 'surname'>>
  photoOwners: Map<EntityId, EntityId | null>
  unions: Map<EntityId, Union>
}

const emptyMemory = (): LogMemory => ({
  eventOwners: new Map(),
  filiations: new Map(),
  names: new Map(),
  photoOwners: new Map(),
  unions: new Map()
})

const nameIn = (memory: LogMemory, personId: EntityId): NamedPerson => {
  const parts = memory.names.get(personId)
  return parts === undefined
    ? null
    : personName({
        givenNames: parts.givenNames ?? '',
        surname: parts.surname ?? ''
      })
}

const remember = (memory: LogMemory, part: EntityOperation): void => {
  switch (part.type) {
    case 'person.create':
    case 'person.remove':
      memory.names.set(part.person.id, part.person)
      return
    case 'person.update':
      memory.names.set(part.personId, {
        ...memory.names.get(part.personId),
        ...(part.after.givenNames === undefined
          ? {}
          : { givenNames: part.after.givenNames }),
        ...(part.after.surname === undefined
          ? {}
          : { surname: part.after.surname })
      })
      return
    case 'union.create':
      memory.unions.set(part.union.id, part.union)
      return
    case 'union.update': {
      const union = memory.unions.get(part.unionId)
      if (union !== undefined) {
        memory.unions.set(part.unionId, { ...union, ...part.after })
      }
      return
    }
    case 'filiation.create':
      memory.filiations.set(part.filiation.id, part.filiation)
      return
    case 'filiation.update': {
      const filiation = memory.filiations.get(part.filiationId)
      if (filiation !== undefined) {
        memory.filiations.set(part.filiationId, { ...filiation, ...part.after })
      }
      return
    }
    case 'event.create':
      memory.eventOwners.set(part.event.id, part.event.personId)
      return
    case 'photo.create':
      memory.photoOwners.set(part.photo.id, part.photo.personId)
      return
    case 'photo.update':
      if (part.after.personId !== undefined) {
        memory.photoOwners.set(part.photoId, part.after.personId)
      }
      return
    default:
      return
  }
}

const NAME_FIELDS: ReadonlySet<string> = new Set(['givenNames', 'surname'])

const isCorrectedField = (field: string): field is CorrectedField =>
  !NAME_FIELDS.has(field)

const correctedFields = (after: PersonFields): CorrectedField[] =>
  Object.keys(after).filter(isCorrectedField).toSorted()

const changeOf = (type: EntityOperation['type']): Change =>
  type.endsWith('.create')
    ? 'create'
    : type.endsWith('.remove')
      ? 'remove'
      : 'update'

/** The links an addition made to the person it added: they read as one sentence, "added Léo, child of Anne". */
const linksOf = (parts: readonly EntityOperation[], personId: EntityId) => {
  const consumed = new Set<EntityOperation>()
  const parentIds: EntityId[] = []
  const childIds: EntityId[] = []
  const partnerIds: EntityId[] = []
  for (const part of parts) {
    if (part.type === 'filiation.create') {
      if (part.filiation.childId === personId) {
        parentIds.push(part.filiation.parentId)
        consumed.add(part)
      } else if (part.filiation.parentId === personId) {
        childIds.push(part.filiation.childId)
        consumed.add(part)
      }
    }
    if (
      part.type === 'union.create' &&
      part.union.partnerIds.includes(personId)
    ) {
      const partnerId = part.union.partnerIds.find((id) => id !== personId)
      if (partnerId != null) partnerIds.push(partnerId)
      consumed.add(part)
    }
  }
  return { childIds, consumed, parentIds, partnerIds }
}

const unionLine = ({
  change,
  name,
  union
}: {
  change: Change
  name: (id: EntityId) => NamedPerson
  union: Union
}): Extract<StoryLine, { kind: 'union' }> => ({
  change,
  ending: null,
  kind: 'union',
  partnerNames: [
    name(union.partnerIds[0]),
    union.partnerIds[1] === null ? 'unknown' : name(union.partnerIds[1])
  ],
  unionKind: union.kind
})

const filiationLine = ({
  change,
  filiation,
  name
}: {
  change: Change
  filiation: Filiation
  name: (id: EntityId) => NamedPerson
}): StoryLine => ({
  change,
  childName: name(filiation.childId),
  filiationKind: filiation.kind,
  kind: 'filiation',
  parentName: name(filiation.parentId)
})

const linesOfPart = ({
  after,
  before,
  part
}: {
  after: LogMemory
  before: LogMemory
  part: EntityOperation
}): StoryLine[] => {
  const name = (id: EntityId) => nameIn(after, id)
  switch (part.type) {
    case 'person.create':
      return [
        {
          childNames: [],
          kind: 'added',
          name: name(part.person.id),
          parentNames: [],
          partnerNames: []
        }
      ]
    case 'person.update': {
      const isRenamed = Object.keys(part.after).some((field) =>
        NAME_FIELDS.has(field)
      )
      const fields = correctedFields(part.after)
      return [
        ...(isRenamed
          ? [
              {
                after: name(part.personId),
                before: nameIn(before, part.personId),
                kind: 'renamed' as const
              }
            ]
          : []),
        ...(fields.length === 0
          ? []
          : [{ fields, kind: 'corrected' as const, name: name(part.personId) }])
      ]
    }
    case 'person.bin':
      return [{ kind: 'binned', name: name(part.personId) }]
    case 'person.restore':
      return [{ kind: 'restored', name: name(part.personId) }]
    case 'person.remove':
      return [{ kind: 'removed', name: name(part.person.id) }]
    case 'union.create':
    case 'union.remove':
      return [
        unionLine({ change: changeOf(part.type), name, union: part.union })
      ]
    case 'union.update': {
      const union = after.unions.get(part.unionId)
      const hasEnded =
        part.after.end != null && before.unions.get(part.unionId)?.end == null
      return union === undefined
        ? []
        : [
            {
              ...unionLine({ change: 'update', name, union }),
              ending: hasEnded ? (part.after.end?.kind ?? null) : null
            }
          ]
    }
    case 'filiation.create':
    case 'filiation.remove':
      return [
        filiationLine({
          change: changeOf(part.type),
          filiation: part.filiation,
          name
        })
      ]
    case 'filiation.update': {
      const filiation = after.filiations.get(part.filiationId)
      return filiation === undefined
        ? []
        : [filiationLine({ change: 'update', filiation, name })]
    }
    case 'event.create':
    case 'event.remove':
      return [
        {
          change: changeOf(part.type),
          eventKind: part.event.kind,
          kind: 'event',
          label: part.event.label,
          name: name(part.event.personId)
        }
      ]
    case 'event.update': {
      const ownerId = after.eventOwners.get(part.eventId)
      return [
        {
          change: 'update',
          eventKind: part.after.kind ?? 'other',
          kind: 'event',
          label: null,
          name: ownerId === undefined ? null : name(ownerId)
        }
      ]
    }
    case 'photo.create':
    case 'photo.remove':
      return [
        {
          change: changeOf(part.type),
          kind: 'photo',
          name:
            part.photo.personId === null ? 'none' : name(part.photo.personId)
        }
      ]
    case 'photo.update': {
      const ownerId = after.photoOwners.get(part.photoId) ?? null
      return [
        {
          change: 'update',
          kind: 'photo',
          name: ownerId === null ? 'none' : name(ownerId)
        }
      ]
    }
  }
}

/** The people a part is about: its subject, the people it links, the owner of the event or photo it touches. */
const peopleOfPart = (memory: LogMemory, part: EntityOperation): EntityId[] => {
  switch (part.type) {
    case 'person.create':
    case 'person.remove':
      return [part.person.id]
    case 'person.update':
    case 'person.bin':
    case 'person.restore':
      return [part.personId]
    case 'union.create':
    case 'union.remove':
      return part.union.partnerIds.filter((id) => id !== null)
    case 'union.update':
      return (
        memory.unions
          .get(part.unionId)
          ?.partnerIds.filter((id) => id !== null) ?? []
      )
    case 'filiation.create':
    case 'filiation.remove':
      return [part.filiation.childId, part.filiation.parentId]
    case 'filiation.update': {
      const filiation = memory.filiations.get(part.filiationId)
      return filiation === undefined
        ? []
        : [filiation.childId, filiation.parentId]
    }
    case 'event.create':
    case 'event.remove':
      return [part.event.personId]
    case 'event.update':
      return [memory.eventOwners.get(part.eventId)].filter(
        (id) => id !== undefined
      )
    case 'photo.create':
    case 'photo.remove':
      return [part.photo.personId].filter((id) => id !== null)
    case 'photo.update':
      return [memory.photoOwners.get(part.photoId), part.after.personId].filter(
        (id) => id != null
      )
  }
}

const copyOf = (memory: LogMemory): LogMemory => ({
  eventOwners: new Map(memory.eventOwners),
  filiations: new Map(memory.filiations),
  names: new Map(memory.names),
  photoOwners: new Map(memory.photoOwners),
  unions: new Map(memory.unions)
})

const storyOfEdit = ({
  after,
  before,
  parts
}: {
  after: LogMemory
  before: LogMemory
  parts: readonly EntityOperation[]
}): StoryLine[] => {
  const consumed = new Set<EntityOperation>()
  const lines: StoryLine[] = []
  for (const part of parts) {
    if (consumed.has(part)) continue
    if (part.type === 'person.create') {
      const links = linksOf(parts, part.person.id)
      for (const link of links.consumed) consumed.add(link)
      const named = (ids: EntityId[]) => ids.map((id) => nameIn(after, id))
      lines.push({
        childNames: named(links.childIds),
        kind: 'added',
        name: nameIn(after, part.person.id),
        parentNames: named(links.parentIds),
        partnerNames: named(links.partnerIds)
      })
      continue
    }
    lines.push(...linesOfPart({ after, before, part }))
  }
  return lines
}

/** An entry as the history tells it, and the people it is about. */
export type EntryStory = {
  lines: StoryLine[]
  personIds: ReadonlySet<EntityId>
}

/**
 * Every entry of the log told as sentences, keyed by revision. `entries` runs
 * oldest first and starts at the family's creation, so every person an entry
 * names was met before.
 */
export const storiesOf = (
  entries: readonly ChangeLogEntry[]
): ReadonlyMap<number, EntryStory> => {
  const stories = new Map<number, EntryStory>()
  let memory = emptyMemory()
  for (const { cause, operation, revision } of entries) {
    const parts = partsOf(operation)
    const before = memory
    const after = copyOf(memory)
    for (const part of parts) remember(after, part)
    stories.set(revision, {
      lines: cause === null ? storyOfEdit({ after, before, parts }) : [cause],
      personIds: new Set(parts.flatMap((part) => peopleOfPart(after, part)))
    })
    memory = after
  }
  return stories
}

/** Every person the log ever named, as last called: the bin and removed people keep their names here. */
export const namesInLog = (
  entries: readonly ChangeLogEntry[]
): ReadonlyMap<EntityId, NamedPerson> => {
  const memory = emptyMemory()
  for (const { operation } of entries) {
    for (const part of partsOf(operation)) remember(memory, part)
  }
  return new Map([...memory.names.keys()].map((id) => [id, nameIn(memory, id)]))
}
