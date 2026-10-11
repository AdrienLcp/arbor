import type React from 'react'
import { useState } from 'react'

import { personSheetLinkFor } from '@arbor/protocol/family-link'

import { rememberedFamily } from '@/features/family-access/remembered-families'
import { useFamilyEdit } from '@/features/family-edits/use-family-edit'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import type { PersonFace } from '@/features/family-tree/person-face'
import { pageOrigin } from '@/infrastructure/browser'
import { Button } from '@/presentation/components/button'
import { SendIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { SendSheetDialog } from './send-sheet-dialog'

/**
 * Sends a person's sheet to a relative who can complete it. The address bar
 * cannot be copied for this — the family key is taken out of it on arrival —
 * so the link is made here, from the family link this device holds.
 */
export const SendSheetAction: React.FC<{ face: PersonFace }> = ({ face }) => {
  const translate = useTranslate()
  const { family, familyId } = useOpenFamily()
  const edit = useFamilyEdit()
  const [isOpen, setIsOpen] = useState(false)
  const familyKey = rememberedFamily(familyId).keys.contributor

  if (!edit.canEdit || familyKey === undefined) return null

  return (
    <>
      <Button
        className='send-sheet-open'
        onPress={() => setIsOpen(true)}
        variant='ghost'
      >
        <SendIcon aria-hidden='true' />
        {translate('sheet.send.open')}
      </Button>
      <SendSheetDialog
        face={face}
        familyName={family.settings.name}
        isOpen={isOpen}
        link={personSheetLinkFor({
          familyId,
          key: familyKey,
          origin: pageOrigin(),
          personId: face.id
        })}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
