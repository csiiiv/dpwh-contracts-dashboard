/**
 * Route paths for the application
 * Each constant represents a unique route in the SPA
 */

export const ROUTES = {
  HOME: '/',
  DATA_EXPLORER: '/',
  CONTRACTS_EXPLORER: '/contracts-explorer',
  ADVANCED_SEARCH: '/advanced-search',
  TREEMAP: '/treemap',
  API_DOCS: '/api-docs',
  HELP: '/help',
  ABOUT: '/about',
  // About sub-routes
  ABOUT_OVERVIEW: '/about/overview',
  ABOUT_DATA: '/about/data',
  ABOUT_FEATURES: '/about/features',
  ABOUT_UPDATES: '/about/updates',
  ABOUT_ARCHITECTURE: '/about/architecture',
  ABOUT_METHODOLOGY: '/about/methodology',
  ABOUT_QUALITY: '/about/quality',
  ABOUT_API: '/about/api',
  ABOUT_CONTACT: '/about/contact',
  ABOUT_SCHEMA: '/about/schema',
} as const

// Type for route paths
export type RoutePath = typeof ROUTES[keyof typeof ROUTES]

/**
 * Map tab IDs to route paths
 */
export const TAB_TO_ROUTE: Record<string, RoutePath> = {
  'data-explorer': ROUTES.DATA_EXPLORER,
  'contracts-explorer': ROUTES.CONTRACTS_EXPLORER,
  'advanced-search': ROUTES.ADVANCED_SEARCH,
  'treemap': ROUTES.TREEMAP,
  'api-docs': ROUTES.API_DOCS,
  'help': ROUTES.HELP,
  'about': ROUTES.ABOUT,
}

/**
 * Map route paths to tab IDs
 */
export const ROUTE_TO_TAB: Record<RoutePath, string> = {
  [ROUTES.HOME]: 'data-explorer',
  [ROUTES.DATA_EXPLORER]: 'data-explorer',
  [ROUTES.CONTRACTS_EXPLORER]: 'contracts-explorer',
  [ROUTES.ADVANCED_SEARCH]: 'advanced-search',
  [ROUTES.TREEMAP]: 'treemap',
  [ROUTES.API_DOCS]: 'api-docs',
  [ROUTES.HELP]: 'help',
  [ROUTES.ABOUT]: 'about',
}
