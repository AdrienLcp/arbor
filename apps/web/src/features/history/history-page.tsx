import type React from 'react'
import { useId, useMemo, useState } from 'react'

import type { ChangeLogEntry } from '@arbor/protocol/change-log'

import { takenBackRevisions } from '@arbor/core/history/taken-back-revisions'

import { useAuthorName } from '@/features/family-edits/use-author-name'
import { WhoFirstNotice } from '@/features/family-edits/who-first-notice'
import { FamilyAppBar } from '@/features/family-pages/family-app-bar'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import { usePersonFaces } from '@/features/family-pages/use-person-faces'
import {
  familyBinPathFor,
  familyHistoryPathFor,
  familyPathFor,
  Redirect,
  useHistoryPersonId
} from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { ButtonLink } from '@/presentation/components/button-link'
import { FailureNotice } from '@/presentation/components/failure-notice'
import { BinIcon, HistoryIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useLocale, useTranslate } from '@/presentation/i18n/i18n-context'

import { namesInLog, storiesOf } from './entry-story'
import { historyDays } from './history-days'
import { HistoryEntry, type TakenBackBy } from './history-entry'
import { HistoryRun } from './history-run'
import { ofName } from './of-name'
import { RestoreDialog } from './restore-dialog'
import { UndoDialog } from './undo-dialog'
import { useChangeLog } from './use-change-log'
import { useEntryClock } from './use-entry-clock'
import { useStoryWords } from './use-story-words'
import { useUndo } from './use-undo'

import './history-page.sass'

const NO_ENTRIES: readonly ChangeLogEntry[] = []

/**
 * Every change of the family, newest first, by day and by who made it, in
 * plain sentences; or only those about one person. Anyone with the family
 * link takes a change back from here.
 */
export const HistoryPage: React.FC = () => {
  const translate = useTranslate()
  const locale = useLocale()
  const titleId = useId()
  const { family, familyId } = useOpenFamily()
  const personId = useHistoryPersonId()
  const isReader = family.role === 'reader'
  const { log, retry } = useChangeLog({ isWanted: !isReader })
  const entries = log.status === 'loaded' ? log.entries : NO_ENTRIES
  const stories = useMemo(() => storiesOf(entries), [entries])
  const names = useMemo(() => namesInLog(entries), [entries])
  const byRevision = new Map(entries.map((entry) => [entry.revision, entry]))
  const clock = useEntryClock()
  const wordLine = useStoryWords(byRevision)
  const authorName = useAuthorName()
  const faces = usePersonFaces()
  const undo = useUndo()
  const [choosing, setChoosing] = useState<readonly number[] | null>(null)
  const [restoringTo, setRestoringTo] = useState<number | null>(null)

  if (isReader) return <Redirect to={familyPathFor(familyId)} />

  const takenBack = takenBackRevisions(entries)
  const shown =
    personId === null
      ? entries
      : entries.filter((entry) =>
          stories.get(entry.revision)?.personIds.has(personId)
        )
  const days = historyDays({ dayKeyOf: clock.dayKeyOf, entries: shown })
  const personName =
    personId === null
      ? null
      : (names.get(personId) ?? translate('common.unnamedPerson'))
  const title =
    personName === null
      ? translate('history.title')
      : translate('history.personTitle', {
          ofName: ofName(locale, personName)
        })
  const binCount = family.family.binnedPersonIds.length

  const canUndo = (entry: ChangeLogEntry): boolean =>
    undo.author !== null &&
    !takenBack.has(entry.revision) &&
    (entry.cause?.kind !== 'restore' || family.role === 'keeper')
  const lastRevision = entries.at(-1)?.revision ?? 0
  const canRestore = (entry: ChangeLogEntry): boolean =>
    undo.author !== null &&
    family.role === 'keeper' &&
    entry.revision < lastRevision
  const takenBackBy = (entry: ChangeLogEntry): TakenBackBy | null => {
    const by = byRevision.get(takenBack.get(entry.revision) ?? -1)
    return by === undefined
      ? null
      : { moment: clock.momentOf(by.at), name: authorName(by.author) }
  }

  return (
    <>
      <FamilyAppBar />
      <Main aria-labelledby={titleId} className='history-page'>
        <DocumentTitle>{`${title} — ${family.settings.name}`}</DocumentTitle>
        <div className='history-head'>
          <h1 className='history-title' id={titleId}>
            {title}
          </h1>
          <p className='history-intro'>
            {personName === null
              ? translate('history.intro')
              : translate('history.onlyPerson', { name: personName })}
          </p>
          <div className='history-links'>
            {personId === null ? null : (
              <ButtonLink
                href={familyHistoryPathFor({ familyId })}
                variant='link'
              >
                <HistoryIcon aria-hidden='true' />
                {translate('history.allHistory')}
              </ButtonLink>
            )}
            <ButtonLink href={familyBinPathFor(familyId)} variant='link'>
              <BinIcon aria-hidden='true' />
              {binCount === 0
                ? translate('familyHome.bin')
                : translate('history.binWith', { count: binCount })}
            </ButtonLink>
          </div>
          {undo.author === null ? <WhoFirstNotice /> : null}
        </div>
        {log.status === 'loading' ? (
          <p className='history-status' role='status'>
            {translate('history.loading')}
          </p>
        ) : null}
        {log.status === 'failed' ? (
          <div className='history-status'>
            <FailureNotice>{translate('history.failed')}</FailureNotice>
            <Button onPress={retry} variant='ghost'>
              {translate('history.retry')}
            </Button>
          </div>
        ) : null}
        {log.status === 'loaded' && days.length === 0 ? (
          <p className='history-status'>
            {translate('history.nothingForPerson')}
          </p>
        ) : null}
        {days.map(({ dayKey, runs }) => (
          <section
            aria-labelledby={`${titleId}-${dayKey}`}
            className='history-day'
            key={dayKey}
          >
            <h2 className='history-day-title' id={`${titleId}-${dayKey}`}>
              {clock.dayLabelOf(dayKey)}
            </h2>
            <ol className='history-runs'>
              {runs.map((run) => {
                const undoable = run.entries.filter(canUndo)
                return (
                  <HistoryRun
                    authorFace={
                      run.author.kind === 'person'
                        ? faces.get(run.author.personId)
                        : undefined
                    }
                    authorName={authorName(run.author)}
                    key={run.entries[0]?.revision}
                    onUndoAll={() =>
                      setChoosing(undoable.map(({ revision }) => revision))
                    }
                    undoableCount={undoable.length}
                  >
                    {run.entries.map((entry) => (
                      <HistoryEntry
                        entry={entry}
                        key={entry.revision}
                        lines={stories.get(entry.revision)?.lines ?? []}
                        onRestore={
                          canRestore(entry)
                            ? () => setRestoringTo(entry.revision)
                            : null
                        }
                        onUndo={
                          canUndo(entry)
                            ? () => setChoosing([entry.revision])
                            : null
                        }
                        takenBackBy={takenBackBy(entry)}
                        time={clock.timeOf(entry.at)}
                        wordLine={wordLine}
                      />
                    ))}
                  </HistoryRun>
                )
              })}
            </ol>
          </section>
        ))}
        <UndoDialog
          clock={clock}
          entries={entries}
          onClose={() => setChoosing(null)}
          revisions={choosing}
          stories={stories}
          undo={undo}
          wordLine={wordLine}
        />
        <RestoreDialog
          clock={clock}
          entries={entries}
          onClose={() => setRestoringTo(null)}
          revision={restoringTo}
          undo={undo}
        />
      </Main>
    </>
  )
}
