import type React from 'react'

import { Button } from '@/presentation/components/button'
import { AddIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { TreeLink } from './use-tree-link'

import './tree-link-button.sass'

/** Starts the "+ Ajouter" mode; it heads the tree's zoom buttons, so it hides no sticker and costs the phone no row. */
export const TreeLinkButton: React.FC<{ link: TreeLink }> = ({ link }) => {
  const translate = useTranslate()

  return (
    <Button
      className='tree-link-open'
      isDisabled={link.current.step !== 'off'}
      onPress={link.start}
      variant='quiet'
    >
      <AddIcon aria-hidden='true' />
      {translate('link.open')}
    </Button>
  )
}
