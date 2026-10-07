import type React from 'react'
import { useId, useState } from 'react'

import { FailureNotice } from '@/presentation/components/failure-notice'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { FamilyLinkSettings } from './family-link-settings'
import { useOpenFamily } from './family-loader'
import { NewKeeperSettings } from './new-keeper-settings'
import { ReaderLinkSettings } from './reader-link-settings'
import { StorageUsageSettings } from './storage-usage-settings'
import { useKeeperOverview } from './use-keeper-overview'

import './settings-section.sass'

/** The settings that read the keeper's overview: remounted to load it again after a change. */
const OverviewSettings: React.FC<{ onChanged: () => void }> = ({
  onChanged
}) => {
  const translate = useTranslate()
  const { familyId, key } = useOpenFamily()
  const overview = useKeeperOverview({ familyId, key })

  if (overview === 'loading') {
    return (
      <p className='settings-item-body' role='status'>
        {translate('familySettings.loading')}
      </p>
    )
  }

  if (overview === 'failed') {
    return <FailureNotice>{translate('common.failed')}</FailureNotice>
  }

  return (
    <>
      <ReaderLinkSettings keys={overview.keys} onChanged={onChanged} />
      <StorageUsageSettings usage={overview.usage} />
    </>
  )
}

/** What only a keeper can do: replace the family link, hand out other links, watch the room the family takes. */
export const KeeperSettings: React.FC = () => {
  const translate = useTranslate()
  const titleId = useId()
  const [overviewRevision, setOverviewRevision] = useState(0)

  return (
    <section aria-labelledby={titleId} className='settings-group'>
      <h2 className='settings-group-title' id={titleId}>
        {translate('familySettings.keeper.title')}
      </h2>
      <FamilyLinkSettings />
      <OverviewSettings
        key={overviewRevision}
        onChanged={() => setOverviewRevision((revision) => revision + 1)}
      />
      <NewKeeperSettings />
    </section>
  )
}
