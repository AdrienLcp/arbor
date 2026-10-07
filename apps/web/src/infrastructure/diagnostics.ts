import type { Result } from '@adrienlcp/result'

/** Reports a failure the app falls back from, so it shows in the console instead of vanishing. */
export const warnOnFailure = <T, E>(
  outcome: Result<T, E>,
  what: string
): void => {
  if (outcome.status === 'failure') {
    console.warn(`${what} failed:`, outcome.error)
  }
}
