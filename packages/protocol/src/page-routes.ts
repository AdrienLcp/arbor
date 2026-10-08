/** The web app's pages: the router renders them, the worker answers 200 for them and 404 for anything else. */
export const PAGE_ROUTES = {
  createFamily: '/new',
  family: '/f/:familyId',
  familySettings: '/f/:familyId/settings',
  familyShare: '/f/:familyId/share',
  familyTree: '/f/:familyId/tree',
  home: '/',
  openLink: '/link',
  personSheet: '/f/:familyId/tree/:personId',
  whoAmI: '/f/:familyId/me'
} as const
