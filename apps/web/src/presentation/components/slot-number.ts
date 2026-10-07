const SLOT_NUMBER_DIGITS = 2

/** A slot's number as the album prints it: two digits at least, "01". */
export const slotNumberText = (slotNumber: number): string =>
  String(slotNumber).padStart(SLOT_NUMBER_DIGITS, '0')
