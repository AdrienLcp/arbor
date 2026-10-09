import type React from 'react'
import { useEffect, useState } from 'react'

import type { Person } from '@arbor/protocol/person'

import type { FamilyEdit } from '@/features/family-edits/use-family-edit'
import { FailureNotice } from '@/presentation/components/failure-notice'
import { FormDialog } from '@/presentation/components/form-dialog'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { AddPhotoForm } from './add-photo-form'
import {
  type PhotoResizeFailure,
  type ResizedPhoto,
  resizePhoto
} from './photo-resize'

import './add-photo-dialog.sass'

/** Where a picked picture stands: being made lighter, ready to save, or not a photo that can be kept. */
type Picking =
  | { status: 'resizing' }
  | { previewUrl: string; resized: ResizedPhoto; status: 'ready' }
  | { problem: PhotoResizeFailure; status: 'refused' }

type AddPhotoDialogProps = {
  edit: FamilyEdit
  /** The file just picked; `null` when no photo is being added. */
  file: File | null
  name: string
  onClose: () => void
  person: Person
}

/** Turns a picked file into a light photo, then asks for its caption and whether it is the portrait. */
export const AddPhotoDialog: React.FC<AddPhotoDialogProps> = ({
  edit,
  file,
  name,
  onClose,
  person
}) => {
  const translate = useTranslate()
  const [picking, setPicking] = useState<Picking>({ status: 'resizing' })

  useEffect(() => {
    if (file === null) return
    let isPicked = true
    let previewUrl: string | null = null
    setPicking({ status: 'resizing' })
    void resizePhoto(file).then((resized) => {
      if (!isPicked) return
      if (resized.status === 'failure') {
        setPicking({ problem: resized.error, status: 'refused' })
        return
      }
      previewUrl = URL.createObjectURL(resized.data.full)
      setPicking({ previewUrl, resized: resized.data, status: 'ready' })
    })
    return () => {
      isPicked = false
      if (previewUrl !== null) URL.revokeObjectURL(previewUrl)
    }
  }, [file])

  const close = () => {
    edit.dismissFailure()
    onClose()
  }

  const content = (): React.ReactNode => {
    switch (picking.status) {
      case 'resizing':
        return <p className='add-photo-status'>{translate('photos.adding')}</p>
      case 'refused':
        return (
          <FailureNotice>
            {translate(`photos.problem.${picking.problem}`)}
          </FailureNotice>
        )
      case 'ready':
        return (
          <AddPhotoForm
            edit={edit}
            name={name}
            onDone={close}
            person={person}
            previewUrl={picking.previewUrl}
            resized={picking.resized}
          />
        )
      default:
        return picking satisfies never
    }
  }

  return (
    <FormDialog
      closeLabel={translate('edit.cancel')}
      isOpen={file !== null}
      isPending={edit.isPending}
      onClose={close}
      title={translate('photos.dialogTitle', { name })}
    >
      {content()}
    </FormDialog>
  )
}
