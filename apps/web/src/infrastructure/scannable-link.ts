/**
 * A link as the segments its QR code is drawn from. In capitals, all but the
 * fragment's `#` fits a QR code's alphanumeric mode, which spends 5.5 bits a
 * character where any other text spends 8: the code is a size smaller and
 * reads from further. The `#` goes in a segment of its own. The worker sends a
 * page address in capitals to its lower-case one, and ids read in any case.
 */
export const scannableSegmentsOf = (link: string): string[] => {
  const fragmentStart = link.indexOf('#')

  return fragmentStart === -1
    ? [link.toUpperCase()]
    : [
        link.slice(0, fragmentStart).toUpperCase(),
        '#',
        link.slice(fragmentStart + 1).toUpperCase()
      ]
}
