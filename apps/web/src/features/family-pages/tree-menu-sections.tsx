import type React from 'react'
import { Header, MenuItem, MenuSection } from 'react-aria-components'

import { whoAmIPathFor } from '@/infrastructure/router/navigation'
import { CheckIcon, PersonIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'
import { useMeLine } from './use-me-line'
import { useWhoAmI } from './who-am-i-provider'

type ViewOption<View extends string> = { label: string; value: View }

type TreeMenuSectionsProps<View extends string> = {
  onViewChange: (view: View) => void
  view: View
  viewOptions: readonly ViewOption<View>[]
}

/** What the tree's head holds on a computer, folded into the phone's "More" menu: the ways to show the tree (none while a kinship path is lit), and who the visitor is. */
export const TreeMenuSections = <View extends string>({
  onViewChange,
  view,
  viewOptions
}: TreeMenuSectionsProps<View>): React.ReactNode => {
  const translate = useTranslate()
  const { familyId } = useOpenFamily()
  const { ask } = useWhoAmI()
  const line = useMeLine()

  const pick = (picked: unknown): void => {
    const option = viewOptions.find(({ value }) => value === picked)
    if (option !== undefined) onViewChange(option.value)
  }

  return (
    <>
      {viewOptions.length === 0 ? null : (
        <MenuSection
          className='family-bar-menu-section'
          disallowEmptySelection
          onSelectionChange={(keys) => {
            if (keys !== 'all') pick([...keys][0])
          }}
          selectedKeys={[view]}
          selectionMode='single'
        >
          <Header className='family-bar-menu-header'>
            {translate('tree.scope.label')}
          </Header>
          {viewOptions.map(({ label, value }) => (
            <MenuItem className='family-bar-menu-item' id={value} key={value}>
              <CheckIcon aria-hidden='true' className='family-bar-menu-tick' />
              {label}
            </MenuItem>
          ))}
        </MenuSection>
      )}
      {line.kind === 'reader' ? null : (
        <MenuSection className='family-bar-menu-section'>
          <MenuItem
            className='family-bar-menu-item'
            href={line.kind === 'said' ? whoAmIPathFor(familyId) : undefined}
            id='me'
            onAction={line.kind === 'said' ? undefined : ask}
            textValue={
              line.kind === 'said' ? line.sentence : translate('me.tell')
            }
          >
            <PersonIcon aria-hidden='true' />
            <span className='family-bar-menu-item-text'>
              <span>
                {line.kind === 'said' ? line.sentence : translate('me.nobody')}
              </span>
              <span className='family-bar-menu-item-hint'>
                {translate(line.kind === 'said' ? 'me.change' : 'me.tell')}
              </span>
            </span>
          </MenuItem>
        </MenuSection>
      )}
    </>
  )
}
