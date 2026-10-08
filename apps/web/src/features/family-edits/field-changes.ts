import type { z } from 'zod'

type Fields = Record<string, unknown>

/** What an edit does to an entity's fields: their values before and after, only for those that differ. */
export type FieldChanges<Edited extends Fields> = {
  after: Edited
  before: Edited
}

/**
 * Compares what a form offers with what the entity holds, field by field;
 * `null` when nothing differs. Both sides go through the same schema, so
 * their keys come out in one order and compare as text.
 */
export const fieldChanges = <Edited extends Fields>(
  schema: z.ZodType<Edited>,
  editable: readonly (keyof Edited & string)[],
  current: Edited,
  edited: Edited
): FieldChanges<Edited> | null => {
  const pick = (source: Edited, fields: readonly string[]): Edited =>
    schema.parse(
      Object.fromEntries(fields.map((field) => [field, source[field]]))
    )

  const offered = editable.filter((field) => edited[field] !== undefined)
  const before = pick(current, offered)
  const after = pick(edited, offered)
  const changed = offered.filter(
    (field) => JSON.stringify(before[field]) !== JSON.stringify(after[field])
  )
  return changed.length === 0
    ? null
    : { after: pick(edited, changed), before: pick(current, changed) }
}
