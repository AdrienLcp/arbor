import { Result } from '@adrienlcp/result'

import type { Operation } from '@arbor/protocol/operation'
import type { OperationRefusal } from '@arbor/protocol/operation-refusal'

import { requireActivePerson } from './active-person'
import { withEntry, withoutEntry } from './copy-with'
import type { FamilyState } from './family-state'

export type EventOperation = Extract<Operation, { type: `event.${string}` }>

export const applyEventOperation = (
  family: FamilyState,
  operation: EventOperation
): Result<FamilyState, OperationRefusal> => {
  switch (operation.type) {
    case 'event.create': {
      const { event } = operation
      if (family.events.has(event.id)) return Result.failure('event_exists')
      const person = requireActivePerson(family, event.personId)
      if (person.status === 'failure') return person
      return Result.success({
        ...family,
        events: withEntry(family.events, event.id, event)
      })
    }
    case 'event.update': {
      const event = family.events.get(operation.eventId)
      if (!event) return Result.failure('event_not_found')
      return Result.success({
        ...family,
        events: withEntry(family.events, event.id, {
          ...event,
          ...operation.after
        })
      })
    }
    case 'event.remove': {
      if (!family.events.has(operation.event.id)) {
        return Result.failure('event_not_found')
      }
      return Result.success({
        ...family,
        events: withoutEntry(family.events, operation.event.id)
      })
    }
  }
}
