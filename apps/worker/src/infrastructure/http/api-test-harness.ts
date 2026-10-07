import type { AccessKey, FamilyId } from '@arbor/protocol/access'
import {
  API_ROUTES,
  AUTHORIZATION_SCHEME,
  type CreatedFamily,
  createdFamilySchema,
  pathFor
} from '@arbor/protocol/routes'

import type { FamilyRooms } from '@/infrastructure/durable-objects/family-rooms'
import { memorySqlDatabase } from '@/infrastructure/durable-objects/memory-sql-database'

import { type FamilyRoomRoutes, familyRoomRoutes } from './family-room-routes'
import { handleRequest } from './handle-request'

const ORIGIN = 'http://localhost:8790'

/** The families' objects of one test, each on its own in-memory SQLite, as Cloudflare gives each its own storage. */
const memoryFamilyRooms = (): FamilyRooms => {
  const rooms = new Map<FamilyId, FamilyRoomRoutes>()
  const roomOf = (familyId: FamilyId) => {
    const room = rooms.get(familyId) ?? familyRoomRoutes(memorySqlDatabase())
    rooms.set(familyId, room)
    return room
  }
  return {
    create: (familyId, input) => roomOf(familyId).create(input),
    fetch: (familyId, request) => roomOf(familyId).fetch(request)
  }
}

type Call = {
  body?: BodyInit | object
  key?: AccessKey
  method?: 'DELETE' | 'GET' | 'POST'
}

/** The whole API as the worker serves it, over in-memory families. */
export const openTestApi = () => {
  const rooms = memoryFamilyRooms()
  const assets = { fetch: async () => new Response('<!doctype html>') }

  const call = (path: string, { body, key, method = 'GET' }: Call = {}) => {
    const headers = new Headers()
    if (key !== undefined) {
      headers.set('Authorization', `${AUTHORIZATION_SCHEME} ${key}`)
    }
    const isJson =
      body !== undefined &&
      !(body instanceof FormData) &&
      typeof body === 'object'
    if (isJson) headers.set('Content-Type', 'application/json')
    return handleRequest(
      new Request(new URL(path, ORIGIN), {
        body: isJson ? JSON.stringify(body) : (body ?? null),
        headers,
        method
      }),
      { assets, rooms }
    )
  }

  const createFamily = async (
    name = 'Famille Morel'
  ): Promise<CreatedFamily> => {
    const response = await call(API_ROUTES.families, {
      body: { name },
      method: 'POST'
    })
    return createdFamilySchema.parse(await response.json())
  }

  return { call, createFamily }
}

/** The address of one of a family's routes. */
export const familyPath = (
  familyId: FamilyId,
  route: 'family' | 'familyKey' | 'keys' | 'operations' = 'family'
) => pathFor(API_ROUTES[route], { familyId })
