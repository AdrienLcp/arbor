import { AriaRouterProvider } from '@adrienlcp/react-router'
import type React from 'react'
import { useEffect, useRef, ViewTransition } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'

import { markAppHydrated } from '@/infrastructure/browser'
import { focusMain } from '@/presentation/components/main'

import { pageUnderneath } from './navigation'

/** A full load starts at the top on its own; a client-side navigation leaves focus on the link that started it. */
const useFocusMainOnNavigation = (pathname: string): void => {
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return
    }

    previousPathname.current = pathname
    focusMain({ preventScroll: true })
  }, [pathname])
}

/** The layout every page sits in: client-side links, a cross-fade between pages, focus and scroll. */
export const RootRoute: React.FC = () => {
  const { pathname } = useLocation()
  useFocusMainOnNavigation(pathname)

  useEffect(() => {
    markAppHydrated()
  }, [])

  return (
    <AriaRouterProvider>
      <ViewTransition
        default='none'
        enter='auto'
        exit='auto'
        key={pageUnderneath(pathname)}
      >
        <Outlet />
      </ViewTransition>
      <ScrollRestoration />
    </AriaRouterProvider>
  )
}
