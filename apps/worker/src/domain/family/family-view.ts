import type { Role } from '@arbor/protocol/access'
import type { EntityId } from '@arbor/protocol/entity-id'
import {
  type FamilyResponse,
  type FamilySettings,
  familyResponseSchema
} from '@arbor/protocol/family'
import type { CalendarPoint, FuzzyDate } from '@arbor/protocol/fuzzy-date'
import type { LifeEvent } from '@arbor/protocol/life-event'
import type { Person } from '@arbor/protocol/person'

import type { FamilyState } from '@arbor/core/family/family-state'
import { isLiving } from '@arbor/core/family/is-living'

/** Who reads the family, and the day that decides who counts as living. */
export type Viewer = {
  role: Role
  settings: FamilySettings
  today: Temporal.PlainDate
}

const yearOf = (point: CalendarPoint): CalendarPoint => ({
  precision: 'year',
  year: point.year
})

const yearOnly = (date: FuzzyDate | null): FuzzyDate | null => {
  if (date === null) return null
  return date.qualifier === 'between'
    ? { ...date, from: yearOf(date.from), to: yearOf(date.to) }
    : { ...date, point: yearOf(date.point) }
}

const withoutLivingDetails = (person: Person): Person => ({
  ...person,
  birth:
    person.birth === null
      ? null
      : { ...person.birth, date: yearOnly(person.birth.date) },
  notes: '',
  portraitPhotoId: null
})

/** The people whose exact dates, notes and photos this viewer may not see. */
const hiddenLivingIds = (
  family: FamilyState,
  viewer: Viewer
): ReadonlySet<EntityId> => {
  const hidesLiving =
    viewer.role === 'reader' && viewer.settings.hidesLivingFromReaders
  if (!hidesLiving) return new Set()
  return new Set(
    family.persons
      .values()
      .filter((person) => isLiving(person, viewer.today))
      .map((person) => person.id)
  )
}

/** Whether a photo shows for this viewer: not when it belongs to a living person the reader link keeps private. */
export const isPhotoVisibleTo = ({
  family,
  photoId,
  viewer
}: {
  family: FamilyState
  photoId: EntityId
  viewer: Viewer
}): boolean => {
  const photo = family.photos.get(photoId)
  if (photo === undefined) return false
  return (
    photo.personId === null ||
    !hiddenLivingIds(family, viewer).has(photo.personId)
  )
}

/** The family as this viewer may see it, encoded through its schema so nothing unlisted leaves. */
export const toFamilyResponse = ({
  family,
  revision,
  viewer
}: {
  family: FamilyState
  revision: number
  viewer: Viewer
}): FamilyResponse => {
  const hidden = hiddenLivingIds(family, viewer)
  const isHidden = (personId: EntityId | null) =>
    personId !== null && hidden.has(personId)
  const visibleEvent = (event: LifeEvent): LifeEvent =>
    isHidden(event.personId) ? { ...event, date: yearOnly(event.date) } : event

  return familyResponseSchema.parse({
    family: {
      binnedPersonIds: [...family.binnedPersonIds],
      events: [...family.events.values().map(visibleEvent)],
      filiations: [...family.filiations.values()],
      persons: [
        ...family.persons
          .values()
          .map((person) =>
            isHidden(person.id) ? withoutLivingDetails(person) : person
          )
      ],
      photos: [
        ...family.photos.values().filter((photo) => !isHidden(photo.personId))
      ],
      unions: [...family.unions.values()]
    },
    revision,
    role: viewer.role,
    settings: viewer.settings
  })
}
