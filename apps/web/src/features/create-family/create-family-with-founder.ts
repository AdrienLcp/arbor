import { Result } from '@adrienlcp/result'

import type { FamilyId } from '@arbor/protocol/access'
import type { Person } from '@arbor/protocol/person'

import { rememberFamily } from '@/features/family-access/remembered-families'
import {
  type ApiFailure,
  createFamily,
  recordOperations
} from '@/infrastructure/api/family-api'
import { warnOnFailure } from '@/infrastructure/diagnostics'
import { newEntityId } from '@/infrastructure/ids'

export type Founder = {
  givenNames: string
  surname: string
}

/** A brand-new family's log starts empty: the founder is its first entry. */
const EMPTY_LOG_REVISION = 0

const founderPerson = ({ givenNames, surname }: Founder): Person => ({
  birth: null,
  birthSurname: null,
  death: null,
  givenNames,
  id: newEntityId(),
  livingOverride: null,
  notes: '',
  portraitPhotoId: null,
  sex: 'unknown',
  surname
})

/**
 * Creates the family, puts its creator in it as its first person and
 * remembers both links on this device. Once the family exists it is never
 * reported as failed: a founder who could not be recorded picks themselves
 * on "Who are you?" instead.
 */
export const createFamilyWithFounder = async ({
  founder,
  treeName
}: {
  founder: Founder
  treeName: string
}): Promise<Result<FamilyId, ApiFailure>> => {
  const created = await createFamily({ name: treeName })

  if (created.status === 'failure') {
    return created
  }

  const { familyId, familyKey, keeperKey } = created.data
  const person = founderPerson(founder)
  const recorded = await recordOperations({
    familyId,
    input: {
      author: { kind: 'person', personId: person.id },
      baseRevision: EMPTY_LOG_REVISION,
      operations: [{ person, type: 'person.create' }]
    },
    key: keeperKey
  })
  warnOnFailure(recorded, 'Recording the founder of the new family')

  rememberFamily(familyId, (access) => ({
    ...access,
    keys: { contributor: familyKey, keeper: keeperKey },
    me:
      recorded.status === 'success'
        ? { kind: 'person', personId: person.id }
        : null,
    name: treeName
  }))

  return Result.success(familyId)
}
