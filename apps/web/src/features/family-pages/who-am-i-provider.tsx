import { createSafeContext } from '@adrienlcp/react'
import type React from 'react'
import { useState } from 'react'

import type { Author, DeclaredAuthor } from '@arbor/protocol/change-log'

import {
  type FamilyAccess,
  personIdOfMe,
  signingAuthor
} from '@/features/family-access/family-access'
import {
  rememberedMe,
  rememberMe
} from '@/features/family-access/remembered-families'
import { FormDialog } from '@/presentation/components/form-dialog'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'
import { WhoAmIChoices } from './who-am-i-choices'

import './who-am-i-provider.sass'

type WhoAmI = {
  /** Asks "Who are you in this tree?" over the page, when the visitor offers to say it. */
  ask: () => void
  /** Who signs the visitor's changes: who they said they are, or someone of the family. */
  author: Author
  /** The visitor's answer to "Who are you?", `null` before they gave one. */
  me: FamilyAccess['me']
  /** Remembers the visitor's answer on this device; every screen of the family follows it at once. */
  remember: (me: NonNullable<FamilyAccess['me']>) => void
}

export const [WhoAmIContext, useWhoAmI] =
  createSafeContext<WhoAmI>('WhoAmIProvider')

type WhoAmIProviderProps = { children: React.ReactNode }

/**
 * Who this device's visitor is in the open family. The link is the
 * permission: the question is never required, only offered, and a visitor who
 * never answers signs as someone of the family.
 */
export const WhoAmIProvider: React.FC<WhoAmIProviderProps> = ({ children }) => {
  const translate = useTranslate()
  const { familyId } = useOpenFamily()
  const [me, setMe] = useState(() => rememberedMe(familyId))
  const [isAsking, setIsAsking] = useState(false)

  const remember = (chosen: NonNullable<FamilyAccess['me']>) => {
    rememberMe(familyId, chosen)
    setMe(chosen)
  }

  const answer = (chosen: DeclaredAuthor) => {
    remember(chosen)
    setIsAsking(false)
  }

  return (
    <WhoAmIContext
      value={{
        ask: () => setIsAsking(true),
        author: signingAuthor(me),
        me,
        remember
      }}
    >
      {children}
      <FormDialog
        closeLabel={translate('edit.cancel')}
        isOpen={isAsking}
        onClose={() => setIsAsking(false)}
        title={translate('whoAmI.title')}
      >
        <div className='who-am-i-dialog'>
          <WhoAmIChoices myPersonId={personIdOfMe(me)} onChoose={answer} />
        </div>
      </FormDialog>
    </WhoAmIContext>
  )
}
