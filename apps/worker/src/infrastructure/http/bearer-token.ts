import { AUTHORIZATION_SCHEME } from '@arbor/protocol/routes'

/** The token an `Authorization` header carries in the API's scheme, `null` without one. */
export const bearerTokenOf = (authorization: string | undefined) => {
  const [scheme, token] = (authorization ?? '').split(' ')
  return scheme === AUTHORIZATION_SCHEME && token !== undefined ? token : null
}
