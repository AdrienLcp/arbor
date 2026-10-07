import type { Person } from '@arbor/protocol/person'

/** A person's name as it is read aloud, given names first; `null` for someone recorded without one. */
export const personName = ({
  givenNames,
  surname
}: Pick<Person, 'givenNames' | 'surname'>): string | null =>
  `${givenNames} ${surname}`.trim() || null
