import { PAGE_ROUTES } from '@arbor/protocol/page-routes'
import { SITE_ORIGIN } from '@arbor/protocol/site'

export type AssetFetcher = Pick<Fetcher, 'fetch'>

const PAGE_PATHS: readonly string[] = Object.values(PAGE_ROUTES)

const withoutTrailingSlash = (pathname: string): string =>
  pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname

const isPagePath = (pathname: string): boolean =>
  PAGE_PATHS.includes(withoutTrailingSlash(pathname))

/**
 * Only the landing page on the published host belongs in search results: a
 * family's pages never leave the family, and any other host mirrors the site.
 */
const isIndexable = (url: URL): boolean =>
  url.origin === SITE_ORIGIN && url.pathname === PAGE_ROUTES.home

const appDocument = async (
  url: URL,
  request: Request,
  assets: AssetFetcher
): Promise<Response> => {
  if (isPagePath(url.pathname)) {
    return assets.fetch(request)
  }

  const app = await assets.fetch(new URL(PAGE_ROUTES.home, url))

  return new Response(app.body, { headers: app.headers, status: 404 })
}

/**
 * Any address gets the web app so it can render its own not-found page,
 * but one that names no page answers 404 for crawlers and link checkers.
 */
export const serveWebApp = async (
  request: Request,
  assets: AssetFetcher
): Promise<Response> => {
  const url = new URL(request.url)
  const app = await appDocument(url, request, assets)

  if (isIndexable(url)) {
    return app
  }

  const unlisted = new Response(app.body, {
    headers: app.headers,
    status: app.status,
    statusText: app.statusText
  })
  unlisted.headers.set('X-Robots-Tag', 'noindex')

  return unlisted
}
