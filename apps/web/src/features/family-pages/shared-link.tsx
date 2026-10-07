import { classNames } from '@adrienlcp/react'
import type React from 'react'
import { useEffect, useId, useRef, useState } from 'react'

import {
  canShareLinks,
  copyText,
  selectContents,
  shareLink
} from '@/infrastructure/browser'
import { Button } from '@/presentation/components/button'
import {
  CheckIcon,
  CopyIcon,
  KeyIcon,
  ShareIcon
} from '@/presentation/components/icons'
import { QrCode } from '@/presentation/components/qr-code'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './shared-link.sass'

/** Long enough to read that the link was copied, short enough that a second copy says it again. */
const COPIED_SHOWN_FOR_MS = 4000

type CopyOutcome = 'copied' | 'idle' | 'refused'

type SharedLinkProps = {
  description: string
  /** The family's name, for the title the share sheet puts on the message. */
  familyName: string
  /** Draws the link as a QR code too, for a phone at the same table or a printed sheet. */
  hasQrCode?: boolean
  /** Sending this link is the view's main action. */
  isMain?: boolean
  /** The link gives more than the family should have — the keeper link: drawn apart, with no QR code. */
  isPrivate?: boolean
  title: string
  url: string
}

/** One link to hand out: what it is for, the address itself, and the ways to send it. */
export const SharedLink: React.FC<SharedLinkProps> = ({
  description,
  familyName,
  hasQrCode = false,
  isMain = false,
  isPrivate = false,
  title,
  url
}) => {
  const translate = useTranslate()
  const titleId = useId()
  const address = useRef<HTMLParagraphElement>(null)
  const [copyOutcome, setCopyOutcome] = useState<CopyOutcome>('idle')
  const canSend = canShareLinks()

  useEffect(() => {
    if (copyOutcome !== 'copied') {
      return
    }

    const timer = setTimeout(() => setCopyOutcome('idle'), COPIED_SHOWN_FOR_MS)
    return () => clearTimeout(timer)
  }, [copyOutcome])

  const copy = async (): Promise<void> => {
    const copied = await copyText(url)

    if (copied.status === 'success') {
      setCopyOutcome('copied')
      return
    }

    setCopyOutcome('refused')
    if (address.current !== null) {
      selectContents(address.current)
    }
  }

  const send = async (): Promise<void> => {
    await shareLink({
      title: translate('familyShare.sendTitle', { name: familyName }),
      url
    })
  }

  return (
    <section
      aria-labelledby={titleId}
      className={classNames('shared-link', isPrivate && 'private')}
    >
      <h2 className='shared-link-title' id={titleId}>
        {isPrivate ? <KeyIcon aria-hidden='true' /> : null}
        {title}
      </h2>
      <p className='shared-link-description'>{description}</p>
      <p className='shared-link-address' ref={address}>
        {url}
      </p>
      <div className='shared-link-actions'>
        {canSend ? (
          <Button onPress={send} variant={isMain ? 'primary' : 'ghost'}>
            <ShareIcon aria-hidden='true' />
            {translate('familyShare.send')}
          </Button>
        ) : null}
        <Button
          onPress={copy}
          variant={isMain && !canSend ? 'primary' : 'ghost'}
        >
          {copyOutcome === 'copied' ? (
            <CheckIcon aria-hidden='true' />
          ) : (
            <CopyIcon aria-hidden='true' />
          )}
          {translate('familyShare.copy')}
        </Button>
      </div>
      <p className='shared-link-status' role='status'>
        {copyOutcome === 'copied' ? translate('familyShare.copied') : null}
        {copyOutcome === 'refused'
          ? translate('familyShare.copyRefused')
          : null}
      </p>
      {hasQrCode ? (
        <QrCode
          label={translate('familyShare.qrLabel', { link: title })}
          value={url}
        />
      ) : null}
    </section>
  )
}
