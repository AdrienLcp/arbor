import type { RouteObject } from 'react-router'

import { familyLoader } from '@/features/family-pages/family-loader'

import { familyIdParam, paths, ROUTE_IDS } from './navigation'
import { RootRoute } from './root-route'
import { ErrorScreen, NotFoundPage } from './route-error'

type RoutedPath = (typeof paths)[keyof typeof paths]

const pageFor = {
  [paths.createFamily]: async () => ({
    Component: (await import('@/features/create-family/create-family-page'))
      .CreateFamilyPage
  }),
  [paths.family]: async () => ({
    Component: (await import('@/features/family-pages/family-home-page'))
      .FamilyHomePage
  }),
  [paths.familySettings]: async () => ({
    Component: (await import('@/features/family-pages/family-settings-page'))
      .FamilySettingsPage
  }),
  [paths.familyShare]: async () => ({
    Component: (await import('@/features/family-pages/family-share-page'))
      .FamilySharePage
  }),
  [paths.familyTree]: async () => ({
    Component: (await import('@/features/family-pages/family-tree-page'))
      .FamilyTreePage
  }),
  [paths.home]: async () => ({
    Component: (await import('@/features/home/home-page')).HomePage
  }),
  [paths.openLink]: async () => ({
    Component: (await import('@/features/open-link/open-link-page'))
      .OpenLinkPage
  }),
  [paths.personSheet]: async () => ({
    Component: (await import('@/features/person-sheet/person-sheet-page'))
      .PersonSheetPage
  }),
  [paths.whoAmI]: async () => ({
    Component: (await import('@/features/family-pages/who-am-i-page'))
      .WhoAmIPage
  })
} satisfies Record<RoutedPath, RouteObject['lazy']>

/** The pages shown inside a family, once its layout has opened it. */
const FAMILY_PAGES = [
  paths.whoAmI,
  paths.familyTree,
  paths.familyShare,
  paths.familySettings
] as const satisfies readonly RoutedPath[]

/** Pages drawn over another one, which stays on screen beside them: a person's sheet over the tree. */
const PAGES_OVER: Partial<Record<RoutedPath, readonly RoutedPath[]>> = {
  [paths.familyTree]: [paths.personSheet]
}

const familyRoute: RouteObject = {
  children: [
    { index: true, lazy: pageFor[paths.family] },
    ...FAMILY_PAGES.map((path) => ({
      children: PAGES_OVER[path]?.map((over) => ({
        lazy: pageFor[over],
        path: over
      })),
      lazy: pageFor[path],
      path
    }))
  ],
  id: ROUTE_IDS.family,
  lazy: async () => ({
    Component: (await import('@/features/family-pages/family-layout'))
      .FamilyLayout
  }),
  loader: ({ params, request }) =>
    familyLoader({ familyId: familyIdParam(params), signal: request.signal }),
  path: paths.family
}

const OUTSIDE_A_FAMILY = [
  paths.home,
  paths.createFamily,
  paths.openLink
] as const satisfies readonly RoutedPath[]

/** Nothing while the first page's code loads: it arrives in a blink. */
const RouteFallback = () => null

export const routes: RouteObject[] = [
  {
    Component: RootRoute,
    children: [
      ...OUTSIDE_A_FAMILY.map((path) => ({ lazy: pageFor[path], path })),
      familyRoute,
      { Component: NotFoundPage, path: '*' }
    ],
    ErrorBoundary: ErrorScreen,
    HydrateFallback: RouteFallback
  }
]
