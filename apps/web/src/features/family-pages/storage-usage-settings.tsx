import type React from 'react'

import type { StorageUsage } from '@arbor/protocol/routes'

import { Meter } from '@/presentation/components/meter'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './settings-section.sass'

/** From this share of the limit, the keeper is told before photos start being refused. */
const NEAR_LIMIT_SHARE = 0.8
const BYTES_PER_MEGABYTE = 1_000_000

/** How much room the family's tree and photos take on the free plan. */
export const StorageUsageSettings: React.FC<{ usage: StorageUsage }> = ({
  usage: { limitBytes, usedBytes }
}) => {
  const translate = useTranslate()
  const isNearLimit = usedBytes >= limitBytes * NEAR_LIMIT_SHARE

  return (
    <div className='settings-item'>
      <h3 className='settings-item-title'>
        {translate('familySettings.usage.title')}
      </h3>
      <Meter
        isNearLimit={isNearLimit}
        label={translate('familySettings.usage.label')}
        maxValue={limitBytes}
        value={usedBytes}
        valueLabel={translate('familySettings.usage.value', {
          limit: limitBytes / BYTES_PER_MEGABYTE,
          used: usedBytes / BYTES_PER_MEGABYTE
        })}
      />
      {isNearLimit ? (
        <p className='settings-item-body'>
          {translate('familySettings.usage.nearLimit')}
        </p>
      ) : null}
    </div>
  )
}
