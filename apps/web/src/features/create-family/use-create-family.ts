import { useState, useTransition } from 'react'

import {
  familySharePathFor,
  useNavigateTo
} from '@/infrastructure/router/navigation'

import {
  createFamilyWithFounder,
  type Founder
} from './create-family-with-founder'

/** Creates the family, then opens its share page in place of the form, so Back cannot create it twice. */
export const useCreateFamily = () => {
  const navigateTo = useNavigateTo()
  const [isPending, startTransition] = useTransition()
  const [hasFailed, setHasFailed] = useState(false)

  const create = (input: { founder: Founder; treeName: string }): void => {
    setHasFailed(false)
    startTransition(async () => {
      const created = await createFamilyWithFounder(input)

      startTransition(() => {
        if (created.status === 'failure') {
          setHasFailed(true)
          return
        }

        navigateTo(familySharePathFor(created.data), { replace: true })
      })
    })
  }

  return { create, hasFailed, isPending }
}
