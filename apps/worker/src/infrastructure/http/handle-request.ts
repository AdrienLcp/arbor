import { familyIdSchema } from '@arbor/protocol/access'
import { DEMO_FAMILY_ID } from '@arbor/protocol/demo-family'
import {
  API_PREFIX,
  API_ROUTES,
  type CreatedFamily,
  createFamilyInputSchema,
  type HealthResponse
} from '@arbor/protocol/routes'

import type { FamilyRooms } from '@/infrastructure/durable-objects/family-rooms'
import { newFamilyId } from '@/infrastructure/ids'

import { apiError, apiJson } from './api-response'
import { readJsonBody } from './request-body'
import { type AssetFetcher, serveWebApp } from './serve-web-app'

/** What the front door hands requests to: the built web app and the families' objects. */
export type RequestTargets = {
  assets: AssetFetcher
  rooms: FamilyRooms
}

const FAMILY_PATTERN = new URLPattern({ pathname: `${API_ROUTES.family}{/*}?` })

const createFamily = async (
  request: Request,
  rooms: FamilyRooms
): Promise<Response> => {
  const input = createFamilyInputSchema.safeParse(await readJsonBody(request))
  if (!input.success) return apiError('invalid_input', input.error.message)

  const familyId = newFamilyId()
  const created = await rooms.create(familyId, input.data)
  if (created.status === 'failure') {
    return apiError('internal_error', 'Drew the id of an existing family')
  }
  return apiJson({ familyId, ...created.data } satisfies CreatedFamily, 201)
}

/** Sends a request to its family's object; an address that cannot be a family id never wakes one. */
const forwardToFamily = (
  request: Request,
  rooms: FamilyRooms
): Promise<Response> | Response => {
  const familyId = familyIdSchema.safeParse(
    FAMILY_PATTERN.exec(request.url)?.pathname.groups.familyId
  )
  if (!familyId.success) {
    return apiError('not_found', 'No family behind this address')
  }
  return familyId.data === DEMO_FAMILY_ID
    ? rooms.fetchDemo(request)
    : rooms.fetch(familyId.data, request)
}

/** The worker's front door: the API; every other address is the web app. */
export const handleRequest = (
  request: Request,
  { assets, rooms }: RequestTargets
): Response | Promise<Response> => {
  const { pathname } = new URL(request.url)

  if (pathname === API_ROUTES.health && request.method === 'GET') {
    return Response.json({ status: 'ok' } satisfies HealthResponse)
  }

  if (pathname === API_ROUTES.families && request.method === 'POST') {
    return createFamily(request, rooms)
  }

  if (FAMILY_PATTERN.test(request.url)) {
    return forwardToFamily(request, rooms)
  }

  if (pathname.startsWith(`${API_PREFIX}/`)) {
    return apiError('not_found', 'No route behind this address')
  }

  return serveWebApp(request, assets)
}
