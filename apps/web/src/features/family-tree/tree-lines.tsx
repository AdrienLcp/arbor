import { classNames } from '@adrienlcp/react'
import type React from 'react'

import type {
  TreeConnector,
  TreePoint
} from '@arbor/core/tree-layout/tree-layout'

import { type LineStyle, lineStyleOf } from './line-style'
import type { TreeScene } from './tree-scene'

/** The two slashes that cut an ended union: half their rise, their lean, the step between them. */
const CUT_RISE = 7
const CUT_LEAN = 5
const CUT_STEP = 7

/** The SVG path through a line's points. */
export const pathOf = (points: readonly TreePoint[]): string =>
  points
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`)
    .join('')

/** The two slashes that cut an ended union, centred on `at`. */
export const cutPath = ({ x, y }: TreePoint): string =>
  [-CUT_STEP / 2 - CUT_LEAN / 2, CUT_STEP / 2 - CUT_LEAN / 2]
    .map(
      (offset) => `M${x + offset} ${y + CUT_RISE}l${CUT_LEAN} ${-2 * CUT_RISE}`
    )
    .join('')

/** One relation line, stroked for its kind; an adoption is a double line, a paper core in a wide stroke. */
export const RelationLine: React.FC<{
  isHidden?: boolean
  path: string
  style: LineStyle
}> = ({ isHidden = false, path, style }) =>
  style === 'adoption' ? (
    <>
      <path
        className={classNames('tree-line adoption', isHidden && 'is-hidden')}
        d={path}
      />
      <path
        className={classNames(
          'tree-line adoption-core',
          isHidden && 'is-hidden'
        )}
        d={path}
      />
    </>
  ) : (
    <path
      className={classNames('tree-line', style, isHidden && 'is-hidden')}
      d={path}
    />
  )

/** Every relation line of the scene, drawn under the stickers. */
export const TreeLines: React.FC<{
  /** Lines to someone unticked while choosing who to show, drawn faded. */
  hiddenLines: ReadonlySet<TreeConnector>
  scene: TreeScene
}> = ({ hiddenLines, scene }) => (
  <svg
    aria-hidden='true'
    className='tree-lines'
    height={scene.height}
    width={scene.width}
  >
    <g transform={`translate(${-scene.origin.x} ${-scene.origin.y})`}>
      {scene.layout.connectors.map((connector) => (
        <RelationLine
          isHidden={hiddenLines.has(connector)}
          key={`${connector.kind}${pathOf(connector.points)}`}
          path={pathOf(connector.points)}
          style={lineStyleOf(connector)}
        />
      ))}
    </g>
  </svg>
)
