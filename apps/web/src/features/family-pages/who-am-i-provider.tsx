import { createSafeContext } from '@adrienlcp/react'
import type React from 'react'
import { useState } from 'react'

import type { Author } from '@arbor/protocol/change-log'

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
  /** Who signs the visitor's changes; `null` until they say who they are, or while they only look. */
  author: Author | null
  /** The visitor's answer to "Who are you?", `null` before they gave one. */
  me: FamilyAccess['me']
  /** Remembers the visitor's answer on this device; every screen of the family follows it at once. */
  remember: (me: NonNullable<FamilyAccess['me']>) => void
  /** Runs `then` at once for a visitor who signs their changes; anyone else is asked who they are first, then it runs. */
  signFirst: (then: () => void) => void
}

export const [WhoAmIContext, useWhoAmI] =
  createSafeContext<WhoAmI>('WhoAmIProvider')

/** Why the question is on screen: on its own, or before the change the visitor asked for. */
type Asking = { kind: 'offered' } | { kind: 'before_edit'; then: () => void }

type WhoAmIProviderProps = { children: React.ReactNode }

/**
 * Who this device's visitor is in the open family. A shared link opens on the
 * tree: the question comes only before the first change, which it signs.
 */
export const WhoAmIProvider: React.FC<WhoAmIProviderProps> = ({ children }) => {
  const translate = useTranslate()
  const { familyId } = useOpenFamily()
  const [me, setMe] = useState(() => rememberedMe(familyId))
  const [asking, setAsking] = useState<Asking>({ kind: 'offered' })
  const [isAsking, setIsAsking] = useState(false)
  const author = signingAuthor(me)

  const remember = (chosen: NonNullable<FamilyAccess['me']>) => {
    rememberMe(familyId, chosen)
    setMe(chosen)
  }

  const askFor = (reason: Asking) => {
    setAsking(reason)
    setIsAsking(true)
  }

  const signFirst = (then: () => void) => {
    if (author !== null) {
      then()
      return
    }
    askFor({ kind: 'before_edit', then })
  }

  const answer = (chosen: Author) => {
    remember(chosen)
    setIsAsking(false)
    if (asking.kind === 'before_edit') asking.then()
  }

  return (
    <WhoAmIContext
      value={{
        ask: () => askFor({ kind: 'offered' }),
        author,
        me,
        remember,
        signFirst
      }}
    >
      {children}
      <FormDialog
        closeLabel={translate('edit.cancel')}
        isOpen={isAsking}
        onClose={() => setIsAsking(false)}
        title={translate(
          asking.kind === 'before_edit' ? 'whoAmI.beforeEdit' : 'whoAmI.title'
        )}
      >
        <div className='who-am-i-dialog'>
          <p className='who-am-i-dialog-intro'>{translate('whoAmI.intro')}</p>
          <WhoAmIChoices myPersonId={personIdOfMe(me)} onChoose={answer} />
        </div>
      </FormDialog>
    </WhoAmIContext>
  )
}
