export { copyText } from '@adrienlcp/browser'

/** The reader's languages in order of preference: the interface language and the shape of numbers and dates. */
export const preferredLanguages = (): readonly string[] => navigator.languages

/** Screen readers and hyphenation follow the language the page is actually written in. */
export const setDocumentLanguage = (locale: string): void => {
  document.documentElement.lang = locale
}

/** The mark an end-to-end journey waits for before it acts: React has taken over the page. */
export const markAppHydrated = (): void => {
  document.documentElement.dataset.hydrated = ''
}

/** The address the page was opened at: its path and its fragment, without the `#`. */
export const openedAddress = (): { fragment: string; pathname: string } => ({
  fragment: window.location.hash.slice(1),
  pathname: window.location.pathname
})

/** Takes the fragment off the address bar without a reload, so a key it carried is not left on screen or in a copied URL. */
export const dropFragmentFromAddress = (): void => {
  const { pathname, search } = window.location
  window.history.replaceState(window.history.state, '', `${pathname}${search}`)
}

/** Calls `onChange` when only the fragment changes — a link to the open page pasted in the address bar, which loads nothing. */
export const watchAddressFragment = (onChange: () => void): void => {
  window.addEventListener('hashchange', onChange)
}
