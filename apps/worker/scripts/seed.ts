import { familyLinkFor } from '@arbor/protocol/family-link'
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

/** Creates a family from the demo fixture on a running worker and prints its links. Usage: `pnpm seed [origin]`. */

const DEFAULT_ORIGIN = 'http://localhost:8790'

const origin = process.argv[2] ?? DEFAULT_ORIGIN

const post = async (path: string, body: unknown, key?: string) => {
  const response = await fetch(new URL(path, origin), {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...(key === undefined
        ? {}
        : { Authorization: `${AUTHORIZATION_SCHEME} ${key}` })
    },
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

console.info(`${DEMO_FAMILY_NAME}: ${revision} changes recorded`)
console.info(
  `Family link: ${familyLinkFor({ familyId: family.familyId, key: family.familyKey, origin })}`
)
console.info(
  `Keeper link: ${familyLinkFor({ familyId: family.familyId, key: family.keeperKey, origin })}`
)
