import {
  OPERATION_REFUSALS,
  type OperationRefusal
} from '@arbor/protocol/operation-refusal'
import type { ApiErrorCode, ApiErrorResponse } from '@arbor/protocol/routes'

/** A family's data is never kept by a cache along the way. */
const NOT_STORED = { 'Cache-Control': 'no-store' }

const OPERATION_REFUSAL_SET = new Set<string>(OPERATION_REFUSALS)

const isOperationRefusal = (code: ApiErrorCode): code is OperationRefusal =>
  OPERATION_REFUSAL_SET.has(code)

const API_ERROR_STATUS = {
  family_exists: 409,
  forbidden: 403,
  internal_error: 500,
  invalid_input: 400,
  last_keeper_key: 409,
  not_found: 404,
  photo_file_exists: 409,
  photo_too_large: 413,
  revision_conflict: 409,
  too_many_attempts: 429,
  unauthorized: 401,
  unsupported_image: 415
} as const satisfies Record<Exclude<ApiErrorCode, OperationRefusal>, number>

/** An edit that breaks a rule of the family is well formed but cannot be applied. */
const OPERATION_REFUSAL_STATUS = 422

const statusOf = (code: ApiErrorCode): number =>
  isOperationRefusal(code) ? OPERATION_REFUSAL_STATUS : API_ERROR_STATUS[code]

/** A coded failure: `code` is the contract the client translates, `message` is English for a log. */
export const apiError = (code: ApiErrorCode, message: string): Response =>
  Response.json({ code, message } satisfies ApiErrorResponse, {
    headers: NOT_STORED,
    status: statusOf(code)
  })

export const apiJson = (body: unknown, status = 200): Response =>
  Response.json(body, { headers: NOT_STORED, status })
