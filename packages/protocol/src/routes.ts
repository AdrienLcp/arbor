import { z } from 'zod'

import { accessKeySchema, familyIdSchema, keyViewSchema } from './access'
import { authorSchema, changeLogEntrySchema } from './change-log'
import { familySettingsSchema } from './family'
import { operationSchema } from './operation'
import { OPERATION_REFUSALS } from './operation-refusal'

export const API_PREFIX = '/api'

const FAMILY = `${API_PREFIX}/families/:familyId`

/** Every path either end names: the worker matches it, the client fills it through `pathFor`. */
export const API_ROUTES = {
  families: `${API_PREFIX}/families`,
  family: FAMILY,
  familyKey: `${FAMILY}/family-key`,
  health: `${API_PREFIX}/health`,
  key: `${FAMILY}/keys/:keyId`,
  keys: `${FAMILY}/keys`,
  operations: `${FAMILY}/operations`,
  photo: `${FAMILY}/photos/:photoId`,
  photoFile: `${FAMILY}/photos/:photoId/:variant`
} as const

type PathParameters<Pattern extends string> =
  Pattern extends `${string}:${infer Name}/${infer Rest}`
    ? Name | PathParameters<`/${Rest}`>
    : Pattern extends `${string}:${infer Name}`
      ? Name
      : never

/** A route's address with its parameters filled in; a missing one is a type error. */
export const pathFor = <Pattern extends string>(
  pattern: Pattern,
  parameters: Record<PathParameters<Pattern>, string>
): string =>
  Object.entries<string>(parameters).reduce(
    (path, [name, value]) =>
      path.replace(`:${name}`, encodeURIComponent(value)),
    String(pattern)
  )

/** The scheme of the `Authorization` header that carries a link's key. */
export const AUTHORIZATION_SCHEME = 'Bearer'

/** The log page size, and the query field that asks for the entries after a revision. */
export const OPERATIONS_PAGE_SIZE = 100
export const AFTER_REVISION_QUERY = 'after'

export const healthResponseSchema = z.object({ status: z.literal('ok') })
export type HealthResponse = z.infer<typeof healthResponseSchema>

export const createFamilyInputSchema = familySettingsSchema.pick({
  name: true
})
export type CreateFamilyInput = z.infer<typeof createFamilyInputSchema>

/** A new family: the keeper keeps one link and shares the other. */
export const createdFamilySchema = z.object({
  familyId: familyIdSchema,
  familyKey: accessKeySchema,
  keeperKey: accessKeySchema
})
export type CreatedFamily = z.infer<typeof createdFamilySchema>

/** Edits made against the family as it stood at `baseRevision`, recorded as one entry of the log. */
export const recordOperationsInputSchema = z.object({
  author: authorSchema,
  baseRevision: z.int().min(0),
  operations: z.array(operationSchema).min(1)
})
export type RecordOperationsInput = z.infer<typeof recordOperationsInputSchema>

export const recordedOperationsSchema = z.object({ revision: z.int().min(1) })
export type RecordedOperations = z.infer<typeof recordedOperationsSchema>

export const changeLogPageSchema = z.object({
  entries: z.array(changeLogEntrySchema),
  /** Where the next page starts, `null` on the last one. */
  nextAfter: z.int().min(1).nullable()
})
export type ChangeLogPage = z.infer<typeof changeLogPageSchema>

/** Extra links a keeper hands out: a read-only one, or one for another keeper. The family link is replaced, not added. */
export const issueKeyInputSchema = z.object({
  role: z.enum(['reader', 'keeper'])
})
export type IssueKeyInput = z.infer<typeof issueKeyInputSchema>

export const keyListSchema = z.object({ keys: z.array(keyViewSchema) })
export type KeyList = z.infer<typeof keyListSchema>

export const apiErrorCodes = [
  'family_exists',
  'forbidden',
  'internal_error',
  'invalid_input',
  'last_keeper_key',
  'not_found',
  'photo_file_exists',
  'photo_too_large',
  'revision_conflict',
  'too_many_attempts',
  'unauthorized',
  'unsupported_image',
  ...OPERATION_REFUSALS
] as const
export type ApiErrorCode = (typeof apiErrorCodes)[number]

export const apiErrorResponseSchema = z.object({
  code: z.enum(apiErrorCodes),
  message: z.string()
})
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>
