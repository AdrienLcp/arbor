/** A `.webp` the bundle carries as bytes, through the `Data` rule of `wrangler.jsonc`. */
declare module '*.webp' {
  const bytes: ArrayBuffer
  export default bytes
}
