import type React from 'react'
import { createElement, Fragment, useId } from 'react'

import { FAMILIES_STORAGE_KEY } from '@/features/family-access/family-access-storage'
import { Main } from '@/presentation/components/main'
import { TextLink } from '@/presentation/components/text-link'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useLocale, useTranslate } from '@/presentation/i18n/i18n-context'
import { SiteHeader } from '@/presentation/site-header'
import { THEME_STORAGE_KEY } from '@/presentation/theme/theme-store'

import {
  CNIL_COMPLAINT_HREF,
  HOST,
  LOG_RETENTION_DAYS,
  PUBLISHER
} from './legal-details'

import './legal-page.sass'

/** Spreads what `translate.rich` returned as children, so React asks none of the parts for a key. */
const RichText: React.FC<{ parts: readonly React.ReactNode[] }> = ({ parts }) =>
  createElement(Fragment, null, ...parts)

type LegalSectionProps = {
  children: React.ReactNode
  heading: string
}

const LegalSection: React.FC<LegalSectionProps> = ({ children, heading }) => {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className='legal-section'>
      <h2 className='legal-heading' id={headingId}>
        {heading}
      </h2>
      {children}
    </section>
  )
}

const SERVER_RECORDS = ['people', 'photos', 'history', 'links'] as const

/**
 * The French LCEN's legal notice and the privacy policy, on one page every
 * footer links to: who publishes Arbor, what it keeps about the people in a
 * tree, for how long, and how to have it erased.
 */
export const LegalPage: React.FC = () => {
  const translate = useTranslate()
  const locale = useLocale()
  const contactHref = PUBLISHER.contactHrefFor[locale]

  const contactLink = (children: string): React.ReactNode => (
    <TextLink href={contactHref}>{children}</TextLink>
  )
  const cnilLink = (children: string): React.ReactNode => (
    <TextLink href={CNIL_COMPLAINT_HREF}>{children}</TextLink>
  )

  return (
    <>
      <SiteHeader />
      <Main className='legal-page'>
        <DocumentTitle>{`${translate('legal.title')} — ${translate('app.name')}`}</DocumentTitle>
        <div className='legal-document'>
          <h1 className='legal-title'>{translate('legal.title')}</h1>
          <p className='legal-intro'>{translate('legal.intro')}</p>

          <LegalSection heading={translate('legal.publisher.heading')}>
            <p>
              <RichText
                parts={translate.rich('legal.publisher.body', {
                  contact: contactLink,
                  name: PUBLISHER.name
                })}
              />
            </p>
            <p>{translate('legal.publisher.address')}</p>
          </LegalSection>

          <LegalSection heading={translate('legal.host.heading')}>
            <p>{translate('legal.host.body')}</p>
            <address className='host-address'>
              {[HOST.name, ...HOST.addressLines].map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          </LegalSection>

          <LegalSection heading={translate('legal.server.heading')}>
            <p>{translate('legal.server.body')}</p>
            <ul className='legal-list'>
              {SERVER_RECORDS.map((record) => (
                <li key={record}>{translate(`legal.server.${record}`)}</li>
              ))}
            </ul>
            <p>{translate('legal.server.retention')}</p>
            <p>{translate('legal.server.bin')}</p>
            <p>{translate('legal.server.noExpiry')}</p>
            <p>{translate('legal.server.demo')}</p>
            <p>
              {translate('legal.server.logs', {
                days: String(LOG_RETENTION_DAYS)
              })}
            </p>
          </LegalSection>

          <LegalSection heading={translate('legal.people.heading')}>
            <p>{translate('legal.people.responsibility')}</p>
            <p>{translate('legal.people.readers')}</p>
            <p>
              <RichText
                parts={translate.rich('legal.people.removal', {
                  contact: contactLink
                })}
              />
            </p>
            <p>{translate('legal.people.deletion')}</p>
          </LegalSection>

          <LegalSection heading={translate('legal.device.heading')}>
            <p>{translate('legal.device.body')}</p>
            <dl className='stored-keys'>
              <dt>
                <code>{THEME_STORAGE_KEY}</code>
              </dt>
              <dd>{translate('legal.device.theme')}</dd>
              <dt>
                <code>{FAMILIES_STORAGE_KEY}</code>
              </dt>
              <dd>{translate('legal.device.families')}</dd>
            </dl>
          </LegalSection>

          <LegalSection heading={translate('legal.thirdParties.heading')}>
            <p>{translate('legal.thirdParties.body')}</p>
            <p>{translate('legal.thirdParties.sharing')}</p>
          </LegalSection>

          <LegalSection heading={translate('legal.measurement.heading')}>
            <p>{translate('legal.measurement.body')}</p>
          </LegalSection>

          <LegalSection heading={translate('legal.rights.heading')}>
            <p>
              <RichText
                parts={translate.rich('legal.rights.body', {
                  contact: contactLink
                })}
              />
            </p>
            <p>
              <RichText
                parts={translate.rich('legal.rights.complaint', {
                  authority: cnilLink
                })}
              />
            </p>
          </LegalSection>
        </div>
      </Main>
    </>
  )
}
