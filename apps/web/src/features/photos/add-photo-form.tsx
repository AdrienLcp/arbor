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
import { Form } from '@/presentation/components/form'
import { TextField } from '@/presentation/components/text-field'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import {
  type PhotoAddition,
  photoAdditionOperations,
  photoWithdrawalOperations
} from './photo-addition'
import type { ResizedPhoto } from './photo-resize'

type AddPhotoFormProps = {
  edit: FamilyEdit
  name: string
  onDone: () => void
  person: Person
  /** Where the picked picture shows before it is saved. */
  previewUrl: string
  resized: ResizedPhoto
}

/** A picked picture, its caption and whether it becomes the person's portrait, before it joins the family. */
export const AddPhotoForm: React.FC<AddPhotoFormProps> = ({
  edit,
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

  const savePhoto = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { author } = edit
    if (author === null) return
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
        files: resized,
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
      <img alt='' className='add-photo-preview' src={previewUrl} />
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
      {edit.failure === null ? null : (
        <EditFailureNotice failure={edit.failure} />
      )}
      <Button isBlock isPending={edit.isPending} type='submit'>
        {translate('photos.save')}
      </Button>
    </Form>
  )
}
