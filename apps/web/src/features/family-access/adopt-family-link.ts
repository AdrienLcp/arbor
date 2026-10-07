import { accessKeySchema } from '@arbor/protocol/access'

import {
  dropFragmentFromAddress,
  openedAddress
} from '@/infrastructure/browser'
import { familyIdInPath } from '@/infrastructure/router/navigation'

import { withReceivedKey } from './family-access'
import { rememberFamily } from './remembered-families'

/**
 * A family link carries its key in the fragment: the key moves to the
 * device's memory and leaves the address bar, before the router reads it.
 */
export const adoptFamilyLink = (): void => {
  const { fragment, pathname } = openedAddress()
  const familyId = familyIdInPath(pathname)
  const key = accessKeySchema.safeParse(fragment)

  if (familyId === null || !key.success) {
    return
  }

  rememberFamily(familyId, (access) => withReceivedKey(access, key.data))
  dropFragmentFromAddress()
}
