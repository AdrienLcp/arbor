import type React from 'react'

import { useChildPage } from '@/infrastructure/router/navigation'

import { useFamilyRouteData } from './family-loader'
import { FamilyUnreachableScreen } from './family-unreachable-screen'
import { LinkRefusedScreen } from './link-refused-screen'
import { WhoAmIProvider } from './who-am-i-provider'

/** Every page of a family, once the family let this device in. */
export const FamilyLayout: React.FC = () => {
  const family = useFamilyRouteData()
  const page = useChildPage()

  switch (family.status) {
    case 'open':
      return <WhoAmIProvider key={family.familyId}>{page}</WhoAmIProvider>
    case 'refused':
      return <LinkRefusedScreen />
    case 'unreachable':
      return <FamilyUnreachableScreen />
    default:
      return family satisfies never
  }
}
