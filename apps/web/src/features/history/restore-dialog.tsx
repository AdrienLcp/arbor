import type React from 'react'
import { useId, useMemo } from 'react'

import type { ChangeLogEntry } from '@arbor/protocol/change-log'
import type { Person } from '@arbor/protocol/person'

import { restorePreview } from '@arbor/core/history/restore-preview'

import { personName } from '@/features/people/person-name'
import { ConfirmDialog } from '@/presentation/components/confirm-dialog'
import { FailureNotice } from '@/presentation/components/failure-notice'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { EntryClock } from './use-entry-clock'
import type { Undo } from './use-undo'

import './restore-dialog.sass'

type RestoreDialogProps = {
  clock: EntryClock
  /** The whole log, oldest first: the preview replays it. */
  entries: readonly ChangeLogEntry[]
  onClose: () => void
  /** The entry the keeper chose to come back to, right after it; `null` keeps the dialog closed. */
  revision: number | null
  undo: Undo
}

type NameGroupProps = {
  /** One line per person, keyed by their id: two people may share a name. */
  lines: readonly { id: string; text: string }[]
  title: string
}

const NameGroup: React.FC<NameGroupProps> = ({ lines, title }) => {
  const titleId = useId()
  return lines.length === 0 ? null : (
    <section aria-labelledby={titleId} className='restore-dialog-group'>
      <h3 className='restore-dialog-group-title' id={titleId}>
        {title}
      </h3>
      <ul className='restore-dialog-names'>
        {lines.map(({ id, text }) => (
          <li key={id}>{text}</li>
        ))}
      </ul>
    </section>
  )
}

/**
 * Shows the keeper what coming back to a past moment does — who comes back,
 * who leaves, who gets their old details — before the whole family goes back
 * there in one entry, which can itself be taken back.
 */
export const RestoreDialog: React.FC<RestoreDialogProps> = ({
  clock,
  entries,
  onClose,
  revision,
  undo
}) => {
  const translate = useTranslate()
  const preview = useMemo(
    () => (revision === null ? null : restorePreview({ entries, revision })),
    [entries, revision]
  )
  const target = entries.find((entry) => entry.revision === revision)
  const baseRevision = entries.at(-1)?.revision ?? 0
  const changes = preview?.status === 'success' ? preview.data : null

  const nameOf = (person: Person) =>
    personName(person) ?? translate('common.unnamedPerson')
  const nameLine = (person: Person) => ({ id: person.id, text: nameOf(person) })
  const changedLine = ({ now, past }: { now: Person; past: Person }) => ({
    id: now.id,
    text:
      nameOf(now) === nameOf(past)
        ? nameOf(now)
        : translate('history.restore.renamed', {
            now: nameOf(now),
            past: nameOf(past)
          })
  })
  const isQuiet =
    changes !== null &&
    changes.back.length === 0 &&
    changes.gone.length === 0 &&
    changes.changed.length === 0 &&
    !changes.hasOtherChanges

  const close = () => {
    undo.dismissFailure()
    onClose()
  }

  return (
    <ConfirmDialog
      cancelLabel={translate('history.undo.cancel')}
      confirmLabel={translate('history.restore.confirm')}
      isOpen={revision !== null}
      isPending={undo.isPending}
      onCancel={close}
      onConfirm={() => {
        if (revision !== null) undo.restore({ baseRevision, revision }, close)
      }}
      title={translate('history.restore.title', {
        moment: target === undefined ? '' : clock.momentOf(target.at)
      })}
    >
      <p>
        {translate(isQuiet ? 'history.restore.quiet' : 'history.restore.body')}
      </p>
      {changes === null || isQuiet ? null : (
        <div className='restore-dialog-changes'>
          <NameGroup
            lines={changes.back.map(nameLine)}
            title={translate('history.restore.back', {
              count: changes.back.length
            })}
          />
          <NameGroup
            lines={changes.gone.map(nameLine)}
            title={translate('history.restore.gone', {
              count: changes.gone.length
            })}
          />
          <NameGroup
            lines={changes.changed.map(changedLine)}
            title={translate('history.restore.changed', {
              count: changes.changed.length
            })}
          />
          {changes.hasOtherChanges ? (
            <p className='restore-dialog-others'>
              {translate('history.restore.others')}
            </p>
          ) : null}
        </div>
      )}
      <p>{translate('history.restore.safe')}</p>
      {undo.failure === null ? null : (
        <FailureNotice>
          {translate(`history.undo.failure.${undo.failure}`)}
        </FailureNotice>
      )}
    </ConfirmDialog>
  )
}
