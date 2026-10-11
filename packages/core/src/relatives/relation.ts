/** How a new relative is tied to the person they are added to. */
export const RELATIONS = ['child', 'parent', 'partner', 'sibling'] as const
export type Relation = (typeof RELATIONS)[number]
