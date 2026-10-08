import { describe, expect, it } from 'vitest'

import type { ChangeLogEntry, EntryCause } from '@arbor/protocol/change-log'
import type { Operation } from '@arbor/protocol/operation'
import type { Person } from '@arbor/protocol/person'

import { namesInLog, storiesOf } from './entry-story'

const person = (id: string, givenNames: string, surname = 'Morel'): Person => ({
  birth: null,
  birthSurname: null,
  death: null,
  givenNames,
  id,
  livingOverride: null,
  notes: '',
  portraitPhotoId: null,
  sex: 'unknown',
  surname
})

const logOf = (
  steps: readonly (Operation | { cause: EntryCause; operation: Operation })[]
): ChangeLogEntry[] =>
  steps.map((step, index) => ({
    at: '2026-10-08T10:00:00Z',
    author: { kind: 'named', name: 'Papa' },
    cause: 'cause' in step ? step.cause : null,
    operation: 'cause' in step ? step.operation : step,
    revision: index + 1
  }))

const FAMILY: Operation = {
  operations: [
    { person: person('anne', 'Anne'), type: 'person.create' },
    { person: person('sophie', 'Sophie', 'Garnier'), type: 'person.create' },
    {
      type: 'union.create',
      union: {
        end: null,
        id: 'anne-sophie',
        kind: 'pacs',
        partnerIds: ['anne', 'sophie'],
        start: null
      }
    }
  ],
  type: 'group'
}

describe('[history] entry stories', () => {
  it('[history] tells an addition with its links as one sentence', () => {
    const stories = storiesOf(
      logOf([
        FAMILY,
        {
          operations: [
            { person: person('lucie', 'Lucie'), type: 'person.create' },
            {
              filiation: {
                childId: 'lucie',
                id: 'f1',
                kind: 'birth',
                parentId: 'anne'
              },
              type: 'filiation.create'
            },
            {
              filiation: {
                childId: 'lucie',
                id: 'f2',
                kind: 'adoption',
                parentId: 'sophie'
              },
              type: 'filiation.create'
            }
          ],
          type: 'group'
        }
      ])
    )

    expect(stories.get(2)?.lines).toEqual([
      {
        childNames: [],
        kind: 'added',
        name: 'Lucie Morel',
        parentNames: ['Anne Morel', 'Sophie Garnier'],
        partnerNames: []
      }
    ])
  })

  it('[history] names a renamed person as they were before and after', () => {
    const stories = storiesOf(
      logOf([
        FAMILY,
        {
          after: { givenNames: 'Annie', notes: 'Née à Brest' },
          before: { givenNames: 'Anne', notes: '' },
          personId: 'anne',
          type: 'person.update'
        }
      ])
    )

    expect(stories.get(2)?.lines).toEqual([
      { after: 'Annie Morel', before: 'Anne Morel', kind: 'renamed' },
      { fields: ['notes'], kind: 'corrected', name: 'Annie Morel' }
    ])
  })

  it('[history] reads back the partners of a union that ends', () => {
    const stories = storiesOf(
      logOf([
        FAMILY,
        {
          after: { end: { date: null, kind: 'separation', place: null } },
          before: { end: null },
          type: 'union.update',
          unionId: 'anne-sophie'
        }
      ])
    )

    expect(stories.get(2)).toEqual({
      lines: [
        {
          change: 'update',
          ending: 'separation',
          kind: 'union',
          partnerNames: ['Anne Morel', 'Sophie Garnier'],
          unionKind: 'pacs'
        }
      ],
      personIds: new Set(['anne', 'sophie'])
    })
  })

  it('[history] tells an undo by its cause, not by the inverse it applied', () => {
    const stories = storiesOf(
      logOf([
        FAMILY,
        { personId: 'anne', type: 'person.bin' },
        {
          cause: { kind: 'undo', revisions: [2] },
          operation: { personId: 'anne', type: 'person.restore' }
        }
      ])
    )

    expect(stories.get(3)).toEqual({
      lines: [{ kind: 'undo', revisions: [2] }],
      personIds: new Set(['anne'])
    })
  })

  it('[history] keeps the name of someone in the bin', () => {
    const names = namesInLog(
      logOf([FAMILY, { personId: 'sophie', type: 'person.bin' }])
    )

    expect(names.get('sophie')).toBe('Sophie Garnier')
  })
})
