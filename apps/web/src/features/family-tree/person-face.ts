import type { EntityId } from '@arbor/protocol/entity-id'
import type { Person } from '@arbor/protocol/person'

/** A person as the tree's lists and pages print them, everything worked out once for the whole family. */
export type PersonFace = {
  birthYear: number | null
  /** Counted from the oldest generation, 1 first: it picks the sticker's ink. */
  generation: number
  givenNames: string
  id: EntityId
  isDeceased: boolean
  monogram: string
  /** The photo on their sticker, `null` when the family has none. */
  portraitPhotoId: EntityId | null
  /** The full name, or the word for someone recorded without one. */
  name: string
  sex: Person['sex']
  /** The number printed above their slot, the same in every view. */
  slotNumber: number
  surname: string
  /** "1932 – † 2019"; empty when nothing is known. */
  years: string
}
