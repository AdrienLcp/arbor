import type { EntityId } from '@arbor/protocol/entity-id'
import { randomId } from '@arbor/protocol/random-id'

const ENTITY_ID_LENGTH = 16

/** The id of a person, union or event this device creates; the server keeps the one it is given. */
export const newEntityId = (): EntityId => randomId(ENTITY_ID_LENGTH)
