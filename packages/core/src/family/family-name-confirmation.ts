const spacesCollapsed = (text: string): string =>
  text.trim().replaceAll(/\s+/g, ' ')

/**
 * Whether the name a keeper typed to confirm the family's deletion is the
 * family's: case, accents and extra spaces aside, since a retiree on a phone
 * keyboard confirms the name, not its spelling.
 */
export const isFamilyNameConfirmed = ({
  name,
  typed
}: {
  name: string
  typed: string
}): boolean =>
  spacesCollapsed(typed).length > 0 &&
  spacesCollapsed(typed).localeCompare(spacesCollapsed(name), 'fr', {
    sensitivity: 'base'
  }) === 0
