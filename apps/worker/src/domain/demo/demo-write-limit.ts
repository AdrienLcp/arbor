/**
 * The edits the demo takes between two nightly resets. Every family shares the
 * account's free 100,000 rows written a day; the demo, open to anyone, must not
 * be able to spend them and lock the real families out until midnight UTC.
 */
export const DEMO_WRITES_PER_NIGHT = 500

const READ_METHODS = new Set(['GET', 'HEAD'])

export const isWriteRequest = (request: Request): boolean =>
  !READ_METHODS.has(request.method)

/** The demo's edits since its last reset, kept in its own storage so the reset wipes them too. */
export type DemoWriteCount = {
  add: () => void
  read: () => number
}
