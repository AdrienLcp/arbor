import { describe, expect, it } from 'vitest'

import {
  type DateDraft,
  dateDraftOf,
  EMPTY_DATE_DRAFT,
  fuzzyDateOf
} from './fuzzy-date-draft'

const draft = (
  from: Partial<DateDraft['from']>,
  qualifier: DateDraft['qualifier'] = 'exact',
  to: Partial<DateDraft['to']> = {}
): DateDraft => ({
  from: { ...EMPTY_DATE_DRAFT.from, ...from },
  qualifier,
  to: { ...EMPTY_DATE_DRAFT.to, ...to }
})

describe('fuzzyDateOf', () => {
  it('keeps empty fields as an unknown date', () => {
    expect(fuzzyDateOf(EMPTY_DATE_DRAFT)).toEqual({
      data: null,
      status: 'success'
    })
  })

  it('accepts a year alone', () => {
    expect(fuzzyDateOf(draft({ year: '1880' }, 'about'))).toEqual({
      data: { point: { precision: 'year', year: 1880 }, qualifier: 'about' },
      status: 'success'
    })
  })

  it('reads a full day', () => {
    expect(
      fuzzyDateOf(draft({ day: ' 2 ', month: '3', year: '1881' }))
    ).toEqual({
      data: {
        point: { day: 2, month: 3, precision: 'day', year: 1881 },
        qualifier: 'exact'
      },
      status: 'success'
    })
  })

  it('asks for the year when only a day and a month are given', () => {
    expect(fuzzyDateOf(draft({ day: '2', month: '3' }))).toEqual({
      error: 'year_missing',
      status: 'failure'
    })
  })

  it('refuses a day the month does not have', () => {
    expect(fuzzyDateOf(draft({ day: '31', month: '2', year: '1900' }))).toEqual(
      { error: 'impossible_date', status: 'failure' }
    )
  })

  it('refuses a day without its month', () => {
    expect(fuzzyDateOf(draft({ day: '12', year: '1900' }))).toEqual({
      error: 'impossible_date',
      status: 'failure'
    })
  })

  it('reads a span between two years', () => {
    expect(
      fuzzyDateOf(draft({ year: '1930' }, 'between', { year: '1935' }))
    ).toEqual({
      data: {
        from: { precision: 'year', year: 1930 },
        qualifier: 'between',
        to: { precision: 'year', year: 1935 }
      },
      status: 'success'
    })
  })

  it('asks for the end of a span', () => {
    expect(fuzzyDateOf(draft({ year: '1930' }, 'between'))).toEqual({
      error: 'range_end_missing',
      status: 'failure'
    })
  })

  it('refuses a span that ends before it starts', () => {
    expect(
      fuzzyDateOf(draft({ year: '1935' }, 'between', { year: '1930' }))
    ).toEqual({ error: 'reversed_range', status: 'failure' })
  })
})

describe('dateDraftOf', () => {
  it('gives back the fields a recorded date was typed in', () => {
    const recorded = draft({ month: '7', year: '1956' }, 'before')
    const date = fuzzyDateOf(recorded)
    expect(date.status === 'success' && dateDraftOf(date.data)).toEqual(
      recorded
    )
  })
})
