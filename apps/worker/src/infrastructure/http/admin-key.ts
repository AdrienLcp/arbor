import { bearerTokenOf } from './bearer-token'

const sha256Of = async (text: string) =>
  crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))

/**
 * Whether a request carries the publisher's `ADMIN_KEY`, compared in constant
 * time over digests of equal length. A Worker with no key set lets no one in.
 */
export const carriesAdminKey = async ({
  adminKey,
  authorization
}: {
  adminKey: string | undefined
  authorization: string | undefined
}): Promise<boolean> => {
  const presented = bearerTokenOf(authorization)
  if (adminKey === undefined || adminKey === '' || presented === null) {
    return false
  }
  const [expected, received] = await Promise.all([
    sha256Of(adminKey),
    sha256Of(presented)
  ])
  return crypto.subtle.timingSafeEqual(expected, received)
}
