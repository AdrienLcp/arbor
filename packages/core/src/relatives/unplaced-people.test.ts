import { describe, expect, it } from 'vitest'

import { DEMO_FAMILY_OPERATIONS } from '../family/demo-family'
import { replayOperations } from '../family/replay-operations'
import { unplacedPeople } from './unplaced-people'

const demoFamily = () => {
  const replayed = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (replayed.status !== 'success') throw new Error('the demo family replays')
  return replayed.data
}

describe('unplacedPeople', () => {
  it('finds nobody in a family where everyone is tied', () => {
    expect(unplacedPeople(demoFamily())).toEqual([])
  })

  it('finds someone tied to no one', () => {
    const family = demoFamily()
    const anne = family.persons.get('anne-morel')
    if (anne === undefined) throw new Error('Anne is in the demo family')
    const persons = new Map(family.persons).set('odette', {
      ...anne,
      id: 'odette'
    })
    expect(unplacedPeople({ ...family, persons })).toEqual(['odette'])
  })
})
