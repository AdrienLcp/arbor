import { DurableObject } from 'cloudflare:workers'
import type { Result } from '@adrienlcp/result'

import type { CreateFamilyInput } from '@arbor/protocol/routes'

import type { Env } from '@/env'
import {
  type FamilyKeys,
  type FamilyRoomRoutes,
  familyRoomRoutes
} from '@/infrastructure/http/family-room-routes'

import { sqlDatabaseOf } from './sql-database'

/** One family: its tree, its change log, its photos and its access keys, in the object's own SQLite. */
export class FamilyRoom extends DurableObject<Env> {
  private readonly routes: FamilyRoomRoutes

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.routes = familyRoomRoutes(sqlDatabaseOf(ctx.storage))
  }

  create(
    input: CreateFamilyInput
  ): Promise<Result<FamilyKeys, 'family_exists'>> {
    return this.routes.create(input)
  }

  override fetch(request: Request): Promise<Response> {
    return this.routes.fetch(request)
  }
}
