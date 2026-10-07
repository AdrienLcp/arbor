import { z } from 'zod'

import { OPERATION_REFUSALS } from './operation-refusal'

export const API_PREFIX = '/api'

/** Every path either end names: the worker matches it, the client calls it. */
export const API_ROUTES = {
  health: `${API_PREFIX}/health`
} as const

export const healthResponseSchema = z.object({ status: z.literal('ok') })
export type HealthResponse = z.infer<typeof healthResponseSchema>

export const apiErrorCodes = ['not_found', ...OPERATION_REFUSALS] as const
export const apiErrorResponseSchema = z.object({
  code: z.enum(apiErrorCodes),
  message: z.string()
})
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>
