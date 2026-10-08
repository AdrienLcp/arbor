import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import { familyLinkFor } from '@arbor/protocol/family-link'

import { familyStateOfSnapshot } from '@arbor/core/family/family-state-of-snapshot'

import { ONLOOKER } from '@/features/family-access/family-access'
import {
  rememberedFamily,
  rememberedMe
} from '@/features/family-access/remembered-families'
import { FamilyAppBar } from '@/features/family-pages/family-app-bar'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import { usePersonFaces } from '@/features/family-pages/use-person-faces'
import { slotNumbersOf } from '@/features/family-tree/slot-numbers'
import { treeScene } from '@/features/family-tree/tree-scene'
import { firstFocusId } from '@/features/family-tree/tree-view'
import { pageOrigin, saveFile } from '@/infrastructure/browser'
import { today } from '@/infrastructure/clock'
import { pdfOfDrawing } from '@/infrastructure/pdf-file'
import {
  type LoadedPrintFont,
  loadPrintFonts
} from '@/infrastructure/print-fonts'
import { Button } from '@/presentation/components/button'
import { FailureNotice } from '@/presentation/components/failure-notice'
import { DownloadIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { lifePlaces } from './life-places'
import { printFormatOf } from './paper-choice'
import { DEFAULT_PRINT_CONTENT } from './print-content'
import { type PrintChoices, PrintOptions } from './print-options'
import { type PrintPage, printPlan } from './print-pages'
import { PRINT_PALETTE } from './print-palette'
import {
  DEFAULT_PRINT_DEPTH,
  layoutOfPrintScope,
  type PrintScope
} from './print-scope'
import { PrintSheet } from './print-sheet'
import { PRINT_VOICES } from './print-voices'
import { usePrintPortraits } from './use-print-portraits'

import './print-tree-page.sass'

const scopeOf = (choices: PrintChoices): PrintScope =>
  choices.scopeKind === 'whole'
    ? { kind: 'whole' }
    : {
        depth: choices.depth,
        kind: choices.scopeKind,
        personId: choices.personId
      }

type Fonts =
  | { kind: 'failed' }
  | { kind: 'loading' }
  | { fonts: readonly LoadedPrintFont[]; kind: 'ready' }

/** Loads the print faces once the page opens: the preview is measured with them, the PDF embeds them. */
const usePrintFonts = (): Fonts => {
  const [fonts, setFonts] = useState<Fonts>({ kind: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    void loadPrintFonts(Object.values(PRINT_VOICES), controller.signal).then(
      (loaded) => {
        if (controller.signal.aborted) return
        setFonts(
          loaded.status === 'success'
            ? { fonts: loaded.data, kind: 'ready' }
            : { kind: 'failed' }
        )
      }
    )
    return () => controller.abort()
  }, [])

  return fonts
}

/** The tiles of a poster, drawn over its preview so the cuts show before printing. */
const TileOutlines: React.FC<{ pages: readonly PrintPage[] }> = ({ pages }) =>
  pages.map((page) =>
    page.tile === null ? null : (
      <rect
        className='print-tile'
        height={page.area.height}
        key={`${page.tile.row}-${page.tile.column}`}
        width={page.area.width}
        x={page.area.x}
        y={page.area.y}
      />
    )
  )

/** The family on paper, whole or one person's line: the options, a preview of the sheet and the PDF to print. */
export const PrintTreePage: React.FC = () => {
  const translate = useTranslate()
  const { family: response, familyId } = useOpenFamily()
  const fonts = usePrintFonts()
  const faces = usePersonFaces()
  const family = familyStateOfSnapshot(response.family)
  const me = rememberedMe(familyId)
  const [choices, setChoices] = useState<PrintChoices>(() => ({
    content: DEFAULT_PRINT_CONTENT,
    depth: DEFAULT_PRINT_DEPTH,
    orientation: 'landscape',
    paper: 'a3',
    personId:
      firstFocusId({
        family,
        me:
          me !== null && me !== ONLOOKER && me.kind === 'person'
            ? me.personId
            : null
      }) ?? '',
    scopeKind: 'whole'
  }))
  const [making, setMaking] = useState<'failed' | 'idle' | 'making'>('idle')
  const sheet = useRef<SVGSVGElement>(null)
  const familyName = response.settings.name
  const scene = treeScene({
    layout: layoutOfPrintScope(family, scopeOf(choices)),
    persons: family.persons
  })
  const portraits = usePrintPortraits(
    choices.content.hasPhotos
      ? scene.layout.cards.flatMap((card) => {
          if (card.kind !== 'person') return []
          const photoId = faces.get(card.personId)?.portraitPhotoId ?? null
          return photoId === null ? [] : [photoId]
        })
      : []
  )
  const places = new Map(
    [...family.persons.values()].map((person) => [
      person.id,
      lifePlaces(person)
    ])
  )
  const plan = printPlan(printFormatOf(choices.paper, choices.orientation))
  const readerKey = rememberedFamily(familyId).keys.reader
  const liveLink =
    readerKey === undefined
      ? null
      : familyLinkFor({ familyId, key: readerKey, origin: pageOrigin() })
  const missingCount = scene.layout.cards.filter(
    (card) => card.kind === 'unknown-parent'
  ).length
  const personCount = new Set(
    scene.layout.cards.flatMap((card) =>
      card.kind === 'person' ? card.personId : []
    )
  ).size
  const scopePerson = faces.get(choices.personId)?.name ?? ''
  const summary = [
    ...(choices.scopeKind === 'whole'
      ? []
      : [
          translate(
            choices.scopeKind === 'ancestors'
              ? 'print.scope.ancestorsOf'
              : 'print.scope.descendantsOf',
            { name: scopePerson }
          )
        ]),
    translate('print.generations', { count: scene.bands.length }),
    translate('tree.people', { count: personCount }),
    ...(missingCount === 0
      ? []
      : [translate('tree.missing', { count: missingCount })])
  ].join(' · ')

  const downloadPdf = async (loaded: readonly LoadedPrintFont[]) => {
    if (sheet.current === null) return
    setMaking('making')
    const pdf = await pdfOfDrawing({
      drawingSize: plan.drawing,
      fonts: loaded,
      labelFamily: PRINT_VOICES.label.family,
      markColor: PRINT_PALETTE.ink,
      pages: plan.pages.map((page, index) => ({
        ...page,
        label:
          page.tile === null
            ? null
            : translate('print.tile', {
                column: page.tile.column,
                count: plan.pages.length,
                number: index + 1,
                row: page.tile.row
              })
      })),
      svg: sheet.current
    })
    if (pdf.status === 'failure') {
      setMaking('failed')
      return
    }
    saveFile(pdf.data, translate('print.fileName', { name: familyName }))
    setMaking('idle')
  }

  return (
    <>
      <FamilyAppBar />
      <Main className='print-tree-page'>
        <DocumentTitle>{`${translate('print.title')} — ${familyName}`}</DocumentTitle>
        <div className='print-tree-head'>
          <h1 className='print-tree-title'>{translate('print.title')}</h1>
          <p className='print-tree-intro'>{translate('print.intro')}</p>
        </div>
        <div className='print-tree-body'>
          <PrintOptions choices={choices} faces={faces} onChange={setChoices} />
          <div className='print-tree-result'>
            {fonts.kind === 'failed' ? (
              <FailureNotice>{translate('print.fontsFailed')}</FailureNotice>
            ) : null}
            {fonts.kind === 'loading' ? (
              <p className='print-tree-loading'>{translate('print.loading')}</p>
            ) : null}
            {fonts.kind === 'ready' ? (
              <>
                <div
                  className='print-tree-preview'
                  style={{
                    '--sheet-ratio': plan.drawing.width / plan.drawing.height
                  }}
                >
                  <PrintSheet
                    className='print-tree-sheet'
                    content={choices.content}
                    drawing={plan.drawing}
                    faces={faces}
                    familyName={familyName}
                    liveLink={liveLink}
                    places={places}
                    portraits={portraits}
                    printedOn={today()}
                    ref={sheet}
                    scene={scene}
                    slotNumbers={slotNumbersOf({
                      layout: scene.layout,
                      personIds: [...family.persons.keys()]
                    })}
                    summary={summary}
                  />
                  <svg
                    aria-hidden='true'
                    className='print-tree-tiles'
                    viewBox={`0 0 ${plan.drawing.width} ${plan.drawing.height}`}
                  >
                    <TileOutlines pages={plan.pages} />
                  </svg>
                </div>
                <Button
                  isPending={making === 'making'}
                  onPress={() => void downloadPdf(fonts.fonts)}
                >
                  <DownloadIcon aria-hidden='true' />
                  {making === 'making'
                    ? translate('print.making')
                    : translate('print.download')}
                </Button>
                {making === 'failed' ? (
                  <FailureNotice>{translate('print.failed')}</FailureNotice>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </Main>
    </>
  )
}
