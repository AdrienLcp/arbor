import { classNames } from '@adrienlcp/react'
import type React from 'react'

import type {
  TreeConnector,
  TreePoint
} from '@arbor/core/tree-layout/tree-layout'

import { type LineStyle, lineStyleOf } from './line-style'
import type { TreeScene } from './tree-scene'
import { unionMiddle, unionWordsPlace } from './union-marks'

/** The two slashes that cut an ended union: half their rise, their lean, the step between them. */
const CUT_RISE = 7
const CUT_LEAN = 5
const CUT_STEP = 7

const pathOf = (points: readonly TreePoint[]): string =>
  points
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`)
    .join('')

const cutPath = ({ x, y }: TreePoint): string =>
  [-CUT_STEP / 2 - CUT_LEAN / 2, CUT_STEP / 2 - CUT_LEAN / 2]
    .map(
      (offset) => `M${x + offset} ${y + CUT_RISE}l${CUT_LEAN} ${-2 * CUT_RISE}`
    )
    .join('')

const Line: React.FC<{ path: string; style: LineStyle }> = ({ path, style }) =>
  style === 'adoption' ? (
    <>
      <path className='tree-line adoption' d={path} />
      <path className='tree-line adoption-core' d={path} />
    </>
  ) : (
    <path className={classNames('tree-line', style)} d={path} />
  )

const ConnectorLines: React.FC<{ connector: TreeConnector }> = ({
  connector
}) => {
  const style = lineStyleOf(connector)
  const isEnded =
    connector.kind === 'union' &&
    connector.union !== null &&
    connector.union.end !== null
  const stub =
    connector.kind === 'union' && connector.union !== null
      ? unionWordsPlace(connector.points).stub
      : null

  return (
    <>
      <Line path={pathOf(connector.points)} style={style} />
      {stub === null ? null : <Line path={pathOf(stub)} style='plain' />}
      {isEnded ? (
        <>
          <path
            className='tree-line cut-gap'
            d={cutPath(unionMiddle(connector.points))}
          />
          <path
            className='tree-line cut'
            d={cutPath(unionMiddle(connector.points))}
          />
        </>
      ) : null}
    </>
  )
}

/** Every relation line of the scene, drawn under the stickers. */
export const TreeLines: React.FC<{ scene: TreeScene }> = ({ scene }) => (
  <svg
    aria-hidden='true'
    className='tree-lines'
    height={scene.height}
    width={scene.width}
  >
    <g transform={`translate(${-scene.origin.x} ${-scene.origin.y})`}>
      {scene.layout.connectors.map((connector) => (
        <ConnectorLines
          connector={connector}
          key={`${connector.kind}${pathOf(connector.points)}`}
        />
      ))}
    </g>
  </svg>
)
