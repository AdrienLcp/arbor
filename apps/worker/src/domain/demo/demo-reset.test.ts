import { describe, expect, it } from 'vitest'

import { nextDemoResetAfter } from './demo-reset'

const resetAfter = (moment: string) =>
  nextDemoResetAfter(Temporal.Instant.from(moment)).toString()

describe('[demo] nightly reset', () => {
  it('[demo] starts over at 3 a.m. in Paris the same night, before it', () => {
    expect(resetAfter('2026-10-08T00:30:00Z')).toBe('2026-10-08T01:00:00Z')
  })

  it('[demo] waits for the next night once 3 a.m. has passed, or is now', () => {
    expect(resetAfter('2026-10-08T18:00:00Z')).toBe('2026-10-09T01:00:00Z')
    expect(resetAfter('2026-10-08T01:00:00Z')).toBe('2026-10-09T01:00:00Z')
  })

  it('[demo] follows Paris onto winter time', () => {
    expect(resetAfter('2026-10-25T12:00:00Z')).toBe('2026-10-26T02:00:00Z')
  })
})
