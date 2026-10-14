import { createThemePreferenceStore } from '@adrienlcp/theme-preference'

/** Named on the legal page, which lists what the device keeps. */
export const THEME_STORAGE_KEY = 'arbor:theme'

export const themeStore = createThemePreferenceStore({
  storageKey: THEME_STORAGE_KEY
})
