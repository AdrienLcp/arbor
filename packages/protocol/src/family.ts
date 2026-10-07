import { z } from 'zod'

import { ROLES } from './access'
import { entityIdSchema } from './entity-id'
import { filiationSchema } from './filiation'
import { lifeEventSchema } from './life-event'
import { personSchema } from './person'
import { photoSchema } from './photo'
import { unionSchema } from './union'

const FAMILY_NAME_MAX_LENGTH = 200

/** What the keeper decides for the whole family. */
export const familySettingsSchema = z.object({
  /** Whether the read-only link hides living people's exact birth date, notes and photos. */
  hidesLivingFromReaders: z.boolean(),
  name: z.string().trim().min(1).max(FAMILY_NAME_MAX_LENGTH)
})
export type FamilySettings = z.infer<typeof familySettingsSchema>

/** A family's whole current state, as its change log leaves it. */
export const familySnapshotSchema = z.object({
  binnedPersonIds: z.array(entityIdSchema),
  events: z.array(lifeEventSchema),
  filiations: z.array(filiationSchema),
  persons: z.array(personSchema),
  photos: z.array(photoSchema),
  unions: z.array(unionSchema)
})
export type FamilySnapshot = z.infer<typeof familySnapshotSchema>

/** A family as one link sees it: what the role may read, at a revision of the log. */
export const familyResponseSchema = z.object({
  family: familySnapshotSchema,
  revision: z.int().min(0),
  role: z.enum(ROLES),
  settings: familySettingsSchema
})
export type FamilyResponse = z.infer<typeof familyResponseSchema>
