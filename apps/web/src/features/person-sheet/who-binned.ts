import type { Author, ChangeLogEntry } from '@arbor/protocol/change-log'
import type { EntityId } from '@arbor/protocol/entity-id'
import type { Operation } from '@arbor/protocol/operation'

const binsPerson = (operation: Operation, personId: EntityId): boolean =>
  operation.type === 'group'
    ? operation.operations.some((inner) => binsPerson(inner, personId))
    : operation.type === 'person.bin' && operation.personId === personId

/** The last of these changes that put the person in the bin, or `null` when none of them did. */
export const lastBinning = (
  entries: readonly ChangeLogEntry[],
  personId: EntityId
): ChangeLogEntry | null =>
  entries.findLast(({ operation }) => binsPerson(operation, personId)) ?? null

/** Who last put the person in the bin among these changes, or `null` when none of them did. */
export const whoBinned = (
  entries: readonly ChangeLogEntry[],
  personId: EntityId
): Author | null => lastBinning(entries, personId)?.author ?? null
