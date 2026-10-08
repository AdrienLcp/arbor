import type React from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { PersonFace } from '@/features/family-tree/person-face'
import { PersonSearch } from '@/features/family-tree/person-search'
import { ChoiceList } from '@/presentation/components/choice-list'
import { MiniSticker } from '@/presentation/components/mini-sticker'
import { SegmentedControl } from '@/presentation/components/segmented-control'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { isShopPaper, PAPER_CHOICES, type PaperChoice } from './paper-choice'
import type { Orientation } from './print-pages'
import { PRINT_DEPTHS, type PrintDepth } from './print-scope'

import './print-options.sass'

export type ScopeKind = 'ancestors' | 'descendants' | 'whole'

/** Everything the print is made of, as the options set it. */
export type PrintChoices = {
  depth: PrintDepth
  orientation: Orientation
  paper: PaperChoice
  personId: EntityId
  scopeKind: ScopeKind
}

type PrintOptionsProps = {
  choices: PrintChoices
  faces: ReadonlyMap<EntityId, PersonFace>
  onChange: (choices: PrintChoices) => void
}

const depthValue = (depth: PrintDepth): string => String(depth)
const depthOf = (value: string): PrintDepth =>
  PRINT_DEPTHS.find((depth) => depthValue(depth) === value) ?? 'all'

/** Who goes on the sheet and on what paper: each choice redraws the preview below at once. */
export const PrintOptions: React.FC<PrintOptionsProps> = ({
  choices,
  faces,
  onChange
}) => {
  const translate = useTranslate()
  const person = faces.get(choices.personId)
  const change = (changed: Partial<PrintChoices>) =>
    onChange({ ...choices, ...changed })

  return (
    <div className='print-options'>
      <div className='print-option-group'>
        <ChoiceList<ScopeKind>
          label={translate('print.scope.label')}
          onChange={(scopeKind) => change({ scopeKind })}
          options={[
            { label: translate('print.scope.whole'), value: 'whole' },
            { label: translate('print.scope.ancestors'), value: 'ancestors' },
            {
              label: translate('print.scope.descendants'),
              value: 'descendants'
            }
          ]}
          value={choices.scopeKind}
        />
        {choices.scopeKind === 'whole' ? null : (
          <div className='print-option-person'>
            {person === undefined ? null : (
              <p className='print-chosen-person'>
                <MiniSticker
                  generation={person.generation}
                  isDeceased={person.isDeceased}
                  monogram={person.monogram}
                />
                <span className='print-chosen-text'>
                  <span className='print-chosen-name'>{person.name}</span>
                  {person.years === '' ? null : (
                    <span className='print-chosen-years'>{person.years}</span>
                  )}
                </span>
              </p>
            )}
            <PersonSearch
              label={translate('print.scope.other')}
              onPick={(personId) => change({ personId })}
              people={[...faces.values()]}
            />
            <SegmentedControl
              label={translate('print.scope.depth')}
              onChange={(value) => change({ depth: depthOf(value) })}
              options={PRINT_DEPTHS.map((depth) => ({
                label:
                  depth === 'all'
                    ? translate('print.scope.allGenerations')
                    : String(depth),
                value: depthValue(depth)
              }))}
              value={depthValue(choices.depth)}
            />
          </div>
        )}
      </div>
      <div className='print-option-group'>
        <ChoiceList<PaperChoice>
          label={translate('print.paper.label')}
          onChange={(paper) => change({ paper })}
          options={PAPER_CHOICES.map((paper) => ({
            label: translate(`print.paper.${paper}`),
            value: paper
          }))}
          value={choices.paper}
        />
        <SegmentedControl<Orientation>
          label={translate('print.orientation.label')}
          onChange={(orientation) => change({ orientation })}
          options={[
            {
              label: translate('print.orientation.landscape'),
              value: 'landscape'
            },
            {
              label: translate('print.orientation.portrait'),
              value: 'portrait'
            }
          ]}
          value={choices.orientation}
        />
        {choices.paper === 'poster' ? (
          <p className='print-option-hint'>{translate('print.posterHint')}</p>
        ) : null}
        {isShopPaper(choices.paper) ? (
          <p className='print-option-hint'>{translate('print.shopHint')}</p>
        ) : null}
      </div>
    </div>
  )
}
