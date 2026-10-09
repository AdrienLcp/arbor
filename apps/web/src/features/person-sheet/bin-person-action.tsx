import type React from 'react'
import { useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'

import { EditFailureNotice } from '@/features/family-edits/edit-failure-notice'
import type { FamilyEdit } from '@/features/family-edits/use-family-edit'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import type { PersonFace } from '@/features/family-tree/person-face'
import {
  familyTreePathFor,
  useNavigateTo
} from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { ConfirmDialog } from '@/presentation/components/confirm-dialog'
import { BinIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'
import { useWordList } from '@/presentation/i18n/word-list'

import { binConsequences } from './bin-consequences'

type BinPersonActionProps = {
  edit: FamilyEdit
  face: PersonFace
  faces: ReadonlyMap<EntityId, PersonFace>
  family: FamilyState
}

/** Puts a person in the bin after saying which links and photos leave the tree with them, and that nothing is lost. */
export const BinPersonAction: React.FC<BinPersonActionProps> = ({
  edit,
  face,
  faces,
  family
}) => {
  const translate = useTranslate()
  const wordList = useWordList()
  const navigateTo = useNavigateTo()
  const { familyId } = useOpenFamily()
  const [isAsking, setIsAsking] = useState(false)

  const consequences = binConsequences(family, face.id)
  const namesOf = (ids: readonly EntityId[]): string =>
    wordList(
      ids.map((id) => faces.get(id)?.name ?? translate('common.unnamedPerson'))
    )
  const leaving = [
    ...(consequences.partnerIds.length === 0
      ? []
      : [
          translate('bin.partners', {
            names: namesOf(consequences.partnerIds)
          })
        ]),
    ...(consequences.parentIds.length === 0
      ? []
      : [
          translate('bin.parents', {
            names: namesOf(consequences.parentIds)
          })
        ]),
    ...(consequences.childIds.length === 0
      ? []
      : [
          translate('bin.children', {
            names: namesOf(consequences.childIds)
          })
        ]),
    ...(consequences.photoCount === 0
      ? []
      : [translate('bin.photos', { count: consequences.photoCount })])
  ]

  const cancel = () => {
    edit.dismissFailure()
    setIsAsking(false)
  }
  const binPerson = () =>
    edit.save([{ personId: face.id, type: 'person.bin' }], () =>
      navigateTo(familyTreePathFor(familyId), { replace: true })
    )

  return (
    <>
      <Button
        className='sheet-bin'
        onPress={() => setIsAsking(true)}
        variant='link'
      >
        <BinIcon aria-hidden='true' />
        {translate('bin.open')}
      </Button>
      <ConfirmDialog
        cancelLabel={translate('bin.cancel')}
        confirmLabel={translate('bin.confirm')}
        isOpen={isAsking}
        isPending={edit.isPending}
        onCancel={cancel}
        onConfirm={binPerson}
        title={translate('bin.title', { name: face.name })}
      >
        {leaving.length === 0 ? (
          <p>{translate('bin.nothingLinked')}</p>
        ) : (
          <>
            <p>{translate('bin.leaving')}</p>
            <ul className='sheet-bin-list'>
              {leaving.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p>{translate('bin.stays')}</p>
          </>
        )}
        {edit.failure === null ? null : (
          <EditFailureNotice failure={edit.failure} />
        )}
      </ConfirmDialog>
    </>
  )
}
