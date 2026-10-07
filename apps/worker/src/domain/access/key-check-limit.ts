/** Wrong keys tried against one family since `startedAt`. */
export type KeyCheckWindow = { failures: number; startedAt: Temporal.Instant }

/** Past this many wrong keys in one window, the family stops checking keys until the window ends. */
export const MAX_FAILED_KEY_CHECKS = 20
const KEY_CHECK_WINDOW = Temporal.Duration.from({ minutes: 15 })

const isWithinWindow = (window: KeyCheckWindow, now: Temporal.Instant) =>
  Temporal.Instant.compare(now, window.startedAt.add(KEY_CHECK_WINDOW)) < 0

/**
 * Whether key checks are suspended: with 128-bit keys guessing is already
 * hopeless, and this keeps a flood of guesses from costing the free plan.
 */
export const isLockedOut = (
  window: KeyCheckWindow | null,
  now: Temporal.Instant
): boolean =>
  window !== null &&
  isWithinWindow(window, now) &&
  window.failures >= MAX_FAILED_KEY_CHECKS

/** The window after one more wrong key: a new one when the last has ended. */
export const withFailedCheck = (
  window: KeyCheckWindow | null,
  now: Temporal.Instant
): KeyCheckWindow =>
  window !== null && isWithinWindow(window, now)
    ? { failures: window.failures + 1, startedAt: window.startedAt }
    : { failures: 1, startedAt: now }
