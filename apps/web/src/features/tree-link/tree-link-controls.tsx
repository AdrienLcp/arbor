import type React from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'

import { linkRefusalKey } from '@/features/family-edits/link-refusal-key'
import type { FamilyEdit } from '@/features/family-edits/use-family-edit'
import type { PersonFace } from '@/features/family-tree/person-face'
import { Button } from '@/presentation/components/button'
import { ChoiceButtons } from '@/presentation/components/choice-buttons'
import { FINE_POINTER } from '@/presentation/components/fine-pointer'
import { FormDialog } from '@/presentation/components/form-dialog'
import { useMediaQuery } from '@/presentation/components/use-media-query'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { TreeLinkConfirmForm } from './tree-link-confirm-form'
import { TREE_LINK_KINDS } from './tree-link-step'
import type { TreeLink } from './use-tree-link'

import './tree-link-controls.sass'

type TreeLinkControlsProps = {
  edit: FamilyEdit
  faces: ReadonlyMap<EntityId, PersonFace>
  family: FamilyState
  link: TreeLink
}

/**
 * The "+ Ajouter" mode over the tree: the choice between someone new and a
 * kind of link, the banner that says whom to touch next, and the
 * confirmation that saves a link.
 */
export const TreeLinkControls: React.FC<TreeLinkControlsProps> = ({
  edit,
  faces,
  family,
  link
}) => {
  const translate = useTranslate()
  const hasFinePointer = useMediaQuery(FINE_POINTER)
  const { current } = link
  const calledName = (personId: EntityId) => {
    const face = faces.get(personId)
    return face === undefined
      ? translate('common.unnamedPerson')
      : face.givenNames || face.name
  }

  const banner = () => {
    switch (current.step) {
      case 'anchor':
        return translate('link.banner.anchor')
      case 'first':
        return translate(`link.banner.first.${current.kind}`)
      case 'second':
        return current.refused === null
          ? translate(`link.banner.second.${current.kind}`, {
              name: calledName(current.firstId)
            })
          : translate('link.banner.refused', {
              name: calledName(current.refused.personId),
              reason: translate(linkRefusalKey(current.refused.refusal))
            })
      default:
        return null
    }
  }
  const bannerText = banner()

  return (
    <>
      {bannerText === null ? null : (
        <div className='tree-link-banner'>
          <p className='tree-link-banner-text' role='status'>
            {bannerText}
            {hasFinePointer && current.step === 'first' ? (
              <span className='tree-link-banner-hint'>
                {translate('link.banner.drag')}
              </span>
            ) : null}
          </p>
          <Button onPress={link.cancel} variant='ghost'>
            {translate('link.banner.cancel')}
          </Button>
        </div>
      )}
      <FormDialog
        closeLabel={translate('link.banner.cancel')}
        isOpen={current.step === 'choosing'}
        onClose={link.cancel}
        title={translate('link.choose.title')}
      >
        <ChoiceButtons
          choices={[
            {
              hint: translate('link.choose.newPerson.hint'),
              id: 'newPerson',
              onPress: link.chooseNew,
              title: translate('link.choose.newPerson.title')
            }
          ]}
        />
        <p className='tree-link-choose-existing'>
          {translate('link.choose.existing')}
        </p>
        <ChoiceButtons
          choices={TREE_LINK_KINDS.map((kind) => ({
            hint: translate(`link.choose.${kind}.hint`),
            id: kind,
            onPress: () => link.choose(kind),
            title: translate(`link.choose.${kind}.title`)
          }))}
        />
      </FormDialog>
      <FormDialog
        closeLabel={translate('link.banner.cancel')}
        isOpen={current.step === 'confirming'}
        isPending={edit.isPending}
        onClose={link.cancel}
        title={translate('link.confirm.title')}
      >
        {current.step === 'confirming' ? (
          <TreeLinkConfirmForm
            edit={edit}
            faces={faces}
            family={family}
            firstId={current.firstId}
            kind={current.kind}
            onChooseOther={link.chooseOther}
            onDone={link.cancel}
            secondId={current.secondId}
          />
        ) : null}
      </FormDialog>
    </>
  )
}
