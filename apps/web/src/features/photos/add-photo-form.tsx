import type React from 'react'
import { useState } from 'react'

import type { Person } from '@arbor/protocol/person'

import { EditFailureNotice } from '@/features/family-edits/edit-failure-notice'
import type { FamilyEdit } from '@/features/family-edits/use-family-edit'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import {
  recordOperations,
  uploadPhotoFiles
} from '@/infrastructure/api/family-api'
import { newEntityId } from '@/infrastructure/ids'
import { Button } from '@/presentation/components/button'
import { Checkbox } from '@/presentation/components/checkbox'
import { FailureNotice } from '@/presentation/components/failure-notice'
import { Form } from '@/presentation/components/form'
import { TextField } from '@/presentation/components/text-field'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import {
  type PhotoAddition,
  photoAdditionOperations,
  photoWithdrawalOperations
} from './photo-addition'
import { PhotoCropFrame } from './photo-crop-frame'
import {
  isWholePhoto,
  type PhotoCrop,
  type PhotoResizeFailure,
  type ResizedPhoto,
  resizePhoto,
  WHOLE_PHOTO
} from './photo-resize'

type AddPhotoFormProps = {
  edit: FamilyEdit
  /** The file as picked: a crop is cut from it, at its full size, rather than from the lighter copy. */
  file: File
  name: string
  onDone: () => void
  person: Person
  /** Where the picked picture shows before it is saved. */
  previewUrl: string
  /** The whole picture made light, kept as it is when it is not cropped. */
  resized: ResizedPhoto
}

/** A picked picture, how it is cropped, its caption and whether it becomes the person's portrait, before it joins the family. */
export const AddPhotoForm: React.FC<AddPhotoFormProps> = ({
  edit,
  file,
  name,
  onDone,
  person,
  previewUrl,
  resized
}) => {
  const translate = useTranslate()
  const { familyId, key } = useOpenFamily()
  const [caption, setCaption] = useState('')
  // A first photo is most often the face the family wants on the sticker.
  const [asPortrait, setAsPortrait] = useState(person.portraitPhotoId === null)
  const [photoId] = useState(newEntityId)
  const [crop, setCrop] = useState<PhotoCrop>(WHOLE_PHOTO)
  const [isCropping, setCropping] = useState(false)
  const [cropProblem, setCropProblem] = useState<PhotoResizeFailure | null>(
    null
  )
  const isCropped = !isWholePhoto(crop)

  const savePhoto = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { author } = edit
    if (author === null) return
    setCropProblem(null)
    setCropping(isCropped)
    const files = isCropped ? await resizePhoto(file, crop) : null
    setCropping(false)
    if (files?.status === 'failure') {
      setCropProblem(files.error)
      return
    }
    const kept = files === null ? resized : files.data
    const addition: PhotoAddition = {
      asPortrait,
      person,
      photo: {
        caption: caption.trim(),
        date: null,
        id: photoId,
        personId: person.id
      }
    }
    edit.save(photoAdditionOperations(addition), onDone, async (revision) => {
      const uploaded = await uploadPhotoFiles({
        familyId,
        files: kept,
        key,
        photoId
      })
      if (uploaded.status === 'failure') {
        // A photo whose images never arrived would show as an empty frame: take it back.
        await recordOperations({
          familyId,
          input: {
            author,
            baseRevision: revision,
            operations: photoWithdrawalOperations(addition)
          },
          key
        })
      }
      return uploaded
    })
  }

  return (
    <Form className='add-photo-form' onSubmit={savePhoto}>
      <div className='add-photo-crop'>
        <PhotoCropFrame
          crop={crop}
          onChange={setCrop}
          previewUrl={previewUrl}
        />
        {isCropped ? (
          <Button onPress={() => setCrop(WHOLE_PHOTO)} variant='ghost'>
            {translate('photos.crop.whole')}
          </Button>
        ) : null}
      </div>
      <TextField
        autoComplete='off'
        description={translate('photos.captionHint')}
        label={translate('photos.caption')}
        onChange={setCaption}
        value={caption}
      />
      <Checkbox isSelected={asPortrait} onChange={setAsPortrait}>
        {translate('photos.asPortrait', { name })}
      </Checkbox>
      {cropProblem === null ? null : (
        <FailureNotice>
          {translate(`photos.problem.${cropProblem}`)}
        </FailureNotice>
      )}
      {edit.failure === null ? null : (
        <EditFailureNotice failure={edit.failure} />
      )}
      <Button isBlock isPending={edit.isPending || isCropping} type='submit'>
        {translate('photos.save')}
      </Button>
    </Form>
  )
}
