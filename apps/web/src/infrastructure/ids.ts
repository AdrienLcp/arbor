import { nanoid } from 'nanoid'

import type { EntityId } from '@arbor/protocol/entity-id'

const ENTITY_ID_LENGTH = 16

/** The id of a person, union or event this device creates; the server keeps the one it is given. */
export const newEntityId = (): EntityId => nanoid(ENTITY_ID_LENGTH)
