import { globSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { findTypeLiterals, findUnitFailures } from '@adrienlcp/styles/audit'
import { describe, expect, it } from 'vitest'

const SOURCE_DIRECTORY = fileURLToPath(new URL('../..', import.meta.url))
const STYLESHEETS = globSync('**/*.{sass,css}', { cwd: SOURCE_DIRECTORY })

describe.each(STYLESHEETS)('%s', (path) => {
  const stylesheet = readFileSync(
    new URL(path, `file:///${SOURCE_DIRECTORY}/`),
    'utf8'
  )

  it('[units] sizes text and spacing in rem', () => {
    expect(findUnitFailures(stylesheet)).toEqual([])
  })

  it.skipIf(path.endsWith('_typography.sass'))(
    '[units] takes its text voice from the typography mixins',
    () => {
      expect(findTypeLiterals(stylesheet)).toEqual([])
    }
  )
})
