/** Crockford's base32, lower case: no i, l, o or u, so no letter passes for another when an id is read aloud or copied by hand. */
export const ID_ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz'

/** Each character carries 5 bits: 32 divides 256, so keeping a byte's last 5 bits keeps every character equally likely. */
const LAST_FIVE_BITS = 0b11111

/** A random id of `length` characters from `ID_ALPHABET`. */
export const randomId = (length: number): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(length)), (byte) =>
    ID_ALPHABET.charAt(byte & LAST_FIVE_BITS)
  ).join('')
