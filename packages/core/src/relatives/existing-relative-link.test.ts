import { describe, expect, it } from 'vitest'

import { applyInOrder } from '../family/apply-operation'
import { DEMO_FAMILY_OPERATIONS } from '../family/demo-family'
import { replayOperations } from '../family/replay-operations'
import {
  type ExistingRelativeLink,
  existingRelativeLinkOperations,
  linkRefusal
} from './existing-relative-link'

const demoFamily = () => {
  const family = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (family.status === 'failure') throw new Error('The demo family is refused')
  return family.data
}

const countingIds = () => {
  let created = 0
  return () => {
    created += 1
    return `new-${created}`
  }
}

describe('linkRefusal', () => {
  it.each<[string, ExistingRelativeLink]>([
    [
      'a step-parent who is already in the tree',
      {
        anchorId: 'anne-morel',
        kind: 'step',
        relation: 'parent',
        relativeId: 'odile-bertin'
      }
    ],
    [
      'a child born of a parent the tree had not tied yet',
      {
        anchorId: 'odile-bertin',
        kind: 'birth',
        relation: 'child',
        relativeId: 'emma-bertin'
      }
    ],
    [
      'a remarriage after a divorce',
      {
        anchorId: 'pierre-morel',
        kind: 'marriage',
        relation: 'partner',
        relativeId: 'claire-dubois',
        start: null
      }
    ],
    [
      'a cousin made a half-brother through the parent he lacked',
      {
        anchorId: 'emma-bertin',
        relation: 'sibling',
        relativeId: 'rene-morel'
      }
    ]
  ])('accepts %s', (_, link) => {
    expect(linkRefusal(demoFamily(), link)).toBeNull()
  })

  it.each<[string, ExistingRelativeLink, string]>([
    [
      'a person tied to themselves',
      {
        anchorId: 'pierre-morel',
        kind: 'birth',
        relation: 'parent',
        relativeId: 'pierre-morel'
      },
      'same_person'
    ],
    [
      'a son made his own father’s parent',
      {
        anchorId: 'louis-morel',
        kind: 'birth',
        relation: 'parent',
        relativeId: 'pierre-morel'
      },
      'ancestry_cycle'
    ],
    [
      'a grandfather made his grandson’s child',
      {
        anchorId: 'anne-morel',
        kind: 'adoption',
        relation: 'child',
        relativeId: 'louis-morel'
      },
      'ancestry_cycle'
    ],
    [
      'a parent tied twice',
      {
        anchorId: 'anne-morel',
        kind: 'step',
        relation: 'parent',
        relativeId: 'pierre-morel'
      },
      'duplicate_filiation'
    ],
    [
      'a third parent by birth',
      {
        anchorId: 'anne-morel',
        kind: 'birth',
        relation: 'parent',
        relativeId: 'odile-bertin'
      },
      'too_many_birth_parents'
    ],
    [
      'the same ongoing union twice',
      {
        anchorId: 'karim-morel',
        kind: 'marriage',
        relation: 'partner',
        relativeId: 'ines-roche',
        start: null
      },
      'already_partners'
    ],
    [
      'a brother who already shares every parent',
      {
        anchorId: 'pierre-morel',
        relation: 'sibling',
        relativeId: 'simone-morel'
      },
      'already_siblings'
    ],
    [
      'a brother of someone whose parents are unknown',
      {
        anchorId: 'auguste-morel',
        relation: 'sibling',
        relativeId: 'jeanne-morel'
      },
      'no_known_parent'
    ]
  ])('refuses %s', (_, link, refusal) => {
    expect(linkRefusal(demoFamily(), link)).toBe(refusal)
  })
})

describe('existingRelativeLinkOperations', () => {
  it('ties a new brother to the parents he does not share yet, by their own kind of link', () => {
    const family = demoFamily()
    const operations = existingRelativeLinkOperations(
      family,
      {
        anchorId: 'pierre-morel',
        relation: 'sibling',
        relativeId: 'michel-morel'
      },
      countingIds()
    )

    expect(operations).toEqual({
      data: [
        {
          filiation: {
            childId: 'michel-morel',
            id: 'new-1',
            kind: 'birth',
            parentId: 'helene-roux'
          },
          type: 'filiation.create'
        }
      ],
      status: 'success'
    })
  })

  it('leaves the family able to replay what it builds', () => {
    const family = demoFamily()
    const operations = existingRelativeLinkOperations(
      family,
      {
        anchorId: 'anne-morel',
        kind: 'step',
        relation: 'parent',
        relativeId: 'odile-bertin'
      },
      countingIds()
    )
    if (operations.status === 'failure') throw new Error('Refused')

    const applied = applyInOrder(family, operations.data)

    expect(applied.status).toBe('success')
  })
})
