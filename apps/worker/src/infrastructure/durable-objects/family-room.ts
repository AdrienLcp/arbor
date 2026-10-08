import { DurableObject } from 'cloudflare:workers'
import type { Result } from '@adrienlcp/result'

import type { CreateFamilyInput } from '@arbor/protocol/routes'

import { nextDemoResetAfter } from '@/domain/demo/demo-reset'
import type { Env } from '@/env'
import { now } from '@/infrastructure/clock'
import { DEMO_PHOTO_FILES } from '@/infrastructure/demo-photos/demo-photo-files'
import {
  type FamilyKeys,
  type FamilyRoomRoutes,
  familyRoomRoutes
} from '@/infrastructure/http/family-room-routes'

import { sqlDatabaseOf } from './sql-database'

/** One family: its tree, its change log, its photos and its access keys, in the object's own SQLite. */
export class FamilyRoom extends DurableObject<Env> {
  private routes: FamilyRoomRoutes

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.routes = familyRoomRoutes(sqlDatabaseOf(ctx.storage))
  }

  /** The public demo: built on its first visit, then started over every night by the alarm. */
  async fetchDemo(request: Request): Promise<Response> {
    await this.routes.openDemo(DEMO_PHOTO_FILES)
    if ((await this.ctx.storage.getAlarm()) === null) {
      await this.scheduleDemoReset()
    }
    return this.routes.fetch(request)
  }

  /** Only the demo's object ever sets an alarm: it wipes the family and builds it again. */
  override async alarm(): Promise<void> {
    await this.ctx.storage.deleteAll()
    this.routes = familyRoomRoutes(sqlDatabaseOf(this.ctx.storage))
    await this.routes.openDemo(DEMO_PHOTO_FILES)
    await this.scheduleDemoReset()
  }

  private scheduleDemoReset(): Promise<void> {
    return this.ctx.storage.setAlarm(
      nextDemoResetAfter(now()).epochMilliseconds
    )
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
