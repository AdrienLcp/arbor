/** Copies of a read-only map or set with one change, leaving the original as it was. */

export const withEntry = <Key, Value>(
  map: ReadonlyMap<Key, Value>,
  key: Key,
  value: Value
): ReadonlyMap<Key, Value> => new Map(map).set(key, value)

export const withoutEntry = <Key, Value>(
  map: ReadonlyMap<Key, Value>,
  key: Key
): ReadonlyMap<Key, Value> => {
  const copy = new Map(map)
  copy.delete(key)
  return copy
}

export const withMember = <Member>(
  set: ReadonlySet<Member>,
  member: Member
): ReadonlySet<Member> => new Set(set).add(member)

export const withoutMember = <Member>(
  set: ReadonlySet<Member>,
  member: Member
): ReadonlySet<Member> => {
  const copy = new Set(set)
  copy.delete(member)
  return copy
}
