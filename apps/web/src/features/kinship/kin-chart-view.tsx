import { classNames } from '@adrienlcp/react'
import type React from 'react'
import { Button } from 'react-aria-components'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { PersonFace } from '@/features/family-tree/person-face'
import {
  cutPath,
  pathOf,
  RelationLine
} from '@/features/family-tree/tree-lines'
import { PortraitImage } from '@/features/photos/portrait-image'
import { MiniSticker } from '@/presentation/components/mini-sticker'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { ChartLink, ChartNode, KinChart } from './kin-chart'

import './kin-chart-view.sass'

/** Between two lanes: the shared ancestor stands one half-lane from each side. */
const HALF_LANE = 60
const ROW_HEIGHT = 120
/** A person on the chart: the mini sticker, their given name under it. */
const NODE_WIDTH = 108
const NODE_HEIGHT = 92
/** Lines meet at the middle of the mini sticker, hidden under it and under the name. */
const STICKER_MIDDLE = 32

const topLeftOf = ({ column, row }: ChartNode) => ({
  x: column * HALF_LANE,
  y: row * ROW_HEIGHT
})

const middleOf = (node: ChartNode) => {
  const { x, y } = topLeftOf(node)
  return { x: x + NODE_WIDTH / 2, y: y + STICKER_MIDDLE }
}

const ChartLine: React.FC<{ link: ChartLink }> = ({ link }) => {
  const from = middleOf(link.from)
  const to = middleOf(link.to)
  const cut = cutPath({ x: (from.x + to.x) / 2, y: from.y })
  return (
    <>
      <RelationLine path={pathOf([from, to])} style={link.style} />
      {link.isEnded ? (
        <>
          <path className='tree-line cut-gap' d={cut} />
          <path className='tree-line cut' d={cut} />
        </>
      ) : null}
    </>
  )
}

type KinChartViewProps = {
  chart: KinChart
  faces: ReadonlyMap<EntityId, PersonFace>
  /** Names the chart for a screen reader, e.g. the path from the visitor to Pierre. */
  label: string
  onPressPerson: (personId: EntityId) => void
  /** The visitor, named "you" on the chart. */
  youId: EntityId | null
}

/** How two people are related, drawn as a small tree: up one side to the ancestor they share, down the other. */
export const KinChartView: React.FC<KinChartViewProps> = ({
  chart,
  faces,
  label,
  onPressPerson,
  youId
}) => {
  const translate = useTranslate()
  const width = (chart.columns - 1) * HALF_LANE + NODE_WIDTH
  const height = (chart.rows - 1) * ROW_HEIGHT + NODE_HEIGHT
  const endIds = [chart.nodes.at(0)?.personId, chart.nodes.at(-1)?.personId]

  return (
    <div className='kin-chart'>
      <div
        className='kin-chart-plane'
        style={{
          '--chart-height': `${height}px`,
          '--chart-width': `${width}px`
        }}
      >
        <svg
          aria-hidden='true'
          className='kin-chart-lines'
          height={height}
          width={width}
        >
          {chart.links.map((link) => (
            <ChartLine
              key={`${link.from.personId}-${link.to.personId}`}
              link={link}
            />
          ))}
        </svg>
        <ol aria-label={label} className='kin-chart-people'>
          {chart.nodes.map((node) => {
            const face = faces.get(node.personId)
            if (face === undefined) return null
            const { x, y } = topLeftOf(node)
            return (
              <li
                className={classNames(
                  'kin-chart-person',
                  endIds.includes(node.personId) && 'end'
                )}
                key={node.personId}
                style={{ '--x': `${x}px`, '--y': `${y}px` }}
              >
                <Button
                  aria-label={face.name}
                  className='kin-chart-button'
                  onPress={() => onPressPerson(node.personId)}
                >
                  <MiniSticker
                    generation={face.generation}
                    isDeceased={face.isDeceased}
                    monogram={face.monogram}
                    portrait={<PortraitImage photoId={face.portraitPhotoId} />}
                  />
                  <span aria-hidden='true' className='kin-chart-name'>
                    {node.personId === youId
                      ? translate('kinship.you')
                      : face.givenNames || face.name}
                  </span>
                </Button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
