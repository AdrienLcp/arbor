import { describe, expect, it } from 'vitest'

import type { Occurrence } from '@arbor/protocol/occurrence'

import { lifeYears } from './life-years'

const inYear = (year: number): Occurrence => ({
  date: { point: { precision: 'year', year }, qualifier: 'exact' },
  place: null
})

const UNDATED: Occurrence = { date: null, place: null }

const NO_BREAK_SPACE = ' '

describe('life years', () => {
  it('[life-years] prints the birth year alone for a living person', () => {
    expect(lifeYears({ birth: inYear(1990), death: null }, true)).toBe('1990')
  })

  it('[life-years] marks the death year with a cross, breakable only after the dash', () => {
    expect(lifeYears({ birth: inYear(1932), death: inYear(2019) }, false)).toBe(
      `1932${NO_BREAK_SPACE}– †${NO_BREAK_SPACE}2019`
    )
  })

  it('[life-years] marks a death even when nothing about it is dated', () => {
    expect(lifeYears({ birth: null, death: UNDATED }, false)).toBe('†')
  })

  it('[life-years] reads a range from its first year', () => {
    const between: Occurrence = {
      date: {
        from: { precision: 'year', year: 1930 },
        qualifier: 'between',
        to: { precision: 'year', year: 1935 }
      },
      place: null
    }

    expect(lifeYears({ birth: between, death: null }, true)).toBe('1930')
  })
})
