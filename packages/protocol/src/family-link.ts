import type { AccessKey, FamilyId } from './access'
import { PAGE_ROUTES } from './page-routes'
import { pathFor } from './routes'

/**
 * The link a relative opens. The key rides in the fragment, which browsers
 * never send to a server, never log and never put in a `Referer`.
 */
export const familyLinkFor = ({
  familyId,
  key,
  origin
}: {
  familyId: FamilyId
  key: AccessKey
  origin: string
}): string => {
  const link = new URL(pathFor(PAGE_ROUTES.family, { familyId }), origin)
  link.hash = key

  return link.href
}
