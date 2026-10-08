import { describe, expect, it } from 'vitest'

import { DEMO_FAMILY_ID, DEMO_FAMILY_KEY } from '@arbor/protocol/demo-family'

import {
  afterAccepted,
  afterRefused,
  keysToTry,
  keysToTryFor,
  NO_FAMILY_ACCESS,
  withReceivedKey
} from './family-access'

const FAMILY_KEY = 'family-key-aaaaaaaaaaa'
const KEEPER_KEY = 'keeper-key-aaaaaaaaaaa'
const READER_KEY = 'reader-key-aaaaaaaaaaa'
const NEW_FAMILY_KEY = 'new-family-key-aaaaaaa'

describe('family access', () => {
  it('[family-access] tries a link just received before the keys it already holds, most powerful first', () => {
    const access = withReceivedKey(
      {
        ...NO_FAMILY_ACCESS,
        keys: {
          contributor: FAMILY_KEY,
          keeper: KEEPER_KEY,
          reader: READER_KEY
        }
      },
      NEW_FAMILY_KEY
    )

    expect(keysToTry(access)).toEqual([
      NEW_FAMILY_KEY,
      KEEPER_KEY,
      FAMILY_KEY,
      READER_KEY
    ])
  })

  it('[family-access] keeps the keeper key when the keeper opens the family link', () => {
    const keeper = { ...NO_FAMILY_ACCESS, keys: { keeper: KEEPER_KEY } }
    const opened = withReceivedKey(keeper, FAMILY_KEY)

    const accepted = afterAccepted(opened, {
      key: FAMILY_KEY,
      role: 'contributor'
    })

    expect(accepted.keys).toEqual({
      contributor: FAMILY_KEY,
      keeper: KEEPER_KEY
    })
    expect(accepted.unverifiedKey).toBeNull()
    expect(keysToTry(accepted)[0]).toBe(KEEPER_KEY)
  })

  it('[family-access] does not try twice a link it already holds', () => {
    const access = { ...NO_FAMILY_ACCESS, keys: { contributor: FAMILY_KEY } }

    expect(withReceivedKey(access, FAMILY_KEY)).toBe(access)
    expect(keysToTry(withReceivedKey(access, FAMILY_KEY))).toEqual([FAMILY_KEY])
  })

  it('[family-access] forgets a replaced key and keeps the others', () => {
    const access = {
      ...NO_FAMILY_ACCESS,
      keys: { contributor: FAMILY_KEY, keeper: KEEPER_KEY }
    }

    expect(afterRefused(access, FAMILY_KEY).keys).toEqual({
      keeper: KEEPER_KEY
    })
  })

  it('[family-access] forgets a received link the family refused', () => {
    const access = withReceivedKey(NO_FAMILY_ACCESS, FAMILY_KEY)

    expect(keysToTry(afterRefused(access, FAMILY_KEY))).toEqual([])
  })

  it('[family-access] opens the demo by its address alone, with its public key', () => {
    expect(keysToTryFor(DEMO_FAMILY_ID, NO_FAMILY_ACCESS)).toEqual([
      DEMO_FAMILY_KEY
    ])
    expect(keysToTryFor('other-family-aaaaaaaaa', NO_FAMILY_ACCESS)).toEqual([])
  })
})
