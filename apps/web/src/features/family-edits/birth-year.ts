import { Result } from '@adrienlcp/result'

import type { Occurrence } from '@arbor/protocol/occurrence'

/** A year as people write it on a family tree: three or four digits. */
const YEAR = /^\d{3,4}$/

/** The birth a typed year says: `null` when nothing is typed, a failure when it is not a year. */
export const birthOfYear = (
  typed: string
): Result<Occurrence | null, 'not_a_year'> => {
  const year = typed.trim()
  if (year === '') return Result.success(null)
  if (!YEAR.test(year)) return Result.failure('not_a_year')
  return Result.success({
    date: {
      point: { precision: 'year', year: Number(year) },
      qualifier: 'exact'
    },
    place: null
  })
}
