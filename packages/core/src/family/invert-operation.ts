import type { Operation } from '@arbor/protocol/operation'

/** The operation that undoes `operation`: applied right after it, the family is back as it was. */
export const invertOperation = (operation: Operation): Operation => {
  switch (operation.type) {
    case 'group':
      return {
        operations: operation.operations.toReversed().map(invertOperation),
        type: 'group'
      }
    case 'person.create':
      return { person: operation.person, type: 'person.remove' }
    case 'person.update':
      return { ...operation, after: operation.before, before: operation.after }
    case 'person.bin':
      return { personId: operation.personId, type: 'person.restore' }
    case 'person.restore':
      return { personId: operation.personId, type: 'person.bin' }
    case 'person.remove':
      return { person: operation.person, type: 'person.create' }
    case 'union.create':
      return { type: 'union.remove', union: operation.union }
    case 'union.update':
      return { ...operation, after: operation.before, before: operation.after }
    case 'union.remove':
      return { type: 'union.create', union: operation.union }
    case 'filiation.create':
      return { filiation: operation.filiation, type: 'filiation.remove' }
    case 'filiation.update':
      return { ...operation, after: operation.before, before: operation.after }
    case 'filiation.remove':
      return { filiation: operation.filiation, type: 'filiation.create' }
    case 'event.create':
      return { event: operation.event, type: 'event.remove' }
    case 'event.update':
      return { ...operation, after: operation.before, before: operation.after }
    case 'event.remove':
      return { event: operation.event, type: 'event.create' }
    case 'photo.create':
      return { photo: operation.photo, type: 'photo.remove' }
    case 'photo.update':
      return { ...operation, after: operation.before, before: operation.after }
    case 'photo.remove':
      return { photo: operation.photo, type: 'photo.create' }
  }
}
