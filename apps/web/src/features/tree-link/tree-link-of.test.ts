import { describe, expect, it } from 'vitest'

import { DEMO_FAMILY_OPERATIONS } from '@arbor/core/family/demo-family'
import { replayOperations } from '@arbor/core/family/replay-operations'
import { linkRefusal } from '@arbor/core/relatives/existing-relative-link'

import { defaultTreeLinkDetails, treeLinkOf } from './tree-link-of'

const demoFamily = () => {
  const family = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (family.status === 'failure') throw new Error('The demo family is refused')
  return family.data
}

describe('treeLinkOf', () => {
  const family = demoFamily()
  const linkBetween = (
    kind: 'couple' | 'parentChild' | 'siblings',
    firstId: string,
    secondId: string
  ) =>
    treeLinkOf({
      details: defaultTreeLinkDetails(family, secondId),
      family,
      firstId,
      kind,
      secondId
    })

  it('ties the parent touched first to the child touched second', () => {
    expect(linkBetween('parentChild', 'claire-dubois', 'emma-bertin')).toEqual({
      anchorId: 'claire-dubois',
      kind: 'birth',
      relation: 'child',
      relativeId: 'emma-bertin'
    })
  })

  it('offers a step-parent to a child who has two birth parents', () => {
    expect(
      linkBetween('parentChild', 'odile-bertin', 'anne-morel')
    ).toMatchObject({
      kind: 'step'
    })
  })

  it('anchors brothers and sisters on the one whose parents are known', () => {
    expect(
      linkBetween('siblings', 'claire-dubois', 'pierre-morel')
    ).toMatchObject({
      anchorId: 'pierre-morel',
      relativeId: 'claire-dubois'
    })
  })

  it('refuses a couple that is already ongoing, and accepts a remarriage after a divorce', () => {
    expect(
      linkRefusal(
        family,
        linkBetween('couple', 'michel-morel', 'francoise-lambert')
      )
    ).toBe('already_partners')
    expect(
      linkRefusal(
        family,
        linkBetween('couple', 'claire-dubois', 'pierre-morel')
      )
    ).toBeNull()
  })

  it('refuses a parent who would become their own ancestor', () => {
    expect(
      linkRefusal(
        family,
        linkBetween('parentChild', 'pierre-morel', 'louis-morel')
      )
    ).toBe('ancestry_cycle')
  })
})
