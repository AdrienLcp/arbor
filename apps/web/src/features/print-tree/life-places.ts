import type { Person } from '@arbor/protocol/person'

import { DEATH_MARK } from '@/features/people/life-years'

/** Where a person was born and died, as a sticker prints them: "Lyon · † Paris", "Lyon", "† Paris"; empty when neither is known. */
export const lifePlaces = ({
  birth,
  death
}: Pick<Person, 'birth' | 'death'>): string => {
  const born = birth?.place?.trim() || null
  const died = death?.place?.trim() || null
  const diedText = died === null ? null : `${DEATH_MARK} ${died}`
  return [born, diedText].filter((place) => place !== null).join(' · ')
}
