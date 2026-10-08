import { describe, expect, it } from 'vitest'

import { lifePlaces } from './life-places'

const at = (place: string | null) => ({ date: null, place })

describe('[print] places on a sticker', () => {
  it('[print] joins the birth place and the death place', () => {
    expect(lifePlaces({ birth: at('Lyon'), death: at('Paris') })).toBe(
      'Lyon · † Paris'
    )
  })

  it('[print] prints the one place known', () => {
    expect(lifePlaces({ birth: at('Lyon'), death: null })).toBe('Lyon')
    expect(lifePlaces({ birth: null, death: at('Paris') })).toBe('† Paris')
  })

  it('[print] prints nothing for blank places', () => {
    expect(lifePlaces({ birth: at('  '), death: at(null) })).toBe('')
  })
})
