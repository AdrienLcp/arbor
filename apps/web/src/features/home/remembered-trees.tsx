import type React from 'react'
import { useId } from 'react'

import type { Role } from '@arbor/protocol/access'

import {
  keysToTry,
  strongestRole
} from '@/features/family-access/family-access'
import { rememberedFamilyList } from '@/features/family-access/remembered-families'
import { familyPathFor } from '@/infrastructure/router/navigation'
import { AlbumGlyph } from '@/presentation/components/album-glyph'
import { ButtonLink } from '@/presentation/components/button-link'
import { ChevronIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './remembered-trees.sass'

const ROLE_KEY_FOR = {
  contributor: null,
  keeper: 'home.trees.keeper',
  reader: 'home.trees.reader'
} as const

const TreeRole: React.FC<{ role: Role | null }> = ({ role }) => {
  const translate = useTranslate()
  const roleKey = role === null ? null : ROLE_KEY_FOR[role]

  return roleKey === null ? null : (
    <span className='tree-role'>{translate(roleKey)}</span>
  )
}

/** The trees this device can still open, so a relative coming back finds theirs in one tap. */
export const RememberedTrees: React.FC = () => {
  const translate = useTranslate()
  const titleId = useId()
  const trees = rememberedFamilyList().filter(
    ({ access }) => keysToTry(access).length > 0
  )

  if (trees.length === 0) {
    return null
  }

  return (
    <section aria-labelledby={titleId} className='remembered-trees'>
      <h2 className='trees-title' id={titleId}>
        {translate('home.trees.title')}
      </h2>
      <ul className='tree-list'>
        {trees.map(({ access, familyId }) => (
          <li key={familyId}>
            <ButtonLink
              className='tree-row'
              href={familyPathFor(familyId)}
              variant='quiet'
            >
              <AlbumGlyph />
              <span className='tree-text'>
                <span className='tree-name'>
                  {access.name ?? translate('common.unnamedTree')}
                </span>
                <TreeRole role={strongestRole(access)} />
              </span>
              <ChevronIcon aria-hidden='true' className='tree-chevron' />
            </ButtonLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
