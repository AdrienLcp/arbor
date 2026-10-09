import type React from 'react'

import type { PersonFace } from '@/features/family-tree/person-face'
import { Button } from '@/presentation/components/button'
import { PersonIcon, UndoIcon } from '@/presentation/components/icons'
import { MiniSticker } from '@/presentation/components/mini-sticker'
import { useTranslate } from '@/presentation/i18n/i18n-context'

type HistoryRunProps = {
  authorName: string
  /** The signer's sticker, `undefined` when they are not in the tree: an empty outline stands in. */
  authorFace: PersonFace | undefined
  /** The run's entries, newest first. */
  children: React.ReactNode
  /** How many of its entries can still be taken back together; the button shows from two. */
  undoableCount: number
  onUndoAll: () => void
}

/** Changes one person made one after the other, under their signature. */
export const HistoryRun: React.FC<HistoryRunProps> = ({
  authorFace,
  authorName,
  children,
  onUndoAll,
  undoableCount
}) => {
  const translate = useTranslate()

  return (
    <li className='history-run'>
      <div className='history-run-head'>
        {authorFace === undefined ? (
          <span aria-hidden='true' className='history-run-ghost'>
            <PersonIcon />
          </span>
        ) : (
          <MiniSticker
            generation={authorFace.generation}
            isDeceased={authorFace.isDeceased}
            monogram={authorFace.monogram}
          />
        )}
        <p className='history-run-author'>{authorName}</p>
        {undoableCount < 2 ? null : (
          <Button
            className='history-run-undo'
            onPress={onUndoAll}
            variant='link'
          >
            <UndoIcon aria-hidden='true' />
            {translate('history.undo.allOfRun', { count: undoableCount })}
          </Button>
        )}
      </div>
      <ol className='history-run-entries'>{children}</ol>
    </li>
  )
}
