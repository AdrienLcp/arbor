import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { familyLinkFor } from '@arbor/protocol/family-link'
import { PHOTO_VARIANTS } from '@arbor/protocol/photo-file'
import {
  API_ROUTES,
  AUTHORIZATION_SCHEME,
  apiErrorResponseSchema,
  createdFamilySchema,
  pathFor,
  type RecordOperationsInput,
  recordedOperationsSchema
} from '@arbor/protocol/routes'

import {
  DEMO_FAMILY_AUTHOR,
  DEMO_FAMILY_NAME,
  DEMO_FAMILY_OPERATIONS
} from '@arbor/core/family/demo-family'

/** Creates a family from the demo fixture on a running worker, uploads its photos' images, and prints its links. Usage: `pnpm seed [origin]`. */

const DEFAULT_ORIGIN = 'http://localhost:8790'

const origin = process.argv[2] ?? DEFAULT_ORIGIN

const DEMO_PHOTOS_FOLDER = join(
  import.meta.dirname,
  '../src/infrastructure/demo-photos'
)

const authorizationFor = (key?: string): Record<string, string> =>
  key === undefined ? {} : { Authorization: `${AUTHORIZATION_SCHEME} ${key}` }

const send = async (path: string, init: RequestInit) => {
  const response = await fetch(new URL(path, origin), {
    ...init,
    method: 'POST'
  })
  const answer: unknown = await response.json()
  if (!response.ok) {
    const error = apiErrorResponseSchema.safeParse(answer)
    throw new Error(
      `${path} answered ${response.status}: ${error.success ? error.data.code : JSON.stringify(answer)}`
    )
  }
  return answer
}

const post = (path: string, body: unknown, key?: string) =>
  send(path, {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...authorizationFor(key) }
  })

const uploadDemoPhoto = async (
  familyId: string,
  photoId: string,
  key: string
) => {
  const form = new FormData()
  for (const variant of PHOTO_VARIANTS) {
    const image = await readFile(
      join(DEMO_PHOTOS_FOLDER, `${photoId}-${variant}.webp`)
    )
    form.set(variant, new Blob([image], { type: 'image/webp' }), variant)
  }
  await send(pathFor(API_ROUTES.photo, { familyId, photoId }), {
    body: form,
    headers: authorizationFor(key)
  })
}

const family = createdFamilySchema.parse(
  await post(API_ROUTES.families, { name: DEMO_FAMILY_NAME })
)

let revision = 0
for (const operation of DEMO_FAMILY_OPERATIONS) {
  const input: RecordOperationsInput = {
    author: DEMO_FAMILY_AUTHOR,
    baseRevision: revision,
    operations: [operation]
  }
  const recorded = recordedOperationsSchema.parse(
    await post(
      pathFor(API_ROUTES.operations, { familyId: family.familyId }),
      input,
      family.familyKey
    )
  )
  revision = recorded.revision
}

for (const operation of DEMO_FAMILY_OPERATIONS) {
  if (operation.type === 'photo.create') {
    await uploadDemoPhoto(family.familyId, operation.photo.id, family.familyKey)
  }
}

console.info(`${DEMO_FAMILY_NAME}: ${revision} changes recorded`)
console.info(
  `Family link: ${familyLinkFor({ familyId: family.familyId, key: family.familyKey, origin })}`
)
console.info(
  `Keeper link: ${familyLinkFor({ familyId: family.familyId, key: family.keeperKey, origin })}`
)
