import type React from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import { EditFailureNotice } from '@/features/family-edits/edit-failure-notice'
import { useAuthorName } from '@/features/family-edits/use-author-name'
import { useFamilyEdit } from '@/features/family-edits/use-family-edit'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import { useChangeLog } from '@/features/history/use-change-log'
import { useEntryClock } from '@/features/history/use-entry-clock'
import { familyBinPathFor } from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { ButtonLink } from '@/presentation/components/button-link'
import { BinIcon, UnbinIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { lastBinning } from './who-binned'

/**
 * A sheet opened from an old link while its person sits in the bin: who put
 * them there and when, and the way out. A reader's link cannot read the log,
 * so it keeps the plain explanation.
 */
export const BinnedSheet: React.FC<{ personId: EntityId }> = ({ personId }) => {
  const translate = useTranslate()
  const { familyId } = useOpenFamily()
  const edit = useFamilyEdit()
  const { log } = useChangeLog({ isWanted: edit.canEdit })
  const clock = useEntryClock()
  const authorName = useAuthorName()
  const binning =
    log.status === 'loaded' ? lastBinning(log.entries, personId) : null

  return (
    <>
      <p>
        {binning === null
          ? translate('sheet.missing.body')
          : translate('sheet.missing.binned', {
              moment: clock.momentOf(binning.at),
              name: authorName(binning.author)
            })}
      </p>
      {binning === null ? null : <p>{translate('bin.nothingLinked')}</p>}
      {edit.canEdit ? (
        <Button
          isPending={edit.isPending}
          onPress={() =>
            edit.signFirst(() =>
              edit.save([{ personId, type: 'person.restore' }], () => undefined)
            )
          }
        >
          <UnbinIcon aria-hidden='true' />
          {translate('binPage.restore')}
        </Button>
      ) : null}
      {edit.failure === null ? null : (
        <EditFailureNotice failure={edit.failure} />
      )}
      {edit.canEdit ? (
        <ButtonLink href={familyBinPathFor(familyId)} variant='link'>
          <BinIcon aria-hidden='true' />
          {translate('familyBar.bin')}
        </ButtonLink>
      ) : null}
    </>
  )
}
