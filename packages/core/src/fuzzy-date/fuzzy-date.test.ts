import { describe, expect, it } from 'vitest'

import type { FuzzyDate } from '@arbor/protocol/fuzzy-date'

import { byEarliestPlausibleDay } from './earliest-plausible-day'
import { formatFuzzyDate } from './format-fuzzy-date'
import { parseFuzzyDate } from './parse-fuzzy-date'
import { isCertainlyBefore } from './possible-days'

const fuzzy = (text: string): FuzzyDate => {
  const date = parseFuzzyDate(text)
  if (date.status === 'failure') throw new Error(`${text}: ${date.error}`)
  return date.data
}

describe('[fuzzy-date] parsing', () => {
  it('[fuzzy-date] reads GEDCOM and ISO forms into the same date', () => {
    expect(fuzzy('2 MAR 1881')).toEqual(fuzzy('1881-03-02'))
    expect(fuzzy('abt  1880')).toEqual({
      point: { precision: 'year', year: 1880 },
      qualifier: 'about'
    })
    expect(fuzzy('BET 1930 AND MAR 1935')).toEqual({
      from: { precision: 'year', year: 1930 },
      qualifier: 'between',
      to: { month: 3, precision: 'month', year: 1935 }
    })
  })

  it('[fuzzy-date] refuses a day the month does not have', () => {
    expect(parseFuzzyDate('1900-02-29')).toEqual({
      error: 'impossible_date',
      status: 'failure'
    })
    expect(parseFuzzyDate('29 FEB 1904').status).toBe('success')
  })

  it('[fuzzy-date] refuses a range that ends before it starts', () => {
    expect(parseFuzzyDate('BET 1935 AND 1930')).toEqual({
      error: 'reversed_range',
      status: 'failure'
    })
  })

  it('[fuzzy-date] refuses what it cannot read', () => {
    expect(parseFuzzyDate('FROM 1900 TO 1910').status).toBe('failure')
    expect(parseFuzzyDate('2 1881').status).toBe('failure')
    expect(parseFuzzyDate('XYZ 1881').status).toBe('failure')
  })
})

describe('[fuzzy-date] sorting', () => {
  it('[fuzzy-date] sorts "vers 1880" before 1881-03-02', () => {
    expect(
      byEarliestPlausibleDay(fuzzy('ABT 1880'), fuzzy('1881-03-02'))
    ).toBeLessThan(0)
  })

  it('[fuzzy-date] sorts "before" just ahead of the date it bounds, "after" just behind', () => {
    const sorted = [
      fuzzy('AFT 1902'),
      fuzzy('1902'),
      fuzzy('BEF 1902'),
      fuzzy('31 DEC 1902')
    ].toSorted(byEarliestPlausibleDay)
    expect(sorted.map((date) => formatFuzzyDate(date, 'en'))).toEqual([
      'before 1902',
      '1902',
      'December 31, 1902',
      'after 1902'
    ])
  })
})

describe('[fuzzy-date] formatting', () => {
  it('[fuzzy-date] says the qualifier in French', () => {
    expect(formatFuzzyDate(fuzzy('BET 1930 AND 1935'), 'fr')).toBe(
      'entre 1930 et 1935'
    )
    expect(formatFuzzyDate(fuzzy('ABT 1880'), 'fr')).toBe('vers 1880')
    expect(formatFuzzyDate(fuzzy('BEF MAR 1902'), 'fr')).toBe('avant mars 1902')
    expect(formatFuzzyDate(fuzzy('2 MAR 1881'), 'fr')).toBe('2 mars 1881')
  })

  it('[fuzzy-date] says the qualifier in English', () => {
    expect(formatFuzzyDate(fuzzy('AFT 1902'), 'en')).toBe('after 1902')
    expect(formatFuzzyDate(fuzzy('BET 1930 AND 1935'), 'en')).toBe(
      'between 1930 and 1935'
    )
  })
})

describe('[fuzzy-date] certainty', () => {
  it('[fuzzy-date] is certain only when no reading of the two dates overlaps', () => {
    const certainlyBefore = (subject: string, reference: string) =>
      isCertainlyBefore({
        reference: fuzzy(reference),
        subject: fuzzy(subject)
      })

    expect(certainlyBefore('1879', '1883-06-14')).toBe(true)
    expect(certainlyBefore('ABT 1882', '1883-06-14')).toBe(false)
    expect(certainlyBefore('1880', 'ABT 1882')).toBe(false)
    expect(certainlyBefore('BEF 1880', '1883')).toBe(true)
    expect(certainlyBefore('AFT 1850', '1883')).toBe(false)
  })
})
