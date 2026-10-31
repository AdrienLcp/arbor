import { classNames } from '@adrienlcp/react'
import type React from 'react'
import { useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'
import { familyStateOfSnapshot } from '@arbor/core/family/family-state-of-snapshot'
import {
  familyWarnings,
  peopleToCheck
} from '@arbor/core/family/family-warnings'
import { withoutPeople } from '@arbor/core/family/without-people'
import { describeKinship } from '@arbor/core/kinship/describe-kinship'
import type { KinPath } from '@arbor/core/kinship/kinship'
import { linkBackOf } from '@arbor/core/relatives/hidden-people'
import { unplacedPeople } from '@arbor/core/relatives/unplaced-people'
import { familyLineage } from '@arbor/core/tree-layout/family-lineage'

import { DemoNotice } from '@/features/demo/demo-notice'
import { personIdOfMe } from '@/features/family-access/family-access'
import { AddPersonDialog } from '@/features/family-edits/add-person-dialog'
import type { AddingStart, Tie } from '@/features/family-edits/tie'
import { useFamilyEdit } from '@/features/family-edits/use-family-edit'
import { FocusCard } from '@/features/family-tree/focus-card'
import type { PersonFace } from '@/features/family-tree/person-face'
import { PersonSearch } from '@/features/family-tree/person-search'
import { TreeAddButton } from '@/features/family-tree/tree-add-button'
import { TreeCanvas } from '@/features/family-tree/tree-canvas'
import { TreeOutline } from '@/features/family-tree/tree-outline'
import { treeScene } from '@/features/family-tree/tree-scene'
import { TreeSpread } from '@/features/family-tree/tree-spread'
import {
  firstFocusId,
  isInTree,
  layoutOfView,
  type TreeScope
} from '@/features/family-tree/tree-view'
import { UnplacedTray } from '@/features/family-tree/unplaced-tray'
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
import { ChooseIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { PHONE_SCREEN } from '@/presentation/components/phone-screen'
import { SegmentedControl } from '@/presentation/components/segmented-control'
import { useMediaQuery } from '@/presentation/components/use-media-query'
import { WithTooltip } from '@/presentation/components/with-tooltip'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useLocale, useTranslate } from '@/presentation/i18n/i18n-context'

import { ChooseBar } from './choose-bar'
import { FamilyAppBar } from './family-app-bar'
import { useOpenFamily } from './family-loader'
import { HiddenNote } from './hidden-note'
import { useHiddenPeople } from './hidden-people-provider'
import { MeSummary } from './me-summary'
import { TreeMenuSections } from './tree-menu-sections'
import { useHiddenPeopleWords } from './use-hidden-people-words'
import { usePersonFaces } from './use-person-faces'
import { useWhoAmI } from './who-am-i-provider'

import './family-tree-page.sass'

type FamilyTreeProps = {
  /** Where the tree turns when the person in its middle is put in the bin. */
  fallbackFocusId: EntityId | null
  /** The family as drawn: without the people this device hides, unless a kinship path or the choice of who to show needs everyone. */
  family: FamilyState
  /** Children whose other parent is hidden on this device. */
  hiddenParentChildIds: ReadonlySet<EntityId>
  initialFocusId: EntityId
  /** How two people are related, traced over the whole tree. */
  litKinship: LitKinship | null
  myPersonId: EntityId | null
}

type LitKinship = { path: KinPath; relativeId: EntityId; sentence: string }

/** What the screen draws of the chosen scope: a lit path needs the whole family, a phone's canvas turns around one person, and each screen reads generations its own way (a computer's bands, a phone's page by page). */
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
  if (isPhone) {
    if (scope === 'whole') return 'around'
    return scope === 'generations' ? 'spread' : scope
  }
  return scope === 'spread' ? 'generations' : scope
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
  hiddenParentChildIds,
  initialFocusId,
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
  const { setFocus, setScope, showAround, view } = useTreeView({
    fallbackFocusId,
    initialFocusId,
    isInTree: (personId) => isInTree(family, personId),
    myPersonId,
    // A computer's side sheet lies over the tree, which stays still beneath it; a phone's bottom sheet would hide the person touched, so the tree turns to them.
    shownPersonId: isPhone ? sheetPersonId : null,
    turnsToMe: sheetPersonId === null
  })
  const faces = usePersonFaces()
  const choice = useHiddenPeople()
  const hiddenWords = useHiddenPeopleWords(faces)
  const edit = useFamilyEdit()
  const [adding, setAdding] = useState<AddingStart | null>(null)
  /** Opens "Add someone" next to a person, the one in the middle of the tree by default. */
  const startAdding = (tie: Tie | null, personId: EntityId | null) =>
    setAdding({ anchorId: personId ?? view.focusId, tie })
  const closeSheet = useGoBack(familyTreePathFor(familyId))
  const isSpread = isPhone && view.scope === 'spread'
  const lit = isSpread ? null : litKinship
  const isChoosing = choice.isChoosing && lit === null
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
  /** The add button heads the canvas's tools: neither the list nor a page of the spread has them, nor a lit kinship, nor the choice of who to show. */
  const canAdd =
    edit.canEdit &&
    lit === null &&
    !isChoosing &&
    shownScope !== 'list' &&
    shownScope !== 'spread'

  const aroundTitle = translate('tree.titleAround', { name: focusName })
  const title =
    lit?.sentence ??
    {
      around: aroundTitle,
      generations: translate('tree.titleWhole'),
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
        {
          label: translate('tree.scope.generations'),
          value: 'generations' as const
        },
        { label: translate('tree.scope.list'), value: 'list' as const }
      ]

  /** A phone's page of the spread has no ticks: choosing starts on the list. */
  const startChoosing = () => {
    if (shownScope === 'spread') setScope('list')
    choice.startChoosing()
  }
  /** Picking someone hidden in the search shows them again, with their link to the tree. */
  const pickPerson = (personId: EntityId) => {
    if (choice.hidden.hiddenIds.has(personId)) choice.toggle(personId)
    showAround(personId)
  }
  const carriedLineOf = (personId: EntityId): string | null =>
    choice.hidden.carriedIds.has(personId)
      ? translate('tree.choose.carriedBy', {
          names: hiddenWords.namesOf(
            linkBackOf(familyLineage(family), choice.hidden, personId)
          )
        })
      : null
  const chooseTool =
    isPhone && lit === null && !isChoosing ? (
      <WithTooltip label={translate('tree.choose.action')} placement='top'>
        <Button
          aria-label={translate('tree.choose.action')}
          onPress={startChoosing}
          variant='quiet'
        >
          <ChooseIcon aria-hidden='true' />
        </Button>
      </WithTooltip>
    ) : null

  const drawing = () => {
    if (shownScope === 'list') {
      return (
        <TreeOutline
          choosing={
            isChoosing
              ? {
                  carriedLineOf,
                  hiddenIds: choice.hidden.hiddenIds,
                  onToggle: choice.toggle
                }
              : null
          }
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
            edit.canEdit ? (relation) => startAdding(relation, null) : undefined
          }
          onPressPerson={turnSpreadTo}
          sheetPath={focusSheetPath}
        />
      )
    }
    const scene = treeScene({
      hasGenerationBands: shownScope === 'generations',
      layout: layoutOfView(family, { ...view, focusId, scope: shownScope }),
      persons: family.persons
    })
    return (
      <>
        <TreeCanvas
          addTool={
            <>
              {canAdd ? (
                <TreeAddButton onPress={() => startAdding(null, focusId)} />
              ) : null}
              {chooseTool}
            </>
          }
          coveredBottomShare={sheet !== null && isPhone ? BOTTOM_SHEET_PEEK : 0}
          focusId={focusId}
          hiddenParentChildIds={hiddenParentChildIds}
          hiddenWhileChoosing={isChoosing ? choice.hidden.hiddenIds : null}
          label={title}
          litPath={lit?.path ?? null}
          onPressPerson={isChoosing ? choice.toggle : openSheetOf}
          onPressUnknownParent={
            edit.canEdit
              ? (childId) => startAdding('parent', childId)
              : undefined
          }
          openPersonId={sheetPersonId}
          peopleToCheck={peopleToCheck(familyWarnings(family))}
          persons={family.persons}
          scene={scene}
          today={day}
          wholeTreeView={
            shownScope === 'whole' || shownScope === 'generations'
              ? shownScope
              : null
          }
        />
        {focus === undefined || sheet !== null || isChoosing ? null : (
          <FocusCard face={focus} sheetPath={focusSheetPath} />
        )}
      </>
    )
  }

  return (
    <>
      <FamilyAppBar
        menuSections={
          <TreeMenuSections
            onChoose={lit === null && !isChoosing ? startChoosing : undefined}
            onViewChange={setScope}
            view={shownScope}
            // A lit kinship path is drawn on the whole family: its head offers only to clear it.
            viewOptions={lit === null ? scopeOptions : []}
          />
        }
      />
      <Main className='family-tree-page'>
        {sheet === null ? (
          <DocumentTitle>{`${title} — ${response.settings.name}`}</DocumentTitle>
        ) : null}
        <div className='family-tree-head'>
          <div className='family-tree-heading'>
            <h1
              className={classNames('family-tree-title', lit && 'is-sentence')}
            >
              {title}
            </h1>
            <div className='family-tree-notes'>
              <DemoNotice familyId={familyId} />
              {isChoosing || lit !== null ? null : (
                <HiddenNote
                  count={choice.hidden.hiddenIds.size}
                  onChoose={startChoosing}
                />
              )}
              <MeSummary />
            </div>
          </div>
          {isChoosing ? (
            <ChooseBar
              help={translate(
                shownScope === 'list'
                  ? 'tree.choose.helpList'
                  : 'tree.choose.help'
              )}
              hiddenCount={choice.hidden.hiddenIds.size}
              onDone={choice.stopChoosing}
              onOpenList={
                isPhone && shownScope !== 'list'
                  ? () => setScope('list')
                  : undefined
              }
              onShowEveryone={choice.showEveryone}
              sentence={hiddenWords.sentenceOf(choice.lastChange)}
            />
          ) : (
            <>
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
                <PersonSearch
                  onPick={pickPerson}
                  people={[...faces.values()]}
                />
                {lit === null ? (
                  <Button
                    className='family-tree-choose'
                    onPress={startChoosing}
                    variant='ghost'
                  >
                    <ChooseIcon aria-hidden='true' />
                    {translate('tree.choose.action')}
                  </Button>
                ) : null}
              </div>
              <UnplacedTray
                faces={faces}
                onPressPerson={openSheetOf}
                personIds={unplacedPeople(family)}
              />
            </>
          )}
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
        <AddPersonDialog onClose={() => setAdding(null)} start={adding} />
      </Main>
    </>
  )
}

/** The family drawn as a tree: around the visitor when they are in it, else the whole family from its founders. */
export const FamilyTreePage: React.FC = () => {
  const translate = useTranslate()
  const { family: response } = useOpenFamily()
  const { me } = useWhoAmI()
  const { hidden, hiddenParentChildIds, isChoosing } = useHiddenPeople()
  const myPersonId = personIdOfMe(me)
  const everyone = familyStateOfSnapshot(response.family)
  const sheetPersonId = useSheetPersonId()
  const faces = usePersonFaces()
  const litKinship = useLitKinship(everyone, faces, myPersonId)
  // A lit kinship path is traced over everyone; choosing who to show draws everyone too, the hidden faded in place.
  const isEveryoneDrawn = litKinship !== null || isChoosing
  const family = isEveryoneDrawn
    ? everyone
    : withoutPeople(everyone, hidden.hiddenIds)
  const arrivalFocusId = firstFocusId({ family, me: myPersonId })
  const focusId =
    sheetPersonId !== null && isInTree(family, sheetPersonId)
      ? sheetPersonId
      : arrivalFocusId

  return (
    <div className='family-tree-screen'>
      {focusId === null ? (
        <>
          <FamilyAppBar />
          <Main className='family-tree-empty'>
            <DocumentTitle>{`${translate('tree.titleWhole')} — ${response.settings.name}`}</DocumentTitle>
            <p>{translate('tree.empty')}</p>
          </Main>
        </>
      ) : (
        <FamilyTree
          fallbackFocusId={arrivalFocusId}
          family={family}
          hiddenParentChildIds={
            isEveryoneDrawn ? new Set() : hiddenParentChildIds
          }
          initialFocusId={focusId}
          litKinship={litKinship}
          myPersonId={myPersonId}
        />
      )}
    </div>
  )
}
