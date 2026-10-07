import type { Role } from '@arbor/protocol/access'

const ROLE_RANK = {
  contributor: 1,
  keeper: 2,
  reader: 0
} as const satisfies Record<Role, number>

/** Whether a link of `role` may do what `needed` may: each role can do everything the ones below it can. */
export const canActAs = ({ needed, role }: { needed: Role; role: Role }) =>
  ROLE_RANK[role] >= ROLE_RANK[needed]
