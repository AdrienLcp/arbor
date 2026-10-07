import { readFileSync } from 'node:fs'

import {
  type ContrastPair,
  findContrastFailures,
  WCAG_AA
} from '@adrienlcp/styles/contrast'
import { expect, it } from 'vitest'

const TOKENS = readFileSync(new URL('_tokens.sass', import.meta.url), 'utf8')

const PAPERS = ['--paper', '--paper-2', '--paper-deep', '--sticker']
const GENERATIONS = ['1', '2', '3', '4', '5']

const PAIRS: ContrastPair[] = [
  ...PAPERS.flatMap((background) => [
    { background, foreground: '--ink', minimum: WCAG_AA.text },
    { background, foreground: '--ink-soft', minimum: WCAG_AA.text },
    { background, foreground: '--focus', minimum: WCAG_AA.nonText }
  ]),
  ...GENERATIONS.flatMap((generation) => [
    {
      background: `--g${generation}`,
      foreground: `--on-g${generation}`,
      minimum: WCAG_AA.text
    },
    {
      background: '--paper',
      foreground: `--g${generation}-ink`,
      minimum: WCAG_AA.text
    }
  ]),
  { background: '--paper', foreground: '--line', minimum: WCAG_AA.nonText },
  { background: '--paper', foreground: '--ghost', minimum: WCAG_AA.nonText },
  { background: '--paper-2', foreground: '--ghost', minimum: WCAG_AA.nonText },
  { background: '--paper', foreground: '--matte', minimum: WCAG_AA.nonText },
  { background: '--action', foreground: '--on-action', minimum: WCAG_AA.text },
  { background: '--cover', foreground: '--on-cover', minimum: WCAG_AA.text },
  { background: '--warn-bg', foreground: '--warn', minimum: WCAG_AA.text },
  { background: '--warn-bg', foreground: '--ink', minimum: WCAG_AA.text },
  {
    background: '--print-paper',
    foreground: '--print-ink',
    minimum: WCAG_AA.text
  }
]

it('[contrast] every ink reads on every paper, in both themes', () => {
  expect(findContrastFailures(TOKENS, PAIRS)).toEqual([])
})
