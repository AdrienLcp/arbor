const initialOf = (name: string): string =>
  name.trim().charAt(0).toLocaleUpperCase()

/** The letters drawn on a person's sticker: the first of their given names and of their surname. */
export const monogramOf = ({
  givenNames,
  surname
}: {
  givenNames: string
  surname: string
}): string => `${initialOf(givenNames)}${initialOf(surname)}`
