import { describe, expect, it } from 'vitest'

import { ofName, thatName } from './of-name'

describe('[history] "of" a name', () => {
  it('[history] elides the French "de" before a vowel, an accent or an h', () => {
    expect(ofName('fr', 'Anne Morel')).toBe('d’Anne Morel')
    expect(ofName('fr', 'Émile Morel')).toBe('d’Émile Morel')
    expect(ofName('fr', 'Hélène Roux')).toBe('d’Hélène Roux')
  })

  it('[history] keeps the French "de" before a consonant', () => {
    expect(ofName('fr', 'Pierre Morel')).toBe('de Pierre Morel')
  })

  it('[history] elides the French "que" the same way', () => {
    expect(thatName('fr', 'Anne Morel')).toBe('qu’Anne Morel')
    expect(thatName('fr', 'Pierre Morel')).toBe('que Pierre Morel')
  })

  it('[history] writes "of" in English', () => {
    expect(ofName('en', 'Anne Morel')).toBe('of Anne Morel')
  })
})
