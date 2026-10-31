import type React from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { PersonFace } from './person-face'
import { RelativeButton } from './relative-button'

import './unplaced-tray.sass'

type UnplacedTrayProps = {
  faces: ReadonlyMap<EntityId, PersonFace>
  onPressPerson: (personId: EntityId) => void
  personIds: readonly EntityId[]
}

/** The people tied to no one yet, waiting in a dashed tray beside the tree; touching one opens their sheet, where they are tied to the family. */
export const UnplacedTray: React.FC<UnplacedTrayProps> = ({
  faces,
  onPressPerson,
  personIds
}) => {
  const translate = useTranslate()
  const waiting = personIds.flatMap((personId) => {
    const face = faces.get(personId)
    return face === undefined ? [] : [face]
  })
  if (waiting.length === 0) return null

  return (
    <section aria-label={translate('tree.unplaced')} className='unplaced-tray'>
      <h2 className='unplaced-tray-title'>{translate('tree.unplaced')}</h2>
      <div className='unplaced-tray-people'>
        {waiting.map((face) => (
          <RelativeButton
            face={face}
            isMorphing={false}
            key={face.id}
            lines={face.years === '' ? [] : [face.years]}
            onPress={() => onPressPerson(face.id)}
          />
        ))}
      </div>
    </section>
  )
}
