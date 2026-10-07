import type React from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'
import { familyStateOfSnapshot } from '@arbor/core/family/family-state-of-snapshot'

import { ONLOOKER } from '@/features/family-access/family-access'
import { rememberedMe } from '@/features/family-access/remembered-families'
import { PersonSearch } from '@/features/family-tree/person-search'
import { slotNumbersOf } from '@/features/family-tree/slot-numbers'
import { TreeCanvas } from '@/features/family-tree/tree-canvas'
import {
  firstFocusId,
  TREE_DEPTHS,
  type TreeScope
} from '@/features/family-tree/tree-view'
import { useTreeView } from '@/features/family-tree/use-tree-view'
import { lifeYears } from '@/features/people/life-years'
import { personName } from '@/features/people/person-name'
import { today } from '@/infrastructure/clock'
import { Main } from '@/presentation/components/main'
import { monogramOf } from '@/presentation/components/monogram'
import { SegmentedControl } from '@/presentation/components/segmented-control'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { FamilyAppBar } from './family-app-bar'
import { useOpenFamily } from './family-loader'
import { listedPeople } from './family-people'

import './family-tree-page.sass'

type FamilyTreeProps = {
  family: FamilyState
  initialFocusId: EntityId
  isFocusMe: boolean
}

const FamilyTree: React.FC<FamilyTreeProps> = ({
  family,
  initialFocusId,
  isFocusMe
}) => {
  const translate = useTranslate()
  const { family: response } = useOpenFamily()
  const day = today()
  const { scene, setDepth, setFocus, setScope, view } = useTreeView({
    family,
    initialFocusId,
    isFocusMe
  })
  const focus = family.persons.get(view.focusId)
  const focusName =
    (focus === undefined ? null : personName(focus)) ??
    translate('common.unnamedPerson')
  const title =
    view.scope === 'around'
      ? translate('tree.titleAround', { name: focusName })
      : translate('tree.titleWhole')
  const people = listedPeople(response.family, day).map(
    ({ generation, isLiving, person }) => ({
      generation,
      id: person.id,
      isDeceased: !isLiving,
      monogram: monogramOf(person),
      name: personName(person) ?? translate('common.unnamedPerson'),
      years: lifeYears(person, isLiving)
    })
  )

  return (
    <Main className='family-tree-page'>
      <DocumentTitle>{`${title} — ${response.settings.name}`}</DocumentTitle>
      <div className='family-tree-head'>
        <h1 className='family-tree-title'>{title}</h1>
        <div className='family-tree-controls'>
          <SegmentedControl<TreeScope>
            label={translate('tree.scope.label')}
            onChange={setScope}
            options={[
              { label: translate('tree.scope.around'), value: 'around' },
              { label: translate('tree.scope.whole'), value: 'whole' }
            ]}
            value={view.scope}
          />
          {view.scope === 'around' ? (
            <SegmentedControl
              label={translate('tree.depth.label')}
              onChange={(depth) => setDepth(Number(depth))}
              options={TREE_DEPTHS.map((depth) => ({
                label: translate('tree.depth.option', { count: depth }),
                value: String(depth)
              }))}
              value={String(view.depth)}
            />
          ) : null}
          <PersonSearch onPick={setFocus} people={people} />
        </div>
      </div>
      <TreeCanvas
        focusId={view.focusId}
        label={title}
        onPressPerson={setFocus}
        persons={family.persons}
        scene={scene}
        slotNumbers={slotNumbersOf({
          layout: scene.layout,
          personIds: [...family.persons.keys()]
        })}
        today={day}
      />
    </Main>
  )
}

/** The family drawn as a tree: around the visitor when they are in it, else the whole family from its founders. */
export const FamilyTreePage: React.FC = () => {
  const translate = useTranslate()
  const { family: response, familyId } = useOpenFamily()
  const me = rememberedMe(familyId)
  const myPersonId =
    me !== null && me !== ONLOOKER && me.kind === 'person' ? me.personId : null
  const family = familyStateOfSnapshot(response.family)
  const focusId = firstFocusId({ family, me: myPersonId })

  return (
    <div className='family-tree-screen'>
      <FamilyAppBar />
      {focusId === null ? (
        <Main className='family-tree-empty'>
          <DocumentTitle>{`${translate('tree.titleWhole')} — ${response.settings.name}`}</DocumentTitle>
          <p>{translate('tree.empty')}</p>
        </Main>
      ) : (
        <FamilyTree
          family={family}
          initialFocusId={focusId}
          isFocusMe={focusId === myPersonId}
        />
      )}
    </div>
  )
}
