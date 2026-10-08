import { useLocale } from './i18n-context'

/** Joins words the way a sentence of the interface's language does: "Anne, Paul et Louis". */
export const useWordList = (): ((words: readonly string[]) => string) => {
  const list = new Intl.ListFormat(useLocale(), {
    style: 'long',
    type: 'conjunction'
  })

  return (words) => list.format(words)
}
