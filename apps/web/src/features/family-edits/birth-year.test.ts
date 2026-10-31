import { describe, expect, it } from 'vitest'

import { birthOfYear } from './birth-year'

describe('birthOfYear', () => {
  it('reads nothing typed as no birth', () => {
    const birth = birthOfYear('  ')
    expect(birth.status === 'success' && birth.data).toBeNull()
  })

  it('reads a year as a birth that year', () => {
    const birth = birthOfYear(' 1936 ')
    expect(birth.status === 'success' && birth.data?.date).toEqual({
      point: { precision: 'year', year: 1936 },
      qualifier: 'exact'
    })
  })

  it('refuses anything else', () => {
    expect(birthOfYear('vers 1936').status).toBe('failure')
  })
})
