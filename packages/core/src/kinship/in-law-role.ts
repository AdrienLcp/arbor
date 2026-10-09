import type { InLawBridge, Kinship } from './kinship'

/** A relation by marriage the family has its own word for: "gendre", "belle-sœur", "beau-père". */
export type InLawRole =
  | 'child-in-law'
  | 'foster-child'
  | 'foster-parent'
  | 'parent-in-law'
  | 'sibling-in-law'
  | 'step-child'
  | 'step-parent'

/** Keyed by `up:down`: the generations the person climbs, then the ones down to the relative. */
const ROLES_BY_DEGREE = {
  foster: { '0:1': 'foster-child', '1:0': 'foster-parent' },
  'person-partner': {
    '0:1': 'step-child',
    '1:0': 'parent-in-law',
    '1:1': 'sibling-in-law'
  },
  'relative-partner': {
    '0:1': 'child-in-law',
    '1:0': 'step-parent',
    '1:1': 'sibling-in-law'
  },
  step: { '0:1': 'step-child', '1:0': 'step-parent' }
} satisfies Record<InLawBridge, Record<string, InLawRole>>

/** The family's own word for a relation by marriage, `null` when it is told as a blood relation "par alliance". */
export const inLawRoleOf = ({
  bridge,
  tie: { degree }
}: Extract<Kinship, { kind: 'in-law' }>): InLawRole | null => {
  const roles: Partial<Record<string, InLawRole>> = ROLES_BY_DEGREE[bridge]
  return roles[`${degree.up}:${degree.down}`] ?? null
}
