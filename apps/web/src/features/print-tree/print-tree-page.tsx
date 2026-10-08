import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import { familyLinkFor } from '@arbor/protocol/family-link'

import { familyStateOfSnapshot } from '@arbor/core/family/family-state-of-snapshot'
import { layoutWholeFamily } from '@arbor/core/tree-layout/layout-whole-family'

import { rememberedFamily } from '@/features/family-access/remembered-families'
import { FamilyAppBar } from '@/features/family-pages/family-app-bar'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import { usePersonFaces } from '@/features/family-pages/use-person-faces'
import { slotNumbersOf } from '@/features/family-tree/slot-numbers'
import { treeScene } from '@/features/family-tree/tree-scene'
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
import { SegmentedControl } from '@/presentation/components/segmented-control'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { type PrintFormat, type PrintPage, printPlan } from './print-pages'
import { PRINT_PALETTE } from './print-palette'
import { PrintSheet } from './print-sheet'
import { PRINT_VOICES } from './print-voices'

import './print-tree-page.sass'

/** The formats offered for now: the keeper's usual A3, and a poster for a home printer. */
const FORMATS = {
  a3: { kind: 'sheet', orientation: 'landscape', paper: 'a3' },
  poster: { columns: 3, kind: 'poster', orientation: 'landscape', rows: 2 }
} as const satisfies Record<string, PrintFormat>
type FormatChoice = keyof typeof FORMATS

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

/** The whole family on paper: a preview of the sheet and the PDF to print. */
export const PrintTreePage: React.FC = () => {
  const translate = useTranslate()
  const { family: response, familyId } = useOpenFamily()
  const fonts = usePrintFonts()
  const faces = usePersonFaces()
  const [choice, setChoice] = useState<FormatChoice>('a3')
  const [making, setMaking] = useState<'failed' | 'idle' | 'making'>('idle')
  const sheet = useRef<SVGSVGElement>(null)
  const familyName = response.settings.name
  const family = familyStateOfSnapshot(response.family)
  const scene = treeScene({
    layout: layoutWholeFamily(family),
    persons: family.persons
  })
  const plan = printPlan(FORMATS[choice])
  const readerKey = rememberedFamily(familyId).keys.reader
  const liveLink =
    readerKey === undefined
      ? null
      : familyLinkFor({ familyId, key: readerKey, origin: pageOrigin() })
  const missingCount = scene.layout.cards.filter(
    (card) => card.kind === 'unknown-parent'
  ).length
  const summary = [
    translate('print.generations', { count: scene.bands.length }),
    translate('tree.people', { count: faces.size }),
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
        <div className='print-tree-controls'>
          <SegmentedControl<FormatChoice>
            label={translate('print.format.label')}
            onChange={setChoice}
            options={[
              { label: translate('print.format.a3'), value: 'a3' },
              { label: translate('print.format.poster'), value: 'poster' }
            ]}
            value={choice}
          />
          {choice === 'poster' ? (
            <p className='print-tree-hint'>{translate('print.posterHint')}</p>
          ) : null}
        </div>
        {fonts.kind === 'failed' ? (
          <FailureNotice>{translate('print.fontsFailed')}</FailureNotice>
        ) : null}
        {fonts.kind === 'loading' ? (
          <p className='print-tree-loading'>{translate('print.loading')}</p>
        ) : null}
        {fonts.kind === 'ready' ? (
          <>
            <div className='print-tree-preview'>
              <PrintSheet
                className='print-tree-sheet'
                drawing={plan.drawing}
                faces={faces}
                familyName={familyName}
                liveLink={liveLink}
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
      </Main>
    </>
  )
}
