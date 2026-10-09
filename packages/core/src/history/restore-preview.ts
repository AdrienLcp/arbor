import { Result } from '@adrienlcp/result'

import type { ChangeLogEntry } from '@arbor/protocol/change-log'
import type { EntityId } from '@arbor/protocol/entity-id'
import type { Person } from '@arbor/protocol/person'

import { applyInOrder, type SequenceRefusal } from '../family/apply-operation'
import type { FamilyState } from '../family/family-state'
import { replayOperations } from '../family/replay-operations'

/** A person a restore leaves in the tree with other details: who they are now, and who they become again. */
export type ChangedPerson = { now: Person; past: Person }

/** What restoring the family to a past revision would do to its people, before the keeper confirms. */
export type RestorePreview = {
  /** In the tree then, gone or in the bin now: they come back. */
  back: readonly Person[]
  changed: readonly ChangedPerson[]
  /** In the tree now, not then: they leave it, still kept in the history. */
  gone: readonly Person[]
  /** Unions, filiations, events or photos differ too: told in one sentence, not listed. */
  hasOtherChanges: boolean
}

const shown = (family: FamilyState): Map<EntityId, Person> =>
  new Map([...family.persons].filter(([id]) => !family.binnedPersonIds.has(id)))

/** Every person is built in the schema's field order, so their JSON compares field by field. */
const sameDetails = (first: Person, second: Person): boolean =>
  JSON.stringify(first) === JSON.stringify(second)

const sameEntities = <T>(
  first: ReadonlyMap<EntityId, T>,
  second: ReadonlyMap<EntityId, T>
): boolean =>
  first.size === second.size &&
  [...first].every(([id, value]) => second.get(id) === value)

/**
 * Replays the log up to `revision`, then on to today, and compares the two.
 * Replaying today from the past state keeps every untouched entity the same
 * object, so only what changed since is compared field by field.
 */
export const restorePreview = ({
  entries,
  revision
}: {
  /** The whole log, oldest first. */
  entries: readonly ChangeLogEntry[]
  revision: number
}): Result<RestorePreview, SequenceRefusal> => {
  const past = replayOperations(
    entries
      .filter((entry) => entry.revision <= revision)
      .map(({ operation }) => operation)
  )
  if (past.status === 'failure') return past
  const today = applyInOrder(
    past.data,
    entries
      .filter((entry) => entry.revision > revision)
      .map(({ operation }) => operation)
  )
  if (today.status === 'failure') return today

  const before = shown(past.data)
  const now = shown(today.data)
  const changed: ChangedPerson[] = []
  for (const [id, person] of now) {
    const earlier = before.get(id)
    if (earlier !== undefined && !sameDetails(earlier, person)) {
      changed.push({ now: person, past: earlier })
    }
  }

  return Result.success({
    back: [...before.values()].filter(({ id }) => !now.has(id)),
    changed,
    gone: [...now.values()].filter(({ id }) => !before.has(id)),
    hasOtherChanges: !(
      sameEntities(past.data.unions, today.data.unions) &&
      sameEntities(past.data.filiations, today.data.filiations) &&
      sameEntities(past.data.events, today.data.events) &&
      sameEntities(past.data.photos, today.data.photos)
    )
  })
}
