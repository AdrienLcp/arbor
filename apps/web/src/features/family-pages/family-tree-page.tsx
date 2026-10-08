import { classNames } from '@adrienlcp/react'
import type React from 'react'
import { useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'
import { familyStateOfSnapshot } from '@arbor/core/family/family-state-of-snapshot'
import { describeKinship } from '@arbor/core/kinship/describe-kinship'
import type { KinPath } from '@arbor/core/kinship/kinship'
import { familyLineage } from '@arbor/core/tree-layout/family-lineage'

import { rememberedMyPersonId } from '@/features/family-access/remembered-families'
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
import { today } from '@/infrastructure/clock'
import {
  familyTreePathFor,
  type KinshipPair,
  personSheetPathFor,
  useChildPage,
  useLitKinshipPair,
  useNavigateTo,
  useSheetPersonId
} from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { Main } from '@/presentation/components/main'
import { PHONE_SCREEN } from '@/presentation/components/phone-screen'
import { SegmentedControl } from '@/presentation/components/segmented-control'
import { useMediaQuery } from '@/presentation/components/use-media-query'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useLocale, useTranslate } from '@/presentation/i18n/i18n-context'

import { FamilyAppBar } from './family-app-bar'
import { useOpenFamily } from './family-loader'
import { usePersonFaces } from './use-person-faces'

import './family-tree-page.sass'

type FamilyTreeProps = {
  /** Where the tree turns when the person in its middle is put in the bin. */
  fallbackFocusId: EntityId | null
  family: FamilyState
  initialFocusId: EntityId
  isFocusMe: boolean
  /** How two people are related, traced over the whole tree on a computer. */
  litKinship: LitKinship | null
}

type LitKinship = { path: KinPath; relativeId: EntityId; sentence: string }

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
  litKinship
}) => {
  const translate = useTranslate()
  const navigateTo = useNavigateTo()
  const { family: response, familyId } = useOpenFamily()
  const day = today()
  const isPhone = useMediaQuery(PHONE_SCREEN)
  const sheet = useChildPage()
  const sheetPersonId = useSheetPersonId()
  const { setDepth, setFocus, setScope, showAround, view } = useTreeView({
    fallbackFocusId,
    initialFocusId,
    isFocusMe,
    isInTree: (personId) => isInTree(family, personId),
    shownPersonId: sheetPersonId
  })
  const personIds = [...family.persons.keys()]
  const faces = usePersonFaces()
  const edit = useFamilyEdit()
  const canAdd = edit.canEdit && edit.author !== null
  const [adding, setAdding] = useState<Adding | null>(null)
  const lit = isPhone ? null : litKinship
  const focusId = lit?.relativeId ?? view.focusId
  const focus = faces.get(focusId)
  const focusSheetPath = personSheetPathFor({ familyId, personId: focusId })
  /** Touching the person already in the middle opens their sheet; anyone else comes to the middle. While a path is lit, anyone's sheet opens. */
  const pressPerson = (personId: EntityId) => {
    if (personId === focusId || lit !== null) {
      navigateTo(personSheetPathFor({ familyId, personId }))
      return
    }
    setFocus(personId)
  }
  const focusName =
    faces.get(view.focusId)?.name ?? translate('common.unnamedPerson')
  const shownScope: TreeScope =
    lit !== null
      ? 'whole'
      : isPhone && view.scope === 'whole'
        ? 'around'
        : view.scope
  const title =
    lit?.sentence ??
    {
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
          onAdd={canAdd ? setAdding : undefined}
          onPressPerson={pressPerson}
          sheetPath={focusSheetPath}
        />
      )
    }
    const scene = treeScene({
      layout: layoutOfView(family, { ...view, focusId, scope: shownScope }),
      persons: family.persons
    })
    return (
      <>
        <TreeCanvas
          focusId={focusId}
          label={title}
          litPath={lit?.path ?? null}
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
        <h1 className={classNames('family-tree-title', lit && 'is-sentence')}>
          {title}
        </h1>
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
          <PersonSearch onPick={showAround} people={[...faces.values()]} />
        </div>
      </div>
      <div className='family-tree-stage'>
        <div className='family-tree-drawing'>{drawing()}</div>
        {sheet}
      </div>
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
  const { family: response, familyId } = useOpenFamily()
  const myPersonId = rememberedMyPersonId(familyId)
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
        />
      )}
    </div>
  )
}
