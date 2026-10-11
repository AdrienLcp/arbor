import type { LinkRefusal } from '@arbor/core/relatives/existing-relative-link'

/** The refusals a person picker explains in their own words; any other rule broken reads as "not possible". */
const EXPLAINED_REFUSALS = [
  'already_partners',
  'already_siblings',
  'ancestry_cycle',
  'duplicate_filiation',
  'no_known_parent',
  'same_person',
  'too_many_birth_parents'
] as const satisfies readonly LinkRefusal[]

type ExplainedRefusal = (typeof EXPLAINED_REFUSALS)[number]

export const linkRefusalKey = (
  refusal: LinkRefusal
): `add.existing.refused.${ExplainedRefusal | 'other'}` =>
  `add.existing.refused.${EXPLAINED_REFUSALS.find((explained) => explained === refusal) ?? 'other'}`
