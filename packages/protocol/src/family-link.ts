import type { AccessKey, FamilyId } from './access.ts'
import type { EntityId } from './entity-id.ts'
import { PAGE_ROUTES } from './page-routes.ts'
import { pathFor } from './routes.ts'

type LinkOrigin = {
  key: AccessKey
  origin: string
}

/** The key rides in the fragment, which browsers never send to a server, never log and never put in a `Referer`. */
const keyedLink = ({ key, origin, path }: LinkOrigin & { path: string }) => {
  const link = new URL(path, origin)
  link.hash = key

  return link.href
}

/** The link a relative opens. */
export const familyLinkFor = ({
  familyId,
  ...origin
}: LinkOrigin & { familyId: FamilyId }): string =>
  keyedLink({ ...origin, path: pathFor(PAGE_ROUTES.family, { familyId }) })

/** A link that opens the tree with one person's sheet already open, to send to whoever can complete it. */
export const personSheetLinkFor = ({
  familyId,
  personId,
  ...origin
}: LinkOrigin & { familyId: FamilyId; personId: EntityId }): string =>
  keyedLink({
    ...origin,
    path: pathFor(PAGE_ROUTES.personSheet, { familyId, personId })
  })
