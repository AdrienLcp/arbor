import type { FiliationKind } from '@arbor/protocol/filiation'

import type { CloseFamily } from '@arbor/core/relatives/close-family'

/** The kinds of link a form offers; "unknown" is for imports, never a choice made by hand. */
export const LINK_KINDS = [
  'birth',
  'adoption',
  'step',
  'foster'
] as const satisfies readonly FiliationKind[]

/** A child already has two parents by birth: a third one is most likely a step-parent. */
export const firstParentKind = (close: CloseFamily): FiliationKind =>
  close.parentFiliations.filter(({ kind }) => kind === 'birth').length >= 2
    ? 'step'
    : 'birth'
