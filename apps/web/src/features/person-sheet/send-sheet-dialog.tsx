import type React from 'react'
import { useId, useState } from 'react'

import type { PersonFace } from '@/features/family-tree/person-face'
import { PortraitImage } from '@/features/photos/portrait-image'
import {
  canShareLinks,
  copyText,
  selectContents,
  shareLink
} from '@/infrastructure/browser'
import { Button } from '@/presentation/components/button'
import { FormDialog } from '@/presentation/components/form-dialog'
import {
  CheckIcon,
  CopyIcon,
  PersonIcon,
  PreviousIcon,
  QrCodeIcon,
  SendIcon
} from '@/presentation/components/icons'
import { MiniSticker } from '@/presentation/components/mini-sticker'
import { QrCode } from '@/presentation/components/qr-code'
import { TextAreaField } from '@/presentation/components/text-area-field'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './send-sheet-dialog.sass'

type CopyOutcome = 'copied' | 'idle' | 'refused'

type SendSheetDialogProps = {
  face: PersonFace
  familyName: string
  isOpen: boolean
  /** The sheet's address with the family key: it opens the tree with this sheet already open. */
  link: string
  onClose: () => void
}

type SendSheetStepsProps = Omit<SendSheetDialogProps, 'isOpen' | 'onClose'>

const WayLabel: React.FC<{ hint: string; title: string }> = ({
  hint,
  title
}) => (
  <span className='send-way-words'>
    <span className='send-way-title'>{title}</span>
    <span className='send-way-hint'>{hint}</span>
  </span>
)

/** The message as it will land, then the ways to send it; a QR code in place of both for a phone at the same table. */
const SendSheetSteps: React.FC<SendSheetStepsProps> = ({
  face,
  familyName,
  link
}) => {
  const translate = useTranslate()
  const previewId = useId()
  const waysId = useId()
  const name = face.givenNames || face.name
  const [message, setMessage] = useState(() =>
    translate('sheet.send.message', { name })
  )
  const [isShowingQrCode, setIsShowingQrCode] = useState(false)
  const [copyOutcome, setCopyOutcome] = useState<CopyOutcome>('idle')
  const canSend = canShareLinks()
  const messageWithLink = `${message.trim()}\n${link}`

  const send = async (): Promise<void> => {
    await shareLink({
      text: message.trim(),
      title: translate('sheet.send.shareTitle', { name: face.name }),
      url: link
    })
  }

  const copy = async (): Promise<void> => {
    const copied = await copyText(messageWithLink)
    if (copied.status === 'success') {
      setCopyOutcome('copied')
      return
    }
    setCopyOutcome('refused')
  }

  if (isShowingQrCode) {
    return (
      <div className='send-sheet-qr'>
        <QrCode
          label={translate('sheet.send.qrLabel', { name: face.name })}
          value={link}
        />
        <p className='send-sheet-qr-body'>
          {translate('sheet.send.qrBody', { name })}
        </p>
        <Button
          isBlock
          onPress={() => setIsShowingQrCode(false)}
          variant='ghost'
        >
          <PreviousIcon aria-hidden='true' />
          {translate('sheet.send.back')}
        </Button>
      </div>
    )
  }

  return (
    <div className='send-sheet'>
      <section aria-labelledby={previewId} className='send-sheet-preview'>
        <h3 className='send-sheet-heading' id={previewId}>
          {translate('sheet.send.preview')}
        </h3>
        <div className='send-sheet-bubble'>
          <TextAreaField
            label={translate('sheet.send.messageLabel')}
            onChange={(text) => {
              setMessage(text)
              setCopyOutcome('idle')
            }}
            value={message}
          />
          <div className='send-sheet-link-card'>
            <span className='send-sheet-mark'>
              <MiniSticker
                generation={face.generation}
                isDeceased={face.isDeceased}
                monogram={face.monogram}
                portrait={<PortraitImage photoId={face.portraitPhotoId} />}
              />
            </span>
            <span className='send-sheet-link-words'>
              <span className='send-sheet-link-title'>
                {translate('sheet.title', { name: face.name })}
              </span>
              <span className='send-sheet-link-family'>{familyName}</span>
            </span>
          </div>
        </div>
      </section>
      <section aria-labelledby={waysId} className='send-sheet-ways'>
        <h3 className='send-sheet-heading' id={waysId}>
          {translate('sheet.send.ways')}
        </h3>
        {canSend ? (
          <Button className='send-way' isBlock onPress={send}>
            <SendIcon aria-hidden='true' />
            <WayLabel
              hint={translate('sheet.send.shareHint')}
              title={translate('sheet.send.share')}
            />
          </Button>
        ) : null}
        <Button
          className='send-way'
          isBlock
          onPress={copy}
          variant={canSend ? 'ghost' : 'primary'}
        >
          {copyOutcome === 'copied' ? (
            <CheckIcon aria-hidden='true' />
          ) : (
            <CopyIcon aria-hidden='true' />
          )}
          <WayLabel
            hint={translate('sheet.send.copyHint')}
            title={translate('sheet.send.copy')}
          />
        </Button>
        <p className='send-sheet-status' role='status'>
          {copyOutcome === 'copied' ? translate('sheet.send.copied') : null}
          {copyOutcome === 'refused'
            ? translate('sheet.send.copyRefused')
            : null}
        </p>
        {copyOutcome === 'refused' ? (
          <p
            className='send-sheet-to-copy'
            ref={(element) => {
              if (element !== null) selectContents(element)
            }}
          >
            {messageWithLink}
          </p>
        ) : null}
        <Button
          className='send-way'
          isBlock
          onPress={() => setIsShowingQrCode(true)}
          variant='ghost'
        >
          <QrCodeIcon aria-hidden='true' />
          <WayLabel
            hint={translate('sheet.send.qrHint')}
            title={translate('sheet.send.qr')}
          />
        </Button>
        <p className='send-sheet-note'>
          <PersonIcon aria-hidden='true' />
          {translate('sheet.send.note')}
        </p>
      </section>
    </div>
  )
}

/** Hands a person's sheet to a relative: on a computer a panel over the tree, on a phone the whole screen. */
export const SendSheetDialog: React.FC<SendSheetDialogProps> = ({
  isOpen,
  onClose,
  ...steps
}) => {
  const translate = useTranslate()
  const name = steps.face.givenNames || steps.face.name

  return (
    <FormDialog
      closeLabel={translate('sheet.close')}
      isOpen={isOpen}
      onClose={onClose}
      title={translate('sheet.send.title', { name })}
    >
      <SendSheetSteps {...steps} />
    </FormDialog>
  )
}
