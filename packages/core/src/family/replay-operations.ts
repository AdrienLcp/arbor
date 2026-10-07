import type { Operation } from '@arbor/protocol/operation'

import { applyInOrder } from './apply-operation'
import { EMPTY_FAMILY } from './family-state'

/** Rebuilds a family from its change log, from nothing. */
export const replayOperations = (operations: readonly Operation[]) =>
  applyInOrder(EMPTY_FAMILY, operations)
