import type React from 'react'

import { whoAmIPathFor } from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { PersonIcon } from '@/presentation/components/icons'
import { TextLink } from '@/presentation/components/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'
import { useMeLine } from './use-me-line'
import { useWhoAmI } from './who-am-i-provider'

import './me-summary.sass'

type MeSummaryProps = {
  /** Whether a visitor who never said who they are, or whose person left the tree, is invited to; the tree's head stays quiet about it. */
  invitesToSay?: boolean
}

/** Who this device's visitor said they are, and the way to change it. */
export const MeSummary: React.FC<MeSummaryProps> = ({
  invitesToSay = false
}) => {
  const translate = useTranslate()
  const { familyId } = useOpenFamily()
  const { ask } = useWhoAmI()
  const line = useMeLine()

  switch (line.kind) {
    case 'reader':
      return <p className='me-summary'>{translate('me.reader')}</p>
    case 'unsaid':
      if (!invitesToSay) return null
      return (
        <p className='me-summary'>
          <PersonIcon aria-hidden='true' className='me-summary-icon' />
          <span>
            {translate('me.nobody')}{' '}
            <Button className='me-summary-ask' onPress={ask} variant='link'>
              {translate('me.tell')}
            </Button>
          </span>
        </p>
      )
    case 'said':
      return (
        <p className='me-summary'>
          <PersonIcon aria-hidden='true' className='me-summary-icon' />
          <span>
            {line.sentence}{' '}
            <TextLink href={whoAmIPathFor(familyId)}>
              {translate('me.change')}
            </TextLink>
          </span>
        </p>
      )
    default:
      return line satisfies never
  }
}
