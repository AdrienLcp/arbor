import { describe, expect, it } from 'vitest'

import { i18n } from './i18n'

const translate = i18n.translator('fr')

describe('French names in the interface’s sentences', () => {
  it.each([
    ['Emma', 'parent d’Emma'],
    ['Inès', 'parent d’Inès'],
    ['Hélène', 'parent d’Hélène'],
    ['René', 'parent de René']
  ])('names the child of an unknown parent: %s', (name, hint) => {
    expect(translate('tree.unknownParent.hintOf', { name })).toBe(hint)
  })

  it('titles a sheet', () => {
    expect(translate('sheet.title', { name: 'Anne' })).toBe('Fiche d’Anne')
  })

  it('names both ends of a kinship path', () => {
    expect(translate('kinship.chart', { from: 'Anne', to: 'Odile' })).toBe(
      'Le chemin d’Anne à Odile'
    )
  })
})
