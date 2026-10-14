import { describe, expect, it } from 'vitest'

import { isFamilyNameConfirmed } from './family-name-confirmation'

const NAME = 'Famille Lefèvre'

describe('[deletion] confirming the family name', () => {
  it('[deletion] accepts the name whatever its case, accents or spacing', () => {
    expect(
      isFamilyNameConfirmed({ name: NAME, typed: 'Famille Lefèvre' })
    ).toBe(true)
    expect(
      isFamilyNameConfirmed({ name: NAME, typed: 'famille lefevre' })
    ).toBe(true)
    expect(
      isFamilyNameConfirmed({ name: NAME, typed: '  Famille   Lefèvre ' })
    ).toBe(true)
  })

  it('[deletion] refuses another name, a part of it, or nothing', () => {
    expect(
      isFamilyNameConfirmed({ name: NAME, typed: 'Famille Lefèbvre' })
    ).toBe(false)
    expect(isFamilyNameConfirmed({ name: NAME, typed: 'Lefèvre' })).toBe(false)
    expect(isFamilyNameConfirmed({ name: NAME, typed: '   ' })).toBe(false)
  })
})
