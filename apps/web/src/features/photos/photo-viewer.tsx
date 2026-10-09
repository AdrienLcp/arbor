import type React from 'react'

import type { Person } from '@arbor/protocol/person'
import type { Photo } from '@arbor/protocol/photo'

import { EditFailureNotice } from '@/features/family-edits/edit-failure-notice'
import type { FamilyEdit } from '@/features/family-edits/use-family-edit'
import { Button } from '@/presentation/components/button'
import { FormDialog } from '@/presentation/components/form-dialog'
import { PersonIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { portraitOperation } from './photo-addition'
import { usePhotoUrl } from './use-photo-url'

import './photo-viewer.sass'

type PhotoViewerProps = {
  canEdit: boolean
  edit: FamilyEdit
  name: string
  onClose: () => void
  person: Person
  /** The photo shown; `null` when the viewer is closed. */
  photo: Photo | null
}

const PhotoImage: React.FC<{ photo: Photo }> = ({ photo }) => {
  const url = usePhotoUrl(photo.id, 'full')
  return (
    <div className='photo-viewer-frame'>
      {url === null ? null : (
        <img alt={photo.caption} className='photo-viewer-image' src={url} />
      )}
    </div>
  )
}

/** One photo at full size, its caption, and the way to put it on the person's sticker. */
export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  canEdit,
  edit,
  name,
  onClose,
  person,
  photo
}) => {
  const translate = useTranslate()
  const close = () => {
    edit.dismissFailure()
    onClose()
  }
  const toPortrait = photo === null ? null : portraitOperation(person, photo.id)

  return (
    <FormDialog
      closeLabel={translate('photos.close')}
      isOpen={photo !== null}
      isPending={edit.isPending}
      onClose={close}
      title={
        photo === null || photo.caption === ''
          ? translate('photos.untitled', { name })
          : photo.caption
      }
    >
      {photo === null ? null : (
        <div className='photo-viewer'>
          <PhotoImage photo={photo} />
          {toPortrait === null ? (
            <p className='photo-viewer-note'>
              {translate('photos.isPortrait', { name })}
            </p>
          ) : null}
          {edit.failure === null ? null : (
            <EditFailureNotice failure={edit.failure} />
          )}
          {canEdit && toPortrait !== null ? (
            <Button
              isBlock
              isPending={edit.isPending}
              onPress={() =>
                edit.signFirst(() => edit.save([toPortrait], close))
              }
            >
              <PersonIcon aria-hidden='true' />
              {translate('photos.makePortrait')}
            </Button>
          ) : null}
          <Button
            isBlock
            isDisabled={edit.isPending}
            onPress={close}
            variant='ghost'
          >
            {translate('photos.close')}
          </Button>
        </div>
      )}
    </FormDialog>
  )
}
