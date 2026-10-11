import type React from 'react'
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover
} from 'react-aria-components'

import {
  familyBinPathFor,
  familyHistoryPathFor,
  familyPathFor,
  familyPrintPathFor,
  familySettingsPathFor,
  familySharePathFor
} from '@/infrastructure/router/navigation'
import { ButtonLink } from '@/presentation/components/button-link'
import {
  BinIcon,
  HistoryIcon,
  MoreIcon,
  PrintIcon,
  SettingsIcon,
  ShareIcon
} from '@/presentation/components/icons'
import { TreeMark } from '@/presentation/components/tree-mark'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'

import './family-app-bar.sass'

type BarAction = {
  href: string
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
  /** Folded into the "More" menu on a phone, so the family's name keeps its width. */
  isFoldedOnPhone: boolean
  key: 'bin' | 'history' | 'print' | 'settings' | 'share'
}

/** The bar over every page of an open family: its name, back to its tree, what changed and the bin, and the ways to share and set it up. */
export const FamilyAppBar: React.FC = () => {
  const translate = useTranslate()
  const { family, familyId } = useOpenFamily()

  const editorActions: readonly BarAction[] =
    family.role === 'reader'
      ? []
      : [
          {
            href: familyHistoryPathFor({ familyId }),
            Icon: HistoryIcon,
            isFoldedOnPhone: false,
            key: 'history'
          },
          {
            href: familyBinPathFor(familyId),
            Icon: BinIcon,
            isFoldedOnPhone: true,
            key: 'bin'
          }
        ]
  const actions: readonly BarAction[] = [
    ...editorActions,
    {
      href: familySharePathFor(familyId),
      Icon: ShareIcon,
      isFoldedOnPhone: false,
      key: 'share'
    },
    {
      href: familyPrintPathFor(familyId),
      Icon: PrintIcon,
      isFoldedOnPhone: true,
      key: 'print'
    },
    {
      href: familySettingsPathFor(familyId),
      Icon: SettingsIcon,
      isFoldedOnPhone: true,
      key: 'settings'
    }
  ]
  const foldedActions = actions.filter((action) => action.isFoldedOnPhone)

  return (
    <header className='family-app-bar'>
      <ButtonLink
        className='family-bar-name'
        href={familyPathFor(familyId)}
        variant='quiet'
      >
        <TreeMark />
        <span className='family-bar-name-text'>{family.settings.name}</span>
      </ButtonLink>
      <nav
        aria-label={translate('familyBar.label')}
        className='family-bar-actions'
      >
        {actions.map(({ href, Icon, isFoldedOnPhone, key }) => (
          <ButtonLink
            className={isFoldedOnPhone ? 'family-bar-folded' : undefined}
            href={href}
            key={key}
            variant='quiet'
          >
            <Icon aria-hidden='true' />
            <span className='family-bar-action-label'>
              {translate(`familyBar.${key}`)}
            </span>
          </ButtonLink>
        ))}
        <MenuTrigger>
          <Button
            aria-label={translate('familyBar.more')}
            className='button quiet family-bar-more'
          >
            <MoreIcon aria-hidden='true' />
          </Button>
          <Popover className='family-bar-menu-popover' placement='bottom end'>
            <Menu className='family-bar-menu'>
              {foldedActions.map(({ href, Icon, key }) => (
                <MenuItem
                  className='family-bar-menu-item'
                  href={href}
                  id={key}
                  key={key}
                >
                  <Icon aria-hidden='true' />
                  {translate(`familyBar.${key}`)}
                </MenuItem>
              ))}
            </Menu>
          </Popover>
        </MenuTrigger>
      </nav>
    </header>
  )
}
