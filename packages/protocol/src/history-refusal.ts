/** Why the family refused to take earlier entries back. */
export const HISTORY_REFUSALS = [
  /** An entry asked for is already taken back by a later one. */
  'already_undone',
  /** Later entries build on the ones asked for: they must be taken back with them. */
  'later_changes_depend',
  /** The family is already as it was at the revision asked for. */
  'nothing_to_restore',
  /** No entry of the log has the revision asked for. */
  'revision_not_found'
] as const
export type HistoryRefusal = (typeof HISTORY_REFUSALS)[number]
