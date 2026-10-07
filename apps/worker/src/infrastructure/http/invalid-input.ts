import { apiError } from './api-response'

/** The hook every `zValidator` takes: input its schema refuses answers `400 invalid_input`. */
export const invalidInput = (result: {
  error?: { message: string }
  success: boolean
}) =>
  result.success
    ? undefined
    : apiError('invalid_input', result.error?.message ?? 'Invalid input')
