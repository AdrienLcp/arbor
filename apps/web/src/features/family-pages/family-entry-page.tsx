import type React from 'react'

import { rememberedMe } from '@/features/family-access/remembered-families'
import {
  familyTreePathFor,
  Redirect,
  whoAmIPathFor
} from '@/infrastructure/router/navigation'

import { useOpenFamily } from './family-loader'

/** The family's own address opens its tree; a first visit asks "Who are you?" before anything else. */
export const FamilyEntryPage: React.FC = () => {
  const { family, familyId } = useOpenFamily()

  if (rememberedMe(familyId) === null && family.role !== 'reader') {
    return <Redirect to={whoAmIPathFor(familyId)} />
  }

  return <Redirect to={familyTreePathFor(familyId)} />
}
