import type { RouteObject } from 'react-router'

import { NotFoundPage } from '@/features/not-found/not-found-page'

import { paths } from './navigation'
import { ErrorScreen } from './route-error'

type RoutedPath = (typeof paths)[keyof typeof paths]

const pageFor = {
  [paths.home]: async () => ({
    Component: (await import('@/features/home/home-page')).HomePage
  })
} satisfies Record<RoutedPath, RouteObject['lazy']>

/** Nothing while the first page's code loads: it arrives in a blink. */
const RouteFallback = () => null

export const routes: RouteObject[] = [
  {
    children: [
      ...Object.values(paths).map((path) => ({ lazy: pageFor[path], path })),
      { Component: NotFoundPage, path: '*' }
    ],
    ErrorBoundary: ErrorScreen,
    HydrateFallback: RouteFallback
  }
]
