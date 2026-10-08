import { classNames } from '@adrienlcp/react'
import type React from 'react'
import { useState } from 'react'

import type { ChangeLogEntry } from '@arbor/protocol/change-log'

import { Button } from '@/presentation/components/button'
import { RedoIcon, UndoIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { StoryLine } from './entry-story'

/** Lines an entry shows before "see the others": a big import stays one glance long. */
const LINES_AT_FIRST = 4

/** Who took an entry back, and when, already worded. */
export type TakenBackBy = { moment: string; name: string }

/** Each distinct sentence once, with how often the entry says it: three photos added read as one line. */
const sentencesOf = (
  lines: readonly StoryLine[],
  wordLine: (line: StoryLine) => string
): [sentence: string, count: number][] => {
  const counts = new Map<string, number>()
  for (const line of lines) {
    const sentence = wordLine(line)
    counts.set(sentence, (counts.get(sentence) ?? 0) + 1)
  }
  return [...counts]
}

type HistoryEntryProps = {
  entry: ChangeLogEntry
  lines: readonly StoryLine[]
  /** Offered when the visitor may take the entry back; `null` hides the button. */
  onUndo: (() => void) | null
  takenBackBy: TakenBackBy | null
  time: string
  wordLine: (line: StoryLine) => string
}

/** One change: its time, what it did in plain sentences, who took it back, and the button to take it back. */
export const HistoryEntry: React.FC<HistoryEntryProps> = ({
  entry,
  lines,
  onUndo,
  takenBackBy,
  time,
  wordLine
}) => {
  const translate = useTranslate()
  const [isOpen, setIsOpen] = useState(false)
  const sentences = sentencesOf(lines, wordLine)
  const shown = isOpen ? sentences : sentences.slice(0, LINES_AT_FIRST)
  const hiddenCount = sentences.length - shown.length
  const isTakingBack = entry.cause !== null

  return (
    <li
      className={classNames(
        'history-entry',
        takenBackBy !== null && 'taken-back',
        isTakingBack && 'takes-back'
      )}
    >
      <time className='history-entry-time' dateTime={entry.at}>
        {time}
      </time>
      <div className='history-entry-story'>
        <ul className='history-entry-lines'>
          {shown.map(([sentence, count]) => (
            <li className='history-entry-line' key={sentence}>
              {isTakingBack ? (
                <UndoIcon aria-hidden='true' className='history-entry-glyph' />
              ) : null}
              {sentence}
              {count > 1 ? (
                <span className='history-entry-times'>
                  {translate('history.times', { count })}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        {hiddenCount > 0 ? (
          <Button
            className='history-entry-more'
            onPress={() => setIsOpen(true)}
            variant='link'
          >
            {translate('history.more', { count: hiddenCount })}
          </Button>
        ) : null}
        {takenBackBy === null ? null : (
          <p className='history-entry-undone'>
            {translate('history.takenBack', takenBackBy)}
          </p>
        )}
      </div>
      {onUndo === null ? null : (
        <Button
          aria-label={translate(
            isTakingBack ? 'history.undo.redoLabel' : 'history.undo.entryLabel',
            { time }
          )}
          className='history-entry-undo'
          onPress={onUndo}
          variant='link'
        >
          {isTakingBack ? (
            <RedoIcon aria-hidden='true' />
          ) : (
            <UndoIcon aria-hidden='true' />
          )}
          {translate(isTakingBack ? 'history.undo.redo' : 'history.undo.entry')}
        </Button>
      )}
    </li>
  )
}
