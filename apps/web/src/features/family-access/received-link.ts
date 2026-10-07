import {
  type AccessKey,
  accessKeySchema,
  type FamilyId
} from '@arbor/protocol/access'

import { familyIdInPath } from '@/infrastructure/router/navigation'

/** What a family link hands over: which family, and the key that opens it. */
export type ReceivedLink = {
  familyId: FamilyId
  key: AccessKey
}

/** The family link an address is, `null` for any other address or a link without its key. */
export const receivedLinkAt = ({
  fragment,
  pathname
}: {
  fragment: string
  pathname: string
}): ReceivedLink | null => {
  const familyId = familyIdInPath(pathname)
  const key = accessKeySchema.safeParse(fragment)

  return familyId === null || !key.success ? null : { familyId, key: key.data }
}

/** Punctuation a sentence leaves stuck to the end of a link: "here is the link: https://…." */
const TRAILING_PUNCTUATION = /[.,;:!?)\]»"'’]+$/

const addressIn = (word: string): URL | null => {
  const candidate = word.replace(TRAILING_PUNCTUATION, '')

  return URL.parse(candidate) ?? URL.parse(`https://${candidate}`)
}

/**
 * The first family link in pasted text. People paste the whole message the
 * link came in, or the link without its `https://`.
 */
export const receivedLinkInText = (text: string): ReceivedLink | null => {
  for (const word of text.split(/\s+/)) {
    const address = addressIn(word)
    const link =
      address === null
        ? null
        : receivedLinkAt({
            fragment: address.hash.slice(1),
            pathname: address.pathname
          })

    if (link !== null) {
      return link
    }
  }

  return null
}
