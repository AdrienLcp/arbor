import type { AccessKey, FamilyId } from './access'

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
}): string => `${origin}/f/${familyId}#${key}`
