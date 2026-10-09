import type React from 'react'

import type { ChangeLogEntry } from '@arbor/protocol/change-log'

import { laterDependents } from '@arbor/core/history/later-dependents'

import { useAuthorName } from '@/features/family-edits/use-author-name'
import { ConfirmDialog } from '@/presentation/components/confirm-dialog'
import { FailureNotice } from '@/presentation/components/failure-notice'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { EntryStory, StoryLine } from './entry-story'
import type { EntryClock } from './use-entry-clock'
import type { Undo } from './use-undo'

import './undo-dialog.sass'

type UndoDialogProps = {
  clock: EntryClock
  /** The whole log, oldest first: what depends on the chosen entries is read from it. */
  entries: readonly ChangeLogEntry[]
  onClose: () => void
  /** The entries the visitor chose to take back; `null` keeps the dialog closed. */
  revisions: readonly number[] | null
  stories: ReadonlyMap<number, EntryStory>
  undo: Undo
  wordLine: (line: StoryLine) => string
}

/**
 * Asks before taking entries back, saying what goes. When later changes build
 * on them, it lists those and offers to take everything back together.
 */
export const UndoDialog: React.FC<UndoDialogProps> = ({
  clock,
  entries,
  onClose,
  revisions,
  stories,
  undo,
  wordLine
}) => {
  const translate = useTranslate()
  const authorName = useAuthorName()
  const chosen = revisions ?? []
  const byRevision = new Map(entries.map((entry) => [entry.revision, entry]))
  const dependents =
    chosen.length === 0 ? [] : laterDependents({ entries, revisions: chosen })
  const isRedo = chosen.every(
    (revision) => byRevision.get(revision)?.cause != null
  )
  const listed = [...chosen, ...dependents]

  const close = () => {
    undo.dismissFailure()
    onClose()
  }

  const title =
    dependents.length > 0
      ? translate('history.undo.dependTitle')
      : isRedo
        ? translate('history.undo.redoTitle')
        : translate('history.undo.title', { count: chosen.length })
  const confirmLabel =
    dependents.length > 0
      ? translate('history.undo.confirmAll')
      : isRedo
        ? translate('history.undo.redoConfirm')
        : translate('history.undo.confirm')

  return (
    <ConfirmDialog
      cancelLabel={translate('history.undo.cancel')}
      confirmLabel={confirmLabel}
      isOpen={revisions !== null}
      isPending={undo.isPending}
      onCancel={close}
      onConfirm={() => undo.undo([...chosen, ...dependents], close)}
      title={title}
    >
      {dependents.length > 0 ? (
        <p>{translate('history.undo.dependBody')}</p>
      ) : null}
      <ul className='undo-dialog-entries'>
        {listed.map((revision) => {
          const entry = byRevision.get(revision)
          const firstLine = stories.get(revision)?.lines[0]
          if (entry === undefined || firstLine === undefined) return null
          return (
            <li className='undo-dialog-entry' key={revision}>
              <span className='undo-dialog-when'>
                {clock.momentOf(entry.at)}
              </span>
              <span>
                <strong>{authorName(entry.author)}</strong>{' '}
                {wordLine(firstLine)}
              </span>
            </li>
          )
        })}
      </ul>
      {dependents.length > 0 ? null : (
        <p>
          {translate(isRedo ? 'history.undo.redoBody' : 'history.undo.body')}
        </p>
      )}
      {undo.failure === null ? null : (
        <FailureNotice>
          {translate(`history.undo.failure.${undo.failure}`)}
        </FailureNotice>
      )}
    </ConfirmDialog>
  )
}
