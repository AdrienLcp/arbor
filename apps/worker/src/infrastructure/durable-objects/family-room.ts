import { DurableObject } from 'cloudflare:workers'
import type { Result } from '@adrienlcp/result'

import type { CreateFamilyInput } from '@arbor/protocol/routes'

import {
  type FamilyKeys,
  type FamilyRoomApp,
  familyRoomApp
} from '@/infrastructure/http/family-room-app'

import { sqlDatabaseOf } from './sql-database'

/** One family: its tree, its change log, its photos and its access keys, in the object's own SQLite. */
export class FamilyRoom extends DurableObject<Env> {
  private readonly app: FamilyRoomApp

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.app = familyRoomApp(sqlDatabaseOf(ctx.storage))
  }

  create(
    input: CreateFamilyInput
  ): Promise<Result<FamilyKeys, 'family_exists'>> {
    return this.app.create(input)
  }

  override fetch(request: Request): Promise<Response> {
    return this.app.fetch(request)
  }
}
