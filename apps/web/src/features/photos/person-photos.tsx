import type React from 'react'
import { useState } from 'react'
import { FileTrigger } from 'react-aria-components'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { Person } from '@arbor/protocol/person'
import type { Photo } from '@arbor/protocol/photo'

import type { FamilyState } from '@arbor/core/family/family-state'

import { useFamilyEdit } from '@/features/family-edits/use-family-edit'
import { Button } from '@/presentation/components/button'
import { CameraIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { AddPhotoDialog } from './add-photo-dialog'
import { PhotoViewer } from './photo-viewer'
import { usePhotoUrl } from './use-photo-url'

import './person-photos.sass'

type PersonPhotosProps = {
  family: FamilyState
  name: string
  person: Person
}

const PhotoThumbnail: React.FC<{
  isPortrait: boolean
  /** What the button says when the photo has no caption to read. */
  label: string
  onPress: () => void
  photo: Photo
  portraitWord: string
}> = ({ isPortrait, label, onPress, photo, portraitWord }) => {
  const url = usePhotoUrl(photo.id, 'thumbnail')
  return (
    <Button
      aria-label={isPortrait ? `${portraitWord}, ${label}` : label}
      className='photo-thumbnail'
      onPress={onPress}
      variant='quiet'
    >
      <span className='photo-thumbnail-frame'>
        {url === null ? null : <img alt='' src={url} />}
      </span>
      {isPortrait ? (
        <span className='photo-thumbnail-tag'>{portraitWord} </span>
      ) : null}
      {photo.caption === '' ? null : (
        <span className='photo-thumbnail-caption'>{photo.caption}</span>
      )}
    </Button>
  )
}

/** A person's photos on their sheet, and the slot that adds one: from the phone's pictures or its camera. */
export const PersonPhotos: React.FC<PersonPhotosProps> = ({
  family,
  name,
  person
}) => {
  const translate = useTranslate()
  const edit = useFamilyEdit()
  const [picked, setPicked] = useState<File | null>(null)
  const [shownId, setShownId] = useState<EntityId | null>(null)
  const photos = [...family.photos.values()].filter(
    (photo) => photo.personId === person.id
  )

  if (photos.length === 0 && !edit.canEdit) return null

  return (
    <div className='sheet-group person-photos'>
      <h3 className='sheet-group-title'>{translate('photos.title')}</h3>
      <div className='person-photos-grid'>
        {photos.map((photo) => (
          <PhotoThumbnail
            isPortrait={person.portraitPhotoId === photo.id}
            key={photo.id}
            label={
              photo.caption === ''
                ? translate('photos.untitled', { name })
                : photo.caption
            }
            onPress={() => setShownId(photo.id)}
            photo={photo}
            portraitWord={translate('photos.portrait')}
          />
        ))}
        {edit.canEdit ? (
          <FileTrigger
            acceptedFileTypes={['image/*']}
            onSelect={(files) => {
              const file = files?.[0]
              if (file !== undefined) edit.signFirst(() => setPicked(file))
            }}
          >
            <Button className='photo-drop-slot' variant='quiet'>
              <CameraIcon aria-hidden='true' />
              {translate('photos.add')}
            </Button>
          </FileTrigger>
        ) : null}
      </div>
      <AddPhotoDialog
        edit={edit}
        file={picked}
        name={name}
        onClose={() => setPicked(null)}
        person={person}
      />
      <PhotoViewer
        canEdit={edit.canEdit}
        edit={edit}
        name={name}
        onClose={() => setShownId(null)}
        person={person}
        photo={shownId === null ? null : (family.photos.get(shownId) ?? null)}
      />
    </div>
  )
}
