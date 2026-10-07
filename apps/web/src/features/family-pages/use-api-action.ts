import type { FailureResult } from '@adrienlcp/result'
import { useState, useTransition } from 'react'

import type { ApiFailure } from '@/infrastructure/api/family-api'

type Outcome = FailureResult<ApiFailure> | { status: 'success' }
type Succeeded<TOutcome extends Outcome> = Extract<
  TOutcome,
  { status: 'success' }
>

const hasSucceeded = <TOutcome extends Outcome>(
  outcome: TOutcome
): outcome is Succeeded<TOutcome> => outcome.status === 'success'

/** Runs one change against the family at a time: pending while it runs, failed until the next attempt. */
export const useApiAction = () => {
  const [isPending, startTransition] = useTransition()
  const [hasFailed, setHasFailed] = useState(false)

  const run = <TOutcome extends Outcome>(
    action: () => Promise<TOutcome>,
    onSuccess: (succeeded: Succeeded<TOutcome>) => void
  ): void => {
    setHasFailed(false)
    startTransition(async () => {
      const outcome = await action()

      startTransition(() => {
        if (hasSucceeded(outcome)) {
          onSuccess(outcome)
          return
        }

        if (outcome.status === 'failure' && outcome.error !== 'aborted') {
          setHasFailed(true)
        }
      })
    })
  }

  return { hasFailed, isPending, run }
}
