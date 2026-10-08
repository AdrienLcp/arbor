import type { EntityId } from '@arbor/protocol/entity-id'
import type { Person } from '@arbor/protocol/person'
import type { Union } from '@arbor/protocol/union'

import type { FamilyLineage } from '../tree-layout/family-lineage'

export type Sex = Person['sex']

/** What a kinship is read from: the links out of the bin, and each person's sex to word it. */
export type KinshipSources = {
  lineage: FamilyLineage
  sexOf: (personId: EntityId) => Sex
}

/** Generations between two people and the ancestors they share: `up` from the person, `down` to the relative. */
export type KinDegree = { down: number; up: number }

/** The people met going from the person to the relative, both included, for the tree to light up. */
export type KinPath = readonly EntityId[]

/** A relation by birth or adoption, through the closest ancestors the two people share. */
export type BloodTie = {
  degree: KinDegree
  /** The two sides branch off below a single shared parent: "demi-frère", "demi-cousine". */
  isHalf: boolean
  path: KinPath
  /**
   * For cousins of unequal generations, the sex of the one the relation is told
   * through: the cousin whose child the relative is ("fille d'un cousin
   * germain"), or the person's ancestor whose cousin the relative is ("cousin
   * germain du père"). `null` for every other relation.
   */
  removedLinkSex: Sex | null
}

/**
 * How a relation by marriage crosses over:
 * - `'person-partner'` — through the person's own partner: "beau-père" for the partner's father
 * - `'relative-partner'` — through the relative's partner: "gendre" for the daughter's husband
 * - `'step'` / `'foster'` — through a parent who raised a child not their own
 */
export type InLawBridge =
  | 'foster'
  | 'person-partner'
  | 'relative-partner'
  | 'step'

/** What the relative is to the person. */
export type Kinship =
  | { kind: 'self' }
  | { kind: 'unrelated' }
  | { kind: 'partner'; path: KinPath; relativeSex: Sex; union: Union }
  | { kind: 'blood'; relativeSex: Sex; tie: BloodTie }
  | {
      bridge: InLawBridge
      /** Through a union that ended in a divorce or a separation: "ex-belle-sœur". */
      isFormer: boolean
      kind: 'in-law'
      relativeSex: Sex
      tie: BloodTie
    }
