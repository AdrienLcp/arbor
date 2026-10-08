import { describe, expect, it } from 'vitest'

import type { Union } from '@arbor/protocol/union'

import { unionUpdate } from './union-update'

const louisAndJeanne: Union = {
  end: null,
  id: 'louis-jeanne',
  kind: 'marriage',
  partnerIds: ['louis', 'jeanne'],
  start: {
    date: { point: { precision: 'year', year: 1931 }, qualifier: 'exact' },
    place: 'Quimper'
  }
}

const divorce: Union['end'] = {
  date: { point: { precision: 'year', year: 1948 }, qualifier: 'about' },
  kind: 'divorce',
  place: null
}

describe('unionUpdate', () => {
  it('records the end of a union, and only that', () => {
    expect(
      unionUpdate(louisAndJeanne, {
        end: divorce,
        kind: 'marriage',
        start: louisAndJeanne.start
      })
    ).toEqual({
      after: { end: divorce },
      before: { end: null },
      type: 'union.update',
      unionId: 'louis-jeanne'
    })
  })

  it('takes an ending back', () => {
    expect(
      unionUpdate({ ...louisAndJeanne, end: divorce }, { end: null })
    ).toMatchObject({ after: { end: null }, before: { end: divorce } })
  })

  it('sees nothing to save when the form changed nothing', () => {
    expect(
      unionUpdate(louisAndJeanne, {
        end: null,
        kind: 'marriage',
        start: louisAndJeanne.start
      })
    ).toBeNull()
  })
})
