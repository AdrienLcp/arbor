import { describe, expect, it } from 'vitest'

import { scannableSegmentsOf } from './scannable-link'

describe('scannableSegmentsOf', () => {
  it('[links] puts a family link in capitals, its fragment mark apart', () => {
    expect(
      scannableSegmentsOf('https://arbor.adrienlcp.com/f/abc123#key456')
    ).toEqual(['HTTPS://ARBOR.ADRIENLCP.COM/F/ABC123', '#', 'KEY456'])
  })

  it('[links] keeps a link without a fragment in one segment', () => {
    expect(scannableSegmentsOf('https://arbor.adrienlcp.com/f/abc123')).toEqual(
      ['HTTPS://ARBOR.ADRIENLCP.COM/F/ABC123']
    )
  })
})
