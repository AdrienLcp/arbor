import { Result } from '@adrienlcp/result'
import { z } from 'zod'

import {
  type AccessKey,
  type FamilyId,
  type IssuedKey,
  issuedKeySchema,
  type KeyId,
  type KeyView,
  type Role
} from '@arbor/protocol/access'
import {
  type FamilyResponse,
  type FamilySettings,
  familyResponseSchema,
  familySettingsSchema
} from '@arbor/protocol/family'
import {
  API_ROUTES,
  type ApiErrorCode,
  AUTHORIZATION_SCHEME,
  apiErrorResponseSchema,
  type CreatedFamily,
  type CreateFamilyInput,
  createdFamilySchema,
  keyListSchema,
  pathFor,
  type RecordedOperations,
  type RecordOperationsInput,
  recordedOperationsSchema,
  type StorageUsage,
  storageUsageSchema,
  type UpdateFamilySettingsInput
} from '@arbor/protocol/routes'

/** Why a call to the API gave nothing back: the server's own code, no answer at all, or a caller that stopped waiting. */
export type ApiFailure = ApiErrorCode | 'aborted' | 'network'

type ApiResult<T> = Promise<Result<T, ApiFailure>>

/** Who is asking: the family, and the key of the link it was opened with. */
export type FamilyAccess = {
  familyId: FamilyId
  key: AccessKey
}

type ApiCall<T> = {
  access?: AccessKey
  body?: unknown
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST'
  path: string
  schema: z.ZodType<T>
  signal: AbortSignal | undefined
}

const headersFor = ({
  access,
  body
}: Pick<ApiCall<unknown>, 'access' | 'body'>): Headers => {
  const headers = new Headers()

  if (access !== undefined) {
    headers.set('Authorization', `${AUTHORIZATION_SCHEME} ${access}`)
  }

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  return headers
}

/** A failed answer carries its code; one that does not is the server breaking its contract. */
const failureOf = async (response: Response): Promise<ApiErrorCode> => {
  const failure = apiErrorResponseSchema.safeParse(
    await response.json().catch(() => null)
  )

  return failure.success ? failure.data.code : 'internal_error'
}

const callApi = async <T>({
  access,
  body,
  method = 'GET',
  path,
  schema,
  signal
}: ApiCall<T>): ApiResult<T> => {
  try {
    const response = await fetch(path, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: headersFor({ access, body }),
      method,
      signal
    })

    if (!response.ok) {
      return Result.failure(await failureOf(response))
    }

    const answer = schema.safeParse(await response.json())

    return answer.success
      ? Result.success(answer.data)
      : Result.failure('internal_error')
  } catch {
    return Result.failure(signal?.aborted === true ? 'aborted' : 'network')
  }
}

export const createFamily = ({
  name,
  signal
}: CreateFamilyInput & { signal?: AbortSignal }): ApiResult<CreatedFamily> =>
  callApi({
    body: { name } satisfies CreateFamilyInput,
    method: 'POST',
    path: API_ROUTES.families,
    schema: createdFamilySchema,
    signal
  })

export const fetchFamily = ({
  familyId,
  key,
  signal
}: FamilyAccess & { signal?: AbortSignal }): ApiResult<FamilyResponse> =>
  callApi({
    access: key,
    path: pathFor(API_ROUTES.family, { familyId }),
    schema: familyResponseSchema,
    signal
  })

export const recordOperations = ({
  familyId,
  input,
  key,
  signal
}: FamilyAccess & {
  input: RecordOperationsInput
  signal?: AbortSignal
}): ApiResult<RecordedOperations> =>
  callApi({
    access: key,
    body: input,
    method: 'POST',
    path: pathFor(API_ROUTES.operations, { familyId }),
    schema: recordedOperationsSchema,
    signal
  })

export const listKeys = ({
  familyId,
  key,
  signal
}: FamilyAccess & { signal?: AbortSignal }): ApiResult<KeyView[]> =>
  callApi({
    access: key,
    path: pathFor(API_ROUTES.keys, { familyId }),
    schema: keyListSchema.transform((list) => list.keys),
    signal
  })

/** A new read-only link, or a link for another keeper. */
export const issueKey = ({
  familyId,
  key,
  role,
  signal
}: FamilyAccess & {
  role: Exclude<Role, 'contributor'>
  signal?: AbortSignal
}): ApiResult<IssuedKey> =>
  callApi({
    access: key,
    body: { role },
    method: 'POST',
    path: pathFor(API_ROUTES.keys, { familyId }),
    schema: issuedKeySchema,
    signal
  })

export const revokeKey = ({
  familyId,
  key,
  keyId,
  signal
}: FamilyAccess & { keyId: KeyId; signal?: AbortSignal }): ApiResult<void> =>
  callApi({
    access: key,
    method: 'DELETE',
    path: pathFor(API_ROUTES.key, { familyId, keyId }),
    schema: z.unknown().transform(() => undefined),
    signal
  })

/** A new family link: whoever holds the old one is locked out until they receive this one. */
export const replaceFamilyKey = ({
  familyId,
  key,
  signal
}: FamilyAccess & { signal?: AbortSignal }): ApiResult<IssuedKey> =>
  callApi({
    access: key,
    method: 'POST',
    path: pathFor(API_ROUTES.familyKey, { familyId }),
    schema: issuedKeySchema,
    signal
  })

export const updateSettings = ({
  familyId,
  key,
  settings,
  signal
}: FamilyAccess & {
  settings: UpdateFamilySettingsInput
  signal?: AbortSignal
}): ApiResult<FamilySettings> =>
  callApi({
    access: key,
    body: settings,
    method: 'PATCH',
    path: pathFor(API_ROUTES.settings, { familyId }),
    schema: familySettingsSchema,
    signal
  })

export const readUsage = ({
  familyId,
  key,
  signal
}: FamilyAccess & { signal?: AbortSignal }): ApiResult<StorageUsage> =>
  callApi({
    access: key,
    path: pathFor(API_ROUTES.usage, { familyId }),
    schema: storageUsageSchema,
    signal
  })
