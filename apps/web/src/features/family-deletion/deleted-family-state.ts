import { z } from 'zod'

const deletedFamilyStateSchema = z.object({ deletedFamilyName: z.string() })

/** What the home page is told after a family was deleted, so it can say so. */
export type DeletedFamilyState = z.infer<typeof deletedFamilyStateSchema>

/** The name of the family just deleted, `null` when the page was reached any other way. */
export const deletedFamilyNameOf = (state: unknown): string | null => {
  const parsed = deletedFamilyStateSchema.safeParse(state)
  return parsed.success ? parsed.data.deletedFamilyName : null
}
