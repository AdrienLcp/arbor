import type React from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'
import { familyStateOfSnapshot } from '@arbor/core/family/family-state-of-snapshot'
import { familyLineage } from '@arbor/core/tree-layout/family-lineage'

import { ONLOOKER } from '@/features/family-access/family-access'
import { rememberedMe } from '@/features/family-access/remembered-families'
import { FocusCard } from '@/features/family-tree/focus-card'
import { PersonSearch } from '@/features/family-tree/person-search'
import { slotNumbersOf } from '@/features/family-tree/slot-numbers'
import { TreeCanvas } from '@/features/family-tree/tree-canvas'
import { TreeOutline } from '@/features/family-tree/tree-outline'
import { treeScene } from '@/features/family-tree/tree-scene'
import { TreeSpread } from '@/features/family-tree/tree-spread'
import {
  firstFocusId,
  layoutOfView,
  TREE_DEPTHS,
  type TreeScope
} from '@/features/family-tree/tree-view'
import { useTreeView } from '@/features/family-tree/use-tree-view'
import { today } from '@/infrastructure/clock'
import {
  personSheetPathFor,
  useChildPage,
  useNavigateTo,
  useSheetPersonId
} from '@/infrastructure/router/navigation'
import { Main } from '@/presentation/components/main'
import { SegmentedControl } from '@/presentation/components/segmented-control'
import { useMediaQuery } from '@/presentation/components/use-media-query'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { FamilyAppBar } from './family-app-bar'
import { useOpenFamily } from './family-loader'
import { usePersonFaces } from './use-person-faces'

import './family-tree-page.sass'

/** Under the app's wide-screen breakpoint the canvas gives way to one page at a time. */
const PHONE_SCREEN = '(width < 640px)'

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
  const navigateTo = useNavigateTo()
  const { family: response, familyId } = useOpenFamily()
  const day = today()
  const isPhone = useMediaQuery(PHONE_SCREEN)
  const sheet = useChildPage()
  const sheetPersonId = useSheetPersonId()
  const { setDepth, setFocus, setScope, showAround, view } = useTreeView({
    initialFocusId,
    isFocusMe,
    shownPersonId: sheetPersonId
  })
  const personIds = [...family.persons.keys()]
  const faces = usePersonFaces()
  const focusSheetPath = personSheetPathFor({
    familyId,
    personId: view.focusId
  })
  /** Touching the person already in the middle opens their sheet; anyone else comes to the middle. */
  const pressPerson = (personId: EntityId) => {
    if (personId === view.focusId) {
      navigateTo(focusSheetPath)
      return
    }
    setFocus(personId)
  }
  const focusName =
    faces.get(view.focusId)?.name ?? translate('common.unnamedPerson')
  const shownScope: TreeScope =
    isPhone && view.scope === 'whole' ? 'around' : view.scope
  const title = {
    around: translate('tree.titleAround', { name: focusName }),
    list: translate('tree.outline.label'),
    whole: translate('tree.titleWhole')
  }[shownScope]
  const scopeOptions = isPhone
    ? [
        { label: translate('tree.scope.page'), value: 'around' as const },
        { label: translate('tree.scope.list'), value: 'list' as const }
      ]
    : [
        { label: translate('tree.scope.around'), value: 'around' as const },
        { label: translate('tree.scope.whole'), value: 'whole' as const },
        { label: translate('tree.scope.list'), value: 'list' as const }
      ]

  const drawing = () => {
    if (shownScope === 'list') {
      return (
        <TreeOutline
          faces={faces}
          lineage={familyLineage(family)}
          onPressPerson={showAround}
        />
      )
    }
    if (isPhone) {
      return (
        <TreeSpread
          faces={faces}
          focusId={view.focusId}
          // A new page opens at its top, its parents in sight.
          key={view.focusId}
          lineage={familyLineage(family)}
          onPressPerson={pressPerson}
          sheetPath={focusSheetPath}
        />
      )
    }
    const scene = treeScene({
      layout: layoutOfView(family, view),
      persons: family.persons
    })
    const focus = faces.get(view.focusId)
    return (
      <>
        <TreeCanvas
          focusId={view.focusId}
          label={title}
          onPressPerson={pressPerson}
          persons={family.persons}
          scene={scene}
          slotNumbers={slotNumbersOf({ layout: scene.layout, personIds })}
          today={day}
        />
        {focus === undefined || sheet !== null ? null : (
          <FocusCard face={focus} sheetPath={focusSheetPath} />
        )}
      </>
    )
  }

  return (
    <Main
      className='family-tree-page'
      data-sheet-open={sheet === null ? undefined : true}
    >
      {sheet === null ? (
        <DocumentTitle>{`${title} — ${response.settings.name}`}</DocumentTitle>
      ) : null}
      <div className='family-tree-head'>
        <h1 className='family-tree-title'>{title}</h1>
        <div className='family-tree-controls'>
          <SegmentedControl<TreeScope>
            label={translate('tree.scope.label')}
            onChange={setScope}
            options={scopeOptions}
            value={shownScope}
          />
          {shownScope === 'around' && !isPhone ? (
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
          <PersonSearch onPick={showAround} people={[...faces.values()]} />
        </div>
      </div>
      <div className='family-tree-stage'>
        <div className='family-tree-drawing'>{drawing()}</div>
        {sheet}
      </div>
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
  const sheetPersonId = useSheetPersonId()
  const focusId =
    sheetPersonId !== null && family.persons.has(sheetPersonId)
      ? sheetPersonId
      : firstFocusId({ family, me: myPersonId })

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
