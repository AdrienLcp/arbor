import { ignoreSupersededNavigation } from '@adrienlcp/react-router'
import type React from 'react'
import {
  generatePath,
  matchPath,
  type PathParam,
  useLoaderData,
  useNavigate,
  useOutlet,
  useRevalidator,
  useRouteLoaderData
} from 'react-router'

import { type FamilyId, familyIdSchema } from '@arbor/protocol/access'
import { PAGE_ROUTES } from '@arbor/protocol/page-routes'

export const paths = PAGE_ROUTES

/** Names a layout route, so the pages below it can read the data it loaded. */
export const ROUTE_IDS = {
  family: 'family'
} as const
type RouteId = (typeof ROUTE_IDS)[keyof typeof ROUTE_IDS]

const pathFor = <TPath extends string>(
  path: TPath,
  params: Record<PathParam<TPath>, string>
): string => generatePath<string>(path, params)

export const familyPathFor = (familyId: FamilyId): string =>
  pathFor(paths.family, { familyId })

export const whoAmIPathFor = (familyId: FamilyId): string =>
  pathFor(paths.whoAmI, { familyId })

export const familySharePathFor = (familyId: FamilyId): string =>
  pathFor(paths.familyShare, { familyId })

export const familySettingsPathFor = (familyId: FamilyId): string =>
  pathFor(paths.familySettings, { familyId })

type Loader = (...args: never[]) => unknown

/** What the current route's loader resolved. */
export const useRouteData = <TLoader extends Loader>() =>
  useLoaderData<Awaited<ReturnType<TLoader>>>()

/** What a layout route above the current page resolved; only a page below that layout may ask. */
export const useLayoutData = <TLoader extends Loader>(routeId: RouteId) => {
  const layoutData = useRouteLoaderData<Awaited<ReturnType<TLoader>>>(routeId)

  if (layoutData === undefined) {
    throw new Error(`Rendered outside the "${routeId}" route`)
  }

  return layoutData
}

/** Runs the loaders of the routes on screen again, after a change they read. */
export const useRefreshRouteData = (): (() => void) => {
  const { revalidate } = useRevalidator()

  return () => {
    void revalidate()
  }
}

type NavigateToOptions = {
  /** Replaces the current history entry, so Back skips the page left behind. */
  replace?: boolean
}

/** Moves to a page after an action — a family just created — rather than from a link. */
export const useNavigateTo = (): ((
  path: string,
  options?: NavigateToOptions
) => void) => {
  const navigate = useNavigate()

  return (path, options) => {
    void Promise.resolve(navigate(path, options)).catch(
      ignoreSupersededNavigation
    )
  }
}

/** The family a family page's address names, `null` for any other address. */
export const familyIdInPath = (pathname: string): FamilyId | null => {
  const familyPage = matchPath({ end: false, path: paths.family }, pathname)
  const familyId = familyIdSchema.safeParse(familyPage?.params.familyId)

  return familyId.success ? familyId.data : null
}

/** The family a route's `:familyId` names, `null` when it cannot be one. */
export const familyIdParam = (
  params: Readonly<Record<string, string | undefined>>
): FamilyId | null => {
  const familyId = familyIdSchema.safeParse(params.familyId)

  return familyId.success ? familyId.data : null
}

/** The page a layout route renders below itself, `null` when the layout is the page. */
export const useChildPage = (): React.ReactNode => useOutlet()
