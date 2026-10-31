import type { EntityId } from '@arbor/protocol/entity-id'

import { RELATIONS, type Relation } from '@arbor/core/relatives/relation'

/** How the newcomer is tied to the person: one of their relations, or no one yet. */
export const TIES = [...RELATIONS, 'none'] as const
export type Tie = Relation | 'none'

/** Where the add dialog opens: next to whom, and how when the screen already says it. */
export type AddingStart = { anchorId: EntityId; tie: Tie | null }
