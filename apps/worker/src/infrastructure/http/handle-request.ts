import {
  API_PREFIX,
  API_ROUTES,
  type ApiErrorResponse,
  type HealthResponse
} from '@arbor/protocol/routes'

import { type AssetFetcher, serveWebApp } from './serve-web-app'

type RequestEnv = {
  ASSETS: AssetFetcher
}

const apiError = (
  status: number,
  code: ApiErrorResponse['code'],
  message: string
): Response =>
  Response.json({ code, message } satisfies ApiErrorResponse, { status })

/** The worker's front door: the API; every other address is the web app. */
export const handleRequest = (
  request: Request,
  env: RequestEnv
): Response | Promise<Response> => {
  const { pathname } = new URL(request.url)

  if (pathname === API_ROUTES.health && request.method === 'GET') {
    return Response.json({ status: 'ok' } satisfies HealthResponse)
  }

  if (pathname.startsWith(`${API_PREFIX}/`)) {
    return apiError(404, 'not_found', 'No route behind this address')
  }

  return serveWebApp(request, env.ASSETS)
}
