import { describe, expect, it } from 'vitest'

import { warningsAbout } from './person-warnings'

describe('warningsAbout', () => {
  const warnings = [
    { childId: 'anne', kind: 'born_before_parent', parentId: 'pierre' },
    { kind: 'death_before_birth', personId: 'louis' }
  ] as const

  it('tells a child they are dated before their parent', () => {
    expect(warningsAbout(warnings, 'anne')).toEqual([
      { kind: 'born_before_parent', parentId: 'pierre' }
    ])
  })

  it('tells the parent the same warning from their side', () => {
    expect(warningsAbout(warnings, 'pierre')).toEqual([
      { childId: 'anne', kind: 'born_after_child' }
    ])
  })

  it('keeps a death dated before birth for its person only', () => {
    expect(warningsAbout(warnings, 'louis')).toEqual([
      { kind: 'death_before_birth' }
    ])
    expect(warningsAbout(warnings, 'anne')).toHaveLength(1)
  })
})
