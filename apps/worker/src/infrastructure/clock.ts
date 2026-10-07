/** The only reader of the wall clock: the server stamps every change, never the client. */
export const now = (): Temporal.Instant =>
  Temporal.Instant.fromEpochMilliseconds(Date.now())
