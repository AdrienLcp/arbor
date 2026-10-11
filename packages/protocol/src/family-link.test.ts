import { describe, expect, it } from 'vitest'

import { accessKeySchema, familyIdSchema } from './access.ts'
import { entityIdSchema } from './entity-id.ts'
import { familyLinkFor, personSheetLinkFor } from './family-link.ts'

const FAMILY_ID = familyIdSchema.parse('fam1ly-0123456789abcde')
const KEY = accessKeySchema.parse('Zt4wR9pLm2Qx-Zt4wR9pLm')
const PERSON_ID = entityIdSchema.parse('01J9Z8Y7X6W5V4T3S2R1Q0P9N8')
const ORIGIN = 'https://arbor.example'

describe('familyLinkFor', () => {
  it('[links] opens the family, its key in the fragment', () => {
    expect(
      familyLinkFor({ familyId: FAMILY_ID, key: KEY, origin: ORIGIN })
    ).toBe(`${ORIGIN}/f/${FAMILY_ID}#${KEY}`)
  })
})

describe('personSheetLinkFor', () => {
  it('[links] opens the person’s sheet over the tree, the family key in the fragment', () => {
    expect(
      personSheetLinkFor({
        familyId: FAMILY_ID,
        key: KEY,
        origin: ORIGIN,
        personId: PERSON_ID
      })
    ).toBe(`${ORIGIN}/f/${FAMILY_ID}/tree/${PERSON_ID}#${KEY}`)
  })
})
