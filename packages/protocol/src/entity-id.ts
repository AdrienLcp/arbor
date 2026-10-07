import { z } from 'zod'

/** The id of every stored entity: short and URL-safe, minted by the side that creates the entity. */
export const entityIdSchema = z.string().regex(/^[\w-]{1,64}$/)
export type EntityId = z.infer<typeof entityIdSchema>
