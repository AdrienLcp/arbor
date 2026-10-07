import {
  dropFragmentFromAddress,
  openedAddress
} from '@/infrastructure/browser'

import { receivedLinkAt } from './received-link'
import { receiveFamilyLink } from './remembered-families'

/**
 * A family link carries its key in the fragment: the key moves to the
 * device's memory and leaves the address bar, before the router reads it.
 */
export const adoptFamilyLink = (): void => {
  const link = receivedLinkAt(openedAddress())

  if (link === null) {
    return
  }

  receiveFamilyLink(link)
  dropFragmentFromAddress()
}
