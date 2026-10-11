import { Result } from '@adrienlcp/result'

import type { FamilyId } from '@arbor/protocol/access'
import type { Author } from '@arbor/protocol/change-log'
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

/** Who creates the family: the founder themselves, or someone who starts the tree with another person and signs with their own name. */
export type Creator = { kind: 'founder' } | { kind: 'named'; name: string }

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
 * Creates the family, puts its founder in it as its first person and
 * remembers both links on this device, with who the creator is. Once the
 * family exists it is never reported as failed: a founder who could not be
 * recorded picks themselves on "Who are you?" instead.
 */
export const createFamilyWithFounder = async ({
  creator,
  founder,
  treeName
}: {
  creator: Creator
  founder: Founder
  treeName: string
}): Promise<Result<FamilyId, ApiFailure>> => {
  const created = await createFamily({ name: treeName })

  if (created.status === 'failure') {
    return created
  }

  const { familyId, familyKey, keeperKey } = created.data
  const person = founderPerson(founder)
  const author: Author =
    creator.kind === 'founder'
      ? { kind: 'person', personId: person.id }
      : creator
  const recorded = await recordOperations({
    familyId,
    input: {
      author,
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
      recorded.status === 'success' || author.kind === 'named' ? author : null,
    name: treeName
  }))

  return Result.success(familyId)
}
