import { describe, expect, it } from 'vitest'

import {
  nextTreeLinkStep,
  TREE_LINK_OFF,
  type TreeLinkEvent,
  type TreeLinkStep
} from './tree-link-step'

const run = (
  events: readonly TreeLinkEvent[],
  from: TreeLinkStep = TREE_LINK_OFF
) => events.reduce(nextTreeLinkStep, from)

const COUPLE_CHOSEN: TreeLinkEvent[] = [
  { type: 'start' },
  { kind: 'couple', type: 'choose' }
]

describe('nextTreeLinkStep', () => {
  it('asks the kind, then the first person, then the second, then confirms', () => {
    expect(run(COUPLE_CHOSEN)).toEqual({ kind: 'couple', step: 'first' })
    expect(
      run([
        ...COUPLE_CHOSEN,
        { personId: 'claire-dubois', refusal: null, type: 'pick' },
        { personId: 'pierre-morel', refusal: null, type: 'pick' }
      ])
    ).toEqual({
      firstId: 'claire-dubois',
      kind: 'couple',
      secondId: 'pierre-morel',
      step: 'confirming'
    })
  })

  it('stays on the second person after a refused touch, and says which', () => {
    expect(
      run([
        ...COUPLE_CHOSEN,
        { personId: 'michel-morel', refusal: null, type: 'pick' },
        {
          personId: 'francoise-lambert',
          refusal: 'already_partners',
          type: 'pick'
        }
      ])
    ).toEqual({
      firstId: 'michel-morel',
      kind: 'couple',
      refused: { personId: 'francoise-lambert', refusal: 'already_partners' },
      step: 'second'
    })
  })

  it('lets go of the first person when they are touched again', () => {
    expect(
      run([
        ...COUPLE_CHOSEN,
        { personId: 'claire-dubois', refusal: null, type: 'pick' },
        { personId: 'claire-dubois', refusal: 'same_person', type: 'pick' }
      ])
    ).toEqual({ kind: 'couple', step: 'first' })
  })

  it('goes back from the confirmation to touch another second person', () => {
    expect(
      run([
        ...COUPLE_CHOSEN,
        { personId: 'claire-dubois', refusal: null, type: 'pick' },
        { personId: 'pierre-morel', refusal: null, type: 'pick' },
        { type: 'chooseOther' }
      ])
    ).toEqual({
      firstId: 'claire-dubois',
      kind: 'couple',
      refused: null,
      step: 'second'
    })
  })

  it('ignores touches while the kind is asked or the mode is off', () => {
    const touch: TreeLinkEvent = {
      personId: 'pierre-morel',
      refusal: null,
      type: 'pick'
    }
    expect(run([touch])).toEqual(TREE_LINK_OFF)
    expect(run([{ type: 'start' }, touch])).toEqual({ step: 'choosing' })
  })

  it('turns off from any step on cancel', () => {
    expect(
      run([
        ...COUPLE_CHOSEN,
        { personId: 'claire-dubois', refusal: null, type: 'pick' },
        { type: 'cancel' }
      ])
    ).toEqual(TREE_LINK_OFF)
  })
})
