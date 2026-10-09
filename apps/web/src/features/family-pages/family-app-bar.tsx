import type React from 'react'

import {
  familyBinPathFor,
  familyHistoryPathFor,
  familyPathFor,
  familyPrintPathFor,
  familySettingsPathFor,
  familySharePathFor
} from '@/infrastructure/router/navigation'
import { AlbumGlyph } from '@/presentation/components/album-glyph'
import { ButtonLink } from '@/presentation/components/button-link'
import {
  BinIcon,
  HistoryIcon,
  PrintIcon,
  SettingsIcon,
  ShareIcon
} from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'

import './family-app-bar.sass'

/** The bar over every page of an open family: its name, back to its tree, what changed and the bin, and the ways to share and set it up. */
export const FamilyAppBar: React.FC = () => {
  const translate = useTranslate()
  const { family, familyId } = useOpenFamily()

  return (
    <header className='family-app-bar'>
      <ButtonLink
        className='family-bar-name'
        href={familyPathFor(familyId)}
        variant='quiet'
      >
        <AlbumGlyph />
        <span className='family-bar-name-text'>{family.settings.name}</span>
      </ButtonLink>
      <nav
        aria-label={translate('familyBar.label')}
        className='family-bar-actions'
      >
        {family.role === 'reader' ? null : (
          <>
            <ButtonLink
              href={familyHistoryPathFor({ familyId })}
              variant='quiet'
            >
              <HistoryIcon aria-hidden='true' />
              <span className='family-bar-action-label'>
                {translate('familyBar.history')}
              </span>
            </ButtonLink>
            <ButtonLink href={familyBinPathFor(familyId)} variant='quiet'>
              <BinIcon aria-hidden='true' />
              <span className='family-bar-action-label'>
                {translate('familyBar.bin')}
              </span>
            </ButtonLink>
          </>
        )}
        <ButtonLink href={familySharePathFor(familyId)} variant='quiet'>
          <ShareIcon aria-hidden='true' />
          <span className='family-bar-action-label'>
            {translate('familyBar.share')}
          </span>
        </ButtonLink>
        <ButtonLink href={familyPrintPathFor(familyId)} variant='quiet'>
          <PrintIcon aria-hidden='true' />
          <span className='family-bar-action-label'>
            {translate('familyBar.print')}
          </span>
        </ButtonLink>
        <ButtonLink href={familySettingsPathFor(familyId)} variant='quiet'>
          <SettingsIcon aria-hidden='true' />
          <span className='family-bar-action-label'>
            {translate('familyBar.settings')}
          </span>
        </ButtonLink>
      </nav>
    </header>
  )
}
