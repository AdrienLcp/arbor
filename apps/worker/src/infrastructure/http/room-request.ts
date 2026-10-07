import type { Role } from '@arbor/protocol/access'

import type { Admission } from '@/domain/access/access-service'
import type { AccessStore } from '@/domain/access/access-store'
import type { FamilyStore } from '@/domain/family/family-store'
import type { Viewer } from '@/domain/family/family-view'
import type { PhotoStore } from '@/domain/photos/photo-store'
import { now } from '@/infrastructure/clock'
import { utcDayOf } from '@/infrastructure/dates'

/** Everything one family's object keeps, and the transaction that writes to several of them at once. */
export type RoomStores = {
  access: AccessStore
  family: FamilyStore
  photos: PhotoStore
  transaction: <T>(run: () => T) => T
}

/** A request to a family, once its key has been checked. */
export type RoomRequest = {
  admission: Admission
  parameters: Readonly<Record<string, string | undefined>>
  request: Request
  stores: RoomStores
}

/** One API route a family's object answers, and the least role allowed on it. */
export type RoomRoute = {
  handle: (roomRequest: RoomRequest) => Response | Promise<Response>
  method: 'DELETE' | 'GET' | 'POST'
  needs: Role
  pattern: string
}

/** The family as it stands, seen by the role of the key that asked. */
export const viewerOf = ({ admission, stores }: RoomRequest): Viewer => {
  const settings = stores.family.readSettings()
  if (settings === null) {
    throw new Error('An admitted request reached a family with no settings')
  }
  return { role: admission.role, settings, today: utcDayOf(now()) }
}
