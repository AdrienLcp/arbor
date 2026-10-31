import type React from 'react'

import { Button } from '@/presentation/components/button'
import { CheckIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './choose-bar.sass'

type ChooseBarProps = {
  /** What to do here, read on a computer: touch a card on the tree, untick a line in the list. */
  help: string
  hiddenCount: number
  onDone: () => void
  /** Offered on a phone over the tree, where a list of names is easier to tick than small cards. */
  onOpenList?: () => void
  onShowEveryone: () => void
  /** What the last tick did, read out as it happens. */
  sentence: string
}

/** The head of the tree while choosing who to show: what to do, how many are hidden, and the way out. */
export const ChooseBar: React.FC<ChooseBarProps> = ({
  help,
  hiddenCount,
  onDone,
  onOpenList,
  onShowEveryone,
  sentence
}) => {
  const translate = useTranslate()

  return (
    <section aria-labelledby='choose-bar-title' className='choose-bar'>
      <div className='choose-bar-text'>
        <h2 className='choose-bar-title' id='choose-bar-title'>
          {translate('tree.choose.action')}
        </h2>
        <p className='choose-bar-help'>{help}</p>
      </div>
      <div className='choose-bar-actions'>
        <p className='choose-bar-count'>
          {hiddenCount === 0
            ? translate('tree.choose.everyone')
            : translate('tree.choose.hiddenCount', { count: hiddenCount })}
        </p>
        {onOpenList === undefined ? null : (
          <Button onPress={onOpenList} variant='ghost'>
            {translate('tree.choose.inList')}
          </Button>
        )}
        <Button
          isDisabled={hiddenCount === 0}
          onPress={onShowEveryone}
          variant='ghost'
        >
          {translate('tree.choose.showAll')}
        </Button>
        <Button onPress={onDone}>
          <CheckIcon aria-hidden='true' />
          {translate('tree.choose.done')}
        </Button>
      </div>
      <p aria-live='polite' className='choose-bar-live'>
        {sentence}
      </p>
    </section>
  )
}
