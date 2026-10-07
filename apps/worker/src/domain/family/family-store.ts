import type { ChangeLogEntry } from '@arbor/protocol/change-log'
import type { FamilySettings } from '@arbor/protocol/family'

import type { FamilyState } from '@arbor/core/family/family-state'

/** One more entry of the log, with the family before and after it so only what changed is rewritten. */
export type RecordedChange = {
  after: FamilyState
  before: FamilyState
  entry: ChangeLogEntry
}

/** The family's settings, its change log and the state the log leads to. Synchronous: the object's SQLite storage is. */
export type FamilyStore = {
  readFamily: () => FamilyState
  /** The log entries after revision `after`, oldest first, at most `limit` of them. */
  readLog: (page: { after: number; limit: number }) => ChangeLogEntry[]
  /** The revision of the last entry, 0 for a family no one has edited yet. */
  readRevision: () => number
  readSettings: () => FamilySettings | null
  record: (change: RecordedChange) => void
  writeSettings: (settings: FamilySettings) => void
}
