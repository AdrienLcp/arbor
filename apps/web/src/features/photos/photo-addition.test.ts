import { describe, expect, it } from 'vitest'

import type { Person } from '@arbor/protocol/person'
import type { Photo } from '@arbor/protocol/photo'

import {
  photoAdditionOperations,
  photoWithdrawalOperations,
  portraitOperation
} from './photo-addition'

const jeanne: Person = {
  birth: null,
  birthSurname: null,
  death: null,
  givenNames: 'Jeanne',
  id: 'jeanne',
  livingOverride: null,
  notes: '',
  portraitPhotoId: 'old-portrait',
  sex: 'female',
  surname: 'Morel'
}

const wedding: Photo = {
  caption: 'Le mariage, 1931',
  date: null,
  id: 'wedding',
  personId: 'jeanne'
}

describe('photoAdditionOperations', () => {
  it('records the photo before the portrait that points at it', () => {
    expect(
      photoAdditionOperations({
        asPortrait: true,
        person: jeanne,
        photo: wedding
      })
    ).toEqual([
      { photo: wedding, type: 'photo.create' },
      {
        after: { portraitPhotoId: 'wedding' },
        before: { portraitPhotoId: 'old-portrait' },
        personId: 'jeanne',
        type: 'person.update'
      }
    ])
  })

  it('leaves the portrait alone for a photo kept aside', () => {
    expect(
      photoAdditionOperations({
        asPortrait: false,
        person: jeanne,
        photo: wedding
      })
    ).toEqual([{ photo: wedding, type: 'photo.create' }])
  })
})

describe('photoWithdrawalOperations', () => {
  it('gives the old portrait back before removing the photo', () => {
    expect(
      photoWithdrawalOperations({
        asPortrait: true,
        person: jeanne,
        photo: wedding
      })
    ).toEqual([
      {
        after: { portraitPhotoId: 'old-portrait' },
        before: { portraitPhotoId: 'wedding' },
        personId: 'jeanne',
        type: 'person.update'
      },
      { photo: wedding, type: 'photo.remove' }
    ])
  })
})

describe('portraitOperation', () => {
  it('changes nothing for the photo already on the sticker', () => {
    expect(portraitOperation(jeanne, 'old-portrait')).toBeNull()
  })
})
