import type React from 'react'

import { Button } from '@/presentation/components/button'
import { AddIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './tree-add-button.sass'

/** Opens "Add someone"; it heads the tree's zoom buttons, so it hides no sticker and costs the phone no row. */
export const TreeAddButton: React.FC<{ onPress: () => void }> = ({
  onPress
}) => {
  const translate = useTranslate()

  return (
    <Button className='tree-add-open' onPress={onPress} variant='quiet'>
      <AddIcon aria-hidden='true' />
      {translate('link.open')}
    </Button>
  )
}
