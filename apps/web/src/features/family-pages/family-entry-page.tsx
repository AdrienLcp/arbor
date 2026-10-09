import type React from 'react'

import { familyTreePathFor, Redirect } from '@/infrastructure/router/navigation'

import { useOpenFamily } from './family-loader'

/** The family's own address opens its tree, for everyone: "Who are you?" waits for the first change. */
export const FamilyEntryPage: React.FC = () => {
  const { familyId } = useOpenFamily()

  return <Redirect to={familyTreePathFor(familyId)} />
}
