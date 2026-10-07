import type React from 'react'
import { useId, useState } from 'react'

import { receivedLinkInText } from '@/features/family-access/received-link'
import { receiveFamilyLink } from '@/features/family-access/remembered-families'
import {
  familyPathFor,
  useNavigateTo
} from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { Form } from '@/presentation/components/form'
import { CameraIcon, NextIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { TextField } from '@/presentation/components/text-field'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'
import { SiteHeader } from '@/presentation/site-header'

import './open-link-page.sass'

/** A link pasted by hand — the whole message it came in will do. A QR code needs no page: the camera opens the link. */
export const OpenLinkPage: React.FC = () => {
  const translate = useTranslate()
  const navigateTo = useNavigateTo()
  const qrTitleId = useId()
  const [pasted, setPasted] = useState('')
  const [isRefused, setIsRefused] = useState(false)

  const changePasted = (text: string): void => {
    setPasted(text)
    setIsRefused(false)
  }

  const open = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const link = receivedLinkInText(pasted)

    if (link === null) {
      setIsRefused(true)
      return
    }

    receiveFamilyLink(link)
    navigateTo(familyPathFor(link.familyId))
  }

  return (
    <>
      <SiteHeader />
      <Main className='open-link-page'>
        <DocumentTitle>{`${translate('openLink.title')} — ${translate('app.name')}`}</DocumentTitle>
        <h1 className='open-link-title'>{translate('openLink.title')}</h1>
        <p className='open-link-intro'>{translate('openLink.intro')}</p>
        <Form className='open-link-form' onSubmit={open}>
          <TextField
            autoComplete='off'
            errorMessage={translate('openLink.notALink')}
            inputMode='url'
            isInvalid={isRefused}
            isRequired
            label={translate('openLink.field')}
            name='link'
            onChange={changePasted}
            value={pasted}
          />
          <Button isBlock type='submit'>
            {translate('openLink.submit')}
            <NextIcon aria-hidden='true' />
          </Button>
        </Form>
        <section aria-labelledby={qrTitleId} className='open-link-qr'>
          <CameraIcon aria-hidden='true' className='open-link-qr-icon' />
          <h2 className='open-link-qr-title' id={qrTitleId}>
            {translate('openLink.qr.title')}
          </h2>
          <p className='open-link-qr-body'>{translate('openLink.qr.body')}</p>
        </section>
      </Main>
    </>
  )
}
