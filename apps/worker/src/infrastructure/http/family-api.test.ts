import { afterEach, describe, expect, it, vi } from 'vitest'

import { issuedKeySchema } from '@arbor/protocol/access'
import type { Author } from '@arbor/protocol/change-log'
import { familyResponseSchema } from '@arbor/protocol/family'
import type { Operation } from '@arbor/protocol/operation'
import type { Person } from '@arbor/protocol/person'
import {
  API_ROUTES,
  apiErrorResponseSchema,
  changeLogPageSchema,
  keyListSchema,
  pathFor
} from '@arbor/protocol/routes'

import { MAX_FAILED_KEY_CHECKS } from '@/domain/access/key-check-limit'

import { familyPath, openTestApi } from './api-test-harness'

const AUTHOR: Author = { kind: 'named', name: 'Mamie Jeanne' }

const personNamed = (id: string, fields: Partial<Person> = {}): Person => ({
  birth: null,
  birthSurname: null,
  death: null,
  givenNames: 'Jeanne',
  id,
  livingOverride: null,
  notes: '',
  portraitPhotoId: null,
  sex: 'female',
  surname: 'Morel',
  ...fields
})

const errorCodeOf = async (response: Response) =>
  apiErrorResponseSchema.parse(await response.json()).code

const familyWithOneEdit = async () => {
  const api = openTestApi()
  const family = await api.createFamily()
  const record = (operations: Operation[], baseRevision: number) =>
    api.call(familyPath(family.familyId, 'operations'), {
      body: { author: AUTHOR, baseRevision, operations },
      key: family.familyKey,
      method: 'POST'
    })
  return { api, family, record }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('[access] keys', () => {
  it('[access] creates a family whose keeper sees it, empty, at revision 0', async () => {
    const api = openTestApi()
    const family = await api.createFamily('Famille Bertin')

    const response = await api.call(familyPath(family.familyId), {
      key: family.keeperKey
    })

    expect(response.status).toBe(200)
    expect(familyResponseSchema.parse(await response.json())).toMatchObject({
      family: { persons: [] },
      revision: 0,
      role: 'keeper',
      settings: { hidesLivingFromReaders: true, name: 'Famille Bertin' }
    })
  })

  it('[access] refuses a request without a key, and a family that does not exist', async () => {
    const api = openTestApi()
    const family = await api.createFamily()

    expect((await api.call(familyPath(family.familyId))).status).toBe(401)
    expect(
      (
        await api.call(familyPath('AAAAAAAAAAAAAAAAAAAAAA'), {
          key: family.keeperKey
        })
      ).status
    ).toBe(404)
  })

  it('[access] keeps a contributor key off the keeper routes', async () => {
    const api = openTestApi()
    const family = await api.createFamily()

    const response = await api.call(familyPath(family.familyId, 'keys'), {
      key: family.familyKey
    })

    expect(response.status).toBe(403)
    expect(await errorCodeOf(response)).toBe('forbidden')
  })

  it('[access] keeps a reader key from editing', async () => {
    const { api, family } = await familyWithOneEdit()
    const issued = await api.call(familyPath(family.familyId, 'keys'), {
      body: { role: 'reader' },
      key: family.keeperKey,
      method: 'POST'
    })
    const reader = issuedKeySchema.parse(await issued.json())

    const response = await api.call(familyPath(family.familyId, 'operations'), {
      body: {
        author: AUTHOR,
        baseRevision: 0,
        operations: [{ person: personNamed('jeanne'), type: 'person.create' }]
      },
      key: reader.key,
      method: 'POST'
    })

    expect(response.status).toBe(403)
  })

  it('[access] stops the old family link the moment the keeper replaces it', async () => {
    const api = openTestApi()
    const family = await api.createFamily()

    const replaced = await api.call(familyPath(family.familyId, 'familyKey'), {
      key: family.keeperKey,
      method: 'POST'
    })
    const newKey = issuedKeySchema.parse(await replaced.json())

    const withOldKey = await api.call(familyPath(family.familyId), {
      key: family.familyKey
    })
    const withNewKey = await api.call(familyPath(family.familyId), {
      key: newKey.key
    })
    expect(withOldKey.status).toBe(401)
    expect(await errorCodeOf(withOldKey)).toBe('unauthorized')
    expect(withNewKey.status).toBe(200)
  })

  it('[access] never lets a key of one family into another', async () => {
    const api = openTestApi()
    const first = await api.createFamily('Famille Morel')
    const second = await api.createFamily('Famille Bertin')

    const response = await api.call(familyPath(second.familyId), {
      key: first.keeperKey
    })

    expect(response.status).toBe(401)
  })

  it('[access] refuses to revoke the last keeper key', async () => {
    const api = openTestApi()
    const family = await api.createFamily()
    const listed = await api.call(familyPath(family.familyId, 'keys'), {
      key: family.keeperKey
    })
    const { keys } = keyListSchema.parse(await listed.json())
    const keeperKeyId = keys.find((key) => key.role === 'keeper')?.id ?? ''

    const response = await api.call(
      pathFor(API_ROUTES.key, {
        familyId: family.familyId,
        keyId: keeperKeyId
      }),
      { key: family.keeperKey, method: 'DELETE' }
    )

    expect(response.status).toBe(409)
    expect(await errorCodeOf(response)).toBe('last_keeper_key')
  })

  it('[access] stops checking keys after too many wrong ones, until the window ends', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    const api = openTestApi()
    const family = await api.createFamily()
    const path = familyPath(family.familyId)

    for (let attempt = 0; attempt < MAX_FAILED_KEY_CHECKS; attempt++) {
      await api.call(path, { key: 'wrong-key-wrong-key-00' })
    }
    const lockedOut = await api.call(path, { key: family.keeperKey })
    vi.advanceTimersByTime(15 * 60 * 1000)
    const afterWindow = await api.call(path, { key: family.keeperKey })

    expect(lockedOut.status).toBe(429)
    expect(afterWindow.status).toBe(200)
  })
})

describe('[log] edits', () => {
  it('[log] records a batch as one entry and serves it back', async () => {
    const { api, family, record } = await familyWithOneEdit()

    const recorded = await record(
      [
        { person: personNamed('jeanne'), type: 'person.create' },
        {
          person: personNamed('rene', { givenNames: 'René' }),
          type: 'person.create'
        }
      ],
      0
    )
    const log = await api.call(familyPath(family.familyId, 'operations'), {
      key: family.familyKey
    })

    expect(recorded.status).toBe(201)
    expect(await recorded.json()).toEqual({ revision: 1 })
    const page = changeLogPageSchema.parse(await log.json())
    expect(page.nextAfter).toBeNull()
    expect(page.entries).toHaveLength(1)
    expect(page.entries[0]).toMatchObject({
      author: AUTHOR,
      operation: { type: 'group' },
      revision: 1
    })
  })

  it('[log] rejects a stale edit of a person binned since, as a conflict to reload', async () => {
    const { record } = await familyWithOneEdit()
    await record([{ person: personNamed('jeanne'), type: 'person.create' }], 0)
    await record([{ personId: 'jeanne', type: 'person.bin' }], 1)

    const staleEdit: Operation = {
      after: { notes: 'Née à Quimper' },
      before: { notes: '' },
      personId: 'jeanne',
      type: 'person.update'
    }
    const stale = await record([staleEdit], 1)
    const current = await record([staleEdit], 2)

    expect(stale.status).toBe(409)
    expect(await errorCodeOf(stale)).toBe('revision_conflict')
    expect(current.status).toBe(422)
    expect(await errorCodeOf(current)).toBe('person_binned')
  })

  it('[log] lets a stale edit of another field win, keeping what it replaced', async () => {
    const { api, family, record } = await familyWithOneEdit()
    await record([{ person: personNamed('jeanne'), type: 'person.create' }], 0)
    await record(
      [
        {
          after: { notes: 'Couturière' },
          before: { notes: '' },
          personId: 'jeanne',
          type: 'person.update'
        }
      ],
      1
    )

    const stale = await record(
      [
        {
          after: { notes: 'Institutrice' },
          before: { notes: '' },
          personId: 'jeanne',
          type: 'person.update'
        }
      ],
      1
    )
    const log = changeLogPageSchema.parse(
      await (
        await api.call(familyPath(family.familyId, 'operations'), {
          key: family.familyKey
        })
      ).json()
    )

    expect(stale.status).toBe(201)
    expect(log.entries.at(-1)?.operation).toMatchObject({
      after: { notes: 'Institutrice' },
      before: { notes: 'Couturière' }
    })
  })
})

describe('[privacy] the read-only link', () => {
  it('[privacy] hides a living person’s exact birth date, notes and photos', async () => {
    const { api, family, record } = await familyWithOneEdit()
    await record(
      [
        {
          person: personNamed('lucie', {
            birth: {
              date: {
                point: { day: 3, month: 5, precision: 'day', year: 1990 },
                qualifier: 'exact'
              },
              place: 'Nantes'
            },
            notes: 'Allergique aux arachides'
          }),
          type: 'person.create'
        },
        {
          photo: {
            caption: '',
            date: null,
            id: 'lucie-photo',
            personId: 'lucie'
          },
          type: 'photo.create'
        }
      ],
      0
    )
    const issued = await api.call(familyPath(family.familyId, 'keys'), {
      body: { role: 'reader' },
      key: family.keeperKey,
      method: 'POST'
    })
    const reader = issuedKeySchema.parse(await issued.json())

    const response = await api.call(familyPath(family.familyId), {
      key: reader.key
    })
    const seen = familyResponseSchema.parse(await response.json())

    expect(seen.family.persons[0]).toMatchObject({
      birth: {
        date: { point: { precision: 'year', year: 1990 } },
        place: 'Nantes'
      },
      notes: ''
    })
    expect(seen.family.photos).toEqual([])
  })
})

describe('[photos] images', () => {
  const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])

  const photoForm = (bytes: Uint8Array) => {
    const form = new FormData()
    form.set('full', new File([bytes], 'full.jpg'))
    form.set('thumbnail', new File([bytes], 'thumbnail.jpg'))
    return form
  }

  const familyWithPhoto = async () => {
    const setup = await familyWithOneEdit()
    await setup.record(
      [
        {
          photo: {
            caption: 'Mariage',
            date: null,
            id: 'wedding',
            personId: null
          },
          type: 'photo.create'
        }
      ],
      0
    )
    const photoPath = pathFor(API_ROUTES.photo, {
      familyId: setup.family.familyId,
      photoId: 'wedding'
    })
    return { ...setup, photoPath }
  }

  it('[photos] stores both sizes once and serves them privately', async () => {
    const { api, family, photoPath } = await familyWithPhoto()

    const uploaded = await api.call(photoPath, {
      body: photoForm(JPEG),
      key: family.familyKey,
      method: 'POST'
    })
    const again = await api.call(photoPath, {
      body: photoForm(JPEG),
      key: family.familyKey,
      method: 'POST'
    })
    const served = await api.call(`${photoPath}/thumbnail`, {
      key: family.familyKey
    })

    expect(uploaded.status).toBe(201)
    expect(again.status).toBe(409)
    expect(served.headers.get('Content-Type')).toBe('image/jpeg')
    expect(served.headers.get('Cache-Control')).toContain('private')
    expect(new Uint8Array(await served.arrayBuffer())).toEqual(JPEG)
  })

  it('[photos] refuses a file that is not an image, whatever its name says', async () => {
    const { api, family, photoPath } = await familyWithPhoto()

    const response = await api.call(photoPath, {
      body: photoForm(new TextEncoder().encode('<script>alert(1)</script>')),
      key: family.familyKey,
      method: 'POST'
    })

    expect(response.status).toBe(415)
  })
})
