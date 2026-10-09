import { globSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { REACT_ARIA_TOKENS } from '@adrienlcp/react-aria'
import {
  findFallbackFailures,
  findTokenFailures,
  findTypeLiterals,
  findUnitFailures,
  findUnnamedValues,
  webFontFamilies
} from '@adrienlcp/styles/audit'
import { describe, expect, it } from 'vitest'

const SOURCE_DIRECTORY = fileURLToPath(new URL('../..', import.meta.url))
const STYLESHEETS = globSync('**/*.{sass,css}', { cwd: SOURCE_DIRECTORY })
const SOURCES = globSync('**/*.{sass,css,ts,tsx}', {
  cwd: SOURCE_DIRECTORY
}).map((path) => readSource(path))
const WEB_FONTS = webFontFamilies(STYLESHEETS.map((path) => readSource(path)))

function readSource(path: string): string {
  return readFileSync(new URL(path, `file:///${SOURCE_DIRECTORY}/`), 'utf8')
}

describe.each(STYLESHEETS)('%s', (path) => {
  const stylesheet = readSource(path)

  it('[styles] sizes text, spacing and boxes in rem', () => {
    expect(findUnitFailures(stylesheet)).toEqual([])
  })

  it.skipIf(path.endsWith('_typography.sass'))(
    '[styles] takes its text voice from the typography mixins',
    () => {
      expect(findTypeLiterals(stylesheet)).toEqual([])
    }
  )

  it('[styles] takes its radii and durations from tokens', () => {
    expect(findUnnamedValues(stylesheet)).toEqual([])
  })

  it('[styles] names the fallback face after every web font in a font token', () => {
    expect(findFallbackFailures(stylesheet, WEB_FONTS)).toEqual([])
  })
})

it('[styles] reads only custom properties that exist, under their one shared name', () => {
  expect(findTokenFailures(SOURCES, { provided: REACT_ARIA_TOKENS })).toEqual(
    []
  )
})
