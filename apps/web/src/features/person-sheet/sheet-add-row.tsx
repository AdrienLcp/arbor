import type React from 'react'
import { Button } from 'react-aria-components'

import { AddIcon } from '@/presentation/components/icons'

import './sheet-add-row.sass'

/** The empty slot that ends a group of the sheet: touched, it adds one more relative of that kind. */
export const SheetAddRow: React.FC<{ label: string; onPress: () => void }> = ({
  label,
  onPress
}) => (
  <Button className='sheet-add-row' onPress={onPress}>
    <span aria-hidden='true' className='sheet-add-slot'>
      <AddIcon />
    </span>
    <span className='sheet-add-label'>{label}</span>
  </Button>
)
