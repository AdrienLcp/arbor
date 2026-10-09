import { classNames } from '@adrienlcp/react'
import type React from 'react'
import { useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'
import { familyStateOfSnapshot } from '@arbor/core/family/family-state-of-snapshot'
import { describeKinship } from '@arbor/core/kinship/describe-kinship'
import type { KinPath } from '@arbor/core/kinship/kinship'
import { familyLineage } from '@arbor/core/tree-layout/family-lineage'

import { DemoNotice } from '@/features/demo/demo-notice'
import { personIdOfMe } from '@/features/family-access/family-access'
import {
  type Adding,
  AddRelativeDialog
} from '@/features/family-edits/add-relative-dialog'
import { useFamilyEdit } from '@/features/family-edits/use-family-edit'
import { FocusCard } from '@/features/family-tree/focus-card'
import type { PersonFace } from '@/features/family-tree/person-face'
import { PersonSearch } from '@/features/family-tree/person-search'
import { slotNumbersOf } from '@/features/family-tree/slot-numbers'
import { TreeCanvas } from '@/features/family-tree/tree-canvas'
import { TreeOutline } from '@/features/family-tree/tree-outline'
import { treeScene } from '@/features/family-tree/tree-scene'
import { TreeSpread } from '@/features/family-tree/tree-spread'
import {
  firstFocusId,
  isInTree,
  layoutOfView,
  TREE_DEPTHS,
  type TreeScope
} from '@/features/family-tree/tree-view'
import { useTreeView } from '@/features/family-tree/use-tree-view'
import { familyKinship, kinPathOf } from '@/features/kinship/family-kinship'
import { SIDE_SHEET_WIDTH } from '@/features/person-sheet/side-sheet'
import { today } from '@/infrastructure/clock'
import {
  familyTreePathFor,
  type KinshipPair,
  personSheetPathFor,
  useChildPage,
  useGoBack,
  useLitKinshipPair,
  useNavigateTo,
  useSheetPersonId
} from '@/infrastructure/router/navigation'
import {
  BOTTOM_SHEET_PEEK,
  BottomSheet
} from '@/presentation/components/bottom-sheet'
import { Button } from '@/presentation/components/button'
import { Main } from '@/presentation/components/main'
import { PHONE_SCREEN } from '@/presentation/components/phone-screen'
import { SegmentedControl } from '@/presentation/components/segmented-control'
import { Switch } from '@/presentation/components/switch'
import { useMediaQuery } from '@/presentation/components/use-media-query'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useLocale, useTranslate } from '@/presentation/i18n/i18n-context'

import { FamilyAppBar } from './family-app-bar'
import { useOpenFamily } from './family-loader'
import { MeSummary } from './me-summary'
import { usePersonFaces } from './use-person-faces'
import { useWhoAmI } from './who-am-i-provider'

import './family-tree-page.sass'

type FamilyTreeProps = {
  /** Where the tree turns when the person in its middle is put in the bin. */
  fallbackFocusId: EntityId | null
  family: FamilyState
  initialFocusId: EntityId
  isFocusMe: boolean
  /** How two people are related, traced over the whole tree. */
  litKinship: LitKinship | null
  myPersonId: EntityId | null
}

type LitKinship = { path: KinPath; relativeId: EntityId; sentence: string }

/** What the screen draws of the chosen scope: a lit path needs the whole family, the page-by-page spread is a phone's, and a phone's canvas turns around one person. */
const scopeOnScreen = ({
  isLit,
  isPhone,
  scope
}: {
  isLit: boolean
  isPhone: boolean
  scope: TreeScope
}): TreeScope => {
  if (isLit) return 'whole'
  if (isPhone) return scope === 'whole' ? 'around' : scope
  return scope === 'spread' ? 'around' : scope
}

/** The kinship the address asks the tree to light up, `null` when it names someone out of the tree or no path joins them. */
const useLitKinship = (
  family: FamilyState,
  faces: ReadonlyMap<EntityId, PersonFace>,
  myPersonId: EntityId | null
): LitKinship | null => {
  const locale = useLocale()
  const pair: KinshipPair | null = useLitKinshipPair()
  if (
    pair === null ||
    !isInTree(family, pair.personId) ||
    !isInTree(family, pair.relativeId)
  ) {
    return null
  }
  const kinship = familyKinship(family, pair)
  const path = kinPathOf(kinship)
  if (path === null) return null
  const calledName = (personId: EntityId): string => {
    const face = faces.get(personId)
    return face === undefined ? '' : face.givenNames || face.name
  }
  return {
    path,
    relativeId: pair.relativeId,
    sentence: describeKinship(kinship, {
      locale,
      person:
        pair.personId === myPersonId
          ? 'you'
          : { name: calledName(pair.personId) },
      relative:
        pair.relativeId === myPersonId
          ? 'you'
          : { name: calledName(pair.relativeId) }
    })
  }
}

const FamilyTree: React.FC<FamilyTreeProps> = ({
  fallbackFocusId,
  family,
  initialFocusId,
  isFocusMe,
  litKinship,
  myPersonId
}) => {
  const translate = useTranslate()
  const navigateTo = useNavigateTo()
  const { family: response, familyId } = useOpenFamily()
  const day = today()
  const isPhone = useMediaQuery(PHONE_SCREEN)
  const sheet = useChildPage()
  const sheetPersonId = useSheetPersonId()
  const {
    setDepth,
    setFocus,
    setHasGenerationBands,
    setScope,
    showAround,
    view
  } = useTreeView({
    fallbackFocusId,
    initialFocusId,
    isFocusMe,
    isInTree: (personId) => isInTree(family, personId),
    myPersonId,
    shownPersonId: sheetPersonId
  })
  const personIds = [...family.persons.keys()]
  const faces = usePersonFaces()
  const edit = useFamilyEdit()
  const [adding, setAdding] = useState<Adding | null>(null)
  const closeSheet = useGoBack(familyTreePathFor(familyId))
  const isSpread = isPhone && view.scope === 'spread'
  const lit = isSpread ? null : litKinship
  const focusId = lit?.relativeId ?? view.focusId
  const focus = faces.get(focusId)
  const focusSheetPath = personSheetPathFor({ familyId, personId: focusId })
  /** Touching anyone on the canvas opens their sheet, every change at hand; the tree turns to them behind it. */
  const openSheetOf = (personId: EntityId) => {
    navigateTo(personSheetPathFor({ familyId, personId }))
  }
  /** On a spread, touching the person in the middle opens their sheet; anyone else's page turns to them. */
  const turnSpreadTo = (personId: EntityId) => {
    if (personId === view.focusId) {
      openSheetOf(personId)
      return
    }
    setFocus(personId)
  }
  const focusName =
    faces.get(view.focusId)?.name ?? translate('common.unnamedPerson')
  const shownScope = scopeOnScreen({
    isLit: lit !== null,
    isPhone,
    scope: view.scope
  })
  const aroundTitle = translate('tree.titleAround', { name: focusName })
  const title =
    lit?.sentence ??
    {
      around: aroundTitle,
      list: translate('tree.outline.label'),
      spread: aroundTitle,
      whole: translate('tree.titleWhole')
    }[shownScope]
  const sheetName =
    (sheetPersonId === null ? undefined : faces.get(sheetPersonId)?.name) ??
    translate('common.unnamedPerson')
  const scopeOptions = isPhone
    ? [
        { label: translate('tree.scope.tree'), value: 'around' as const },
        { label: translate('tree.scope.page'), value: 'spread' as const },
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
    if (shownScope === 'spread') {
      return (
        <TreeSpread
          faces={faces}
          focusId={view.focusId}
          // A new page opens at its top, its parents in sight.
          key={view.focusId}
          lineage={familyLineage(family)}
          onAdd={
            edit.canEdit
              ? (relation) => edit.signFirst(() => setAdding(relation))
              : undefined
          }
          onPressPerson={turnSpreadTo}
          sheetPath={focusSheetPath}
        />
      )
    }
    const scene = treeScene({
      hasGenerationBands: view.hasGenerationBands,
      layout: layoutOfView(family, { ...view, focusId, scope: shownScope }),
      persons: family.persons
    })
    return (
      <>
        <TreeCanvas
          coveredBottomShare={sheet !== null && isPhone ? BOTTOM_SHEET_PEEK : 0}
          coveredRight={sheet !== null && !isPhone ? SIDE_SHEET_WIDTH : 0}
          focusId={focusId}
          label={title}
          litPath={lit?.path ?? null}
          onPressPerson={openSheetOf}
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
    <Main className='family-tree-page'>
      {sheet === null ? (
        <DocumentTitle>{`${title} — ${response.settings.name}`}</DocumentTitle>
      ) : null}
      <div className='family-tree-head'>
        <div className='family-tree-heading'>
          <h1 className={classNames('family-tree-title', lit && 'is-sentence')}>
            {title}
          </h1>
          <div className='family-tree-notes'>
            <DemoNotice familyId={familyId} />
            <MeSummary />
          </div>
        </div>
        <div className='family-tree-controls'>
          {lit === null ? null : (
            <Button
              onPress={() => navigateTo(familyTreePathFor(familyId))}
              variant='ghost'
            >
              {translate('kinship.clear')}
            </Button>
          )}
          {lit !== null ? null : (
            <SegmentedControl<TreeScope>
              label={translate('tree.scope.label')}
              onChange={setScope}
              options={scopeOptions}
              value={shownScope}
            />
          )}
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
          {shownScope === 'list' || isPhone ? null : (
            <Switch
              isSelected={view.hasGenerationBands}
              onChange={setHasGenerationBands}
            >
              {translate('tree.showGenerations')}
            </Switch>
          )}
          <PersonSearch onPick={showAround} people={[...faces.values()]} />
        </div>
      </div>
      <div
        className='family-tree-stage'
        style={{ '--side-sheet-width': `${SIDE_SHEET_WIDTH}px` }}
      >
        <div className='family-tree-drawing'>{drawing()}</div>
        {isPhone ? null : sheet}
      </div>
      {isPhone ? (
        <BottomSheet
          isOpen={sheet !== null}
          label={translate('sheet.title', { name: sheetName })}
          onClose={closeSheet}
        >
          {sheet}
        </BottomSheet>
      ) : null}
      {focus === undefined ? null : (
        <AddRelativeDialog
          adding={adding}
          anchor={focus}
          onChange={setAdding}
        />
      )}
    </Main>
  )
}

/** The family drawn as a tree: around the visitor when they are in it, else the whole family from its founders. */
export const FamilyTreePage: React.FC = () => {
  const translate = useTranslate()
  const { family: response } = useOpenFamily()
  const { me } = useWhoAmI()
  const myPersonId = personIdOfMe(me)
  const family = familyStateOfSnapshot(response.family)
  const sheetPersonId = useSheetPersonId()
  const faces = usePersonFaces()
  const litKinship = useLitKinship(family, faces, myPersonId)
  const arrivalFocusId = firstFocusId({ family, me: myPersonId })
  const focusId =
    sheetPersonId !== null && isInTree(family, sheetPersonId)
      ? sheetPersonId
      : arrivalFocusId

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
          fallbackFocusId={arrivalFocusId}
          family={family}
          initialFocusId={focusId}
          isFocusMe={focusId === myPersonId}
          litKinship={litKinship}
          myPersonId={myPersonId}
        />
      )}
    </div>
  )
}
