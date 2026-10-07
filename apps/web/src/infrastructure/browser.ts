/** The reader's languages in order of preference: the interface language and the shape of numbers and dates. */
export const preferredLanguages = (): readonly string[] => navigator.languages

/** Screen readers and hyphenation follow the language the page is actually written in. */
export const setDocumentLanguage = (locale: string): void => {
  document.documentElement.lang = locale
}
