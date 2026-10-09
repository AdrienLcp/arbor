/** What each sticker carries on paper, beyond the name. */
export type PrintContent = {
  hasDates: boolean
  hasPhotos: boolean
  hasPlaces: boolean
}

/** Photos and dates as the screen shows them; places stay off, a long town name crowds a small sticker. */
export const DEFAULT_PRINT_CONTENT: PrintContent = {
  hasDates: true,
  hasPhotos: true,
  hasPlaces: false
}
