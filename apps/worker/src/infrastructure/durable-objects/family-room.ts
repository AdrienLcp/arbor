import { DurableObject } from 'cloudflare:workers'

import type { Env } from '@/env'

/** One family: its tree, its change log and its access keys. Declared now so the first deploy creates the class. */
export class FamilyRoom extends DurableObject<Env> {}
