import { describe, expect, it } from 'vitest'

import { receivedLinkInText } from './received-link'

const FAMILY_ID = 'family-id-aaaaaaaaaaaa'
const KEY = 'family-key-aaaaaaaaaaa'
const LINK = `https://arbor.adrienlcp.com/f/${FAMILY_ID}#${KEY}`

describe('received link', () => {
  it('[received-link] reads a family link pasted alone', () => {
    expect(receivedLinkInText(LINK)).toEqual({ familyId: FAMILY_ID, key: KEY })
  })

  it('[received-link] finds the link inside the whole message it came in', () => {
    const message = `Coucou ! Voici l’arbre de la famille : ${LINK}.\nBisous`

    expect(receivedLinkInText(message)).toEqual({
      familyId: FAMILY_ID,
      key: KEY
    })
  })

  it('[received-link] reads a link pasted without its https://', () => {
    expect(
      receivedLinkInText(`arbor.adrienlcp.com/f/${FAMILY_ID}#${KEY}`)
    ).toEqual({ familyId: FAMILY_ID, key: KEY })
  })

  it('[received-link] refuses a family address that lost its key', () => {
    expect(
      receivedLinkInText(`https://arbor.adrienlcp.com/f/${FAMILY_ID}`)
    ).toBeNull()
  })

  it('[received-link] refuses text with no family link in it', () => {
    expect(receivedLinkInText('https://example.com/ et du texte')).toBeNull()
  })
})
