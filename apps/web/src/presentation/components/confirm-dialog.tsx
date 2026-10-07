import type React from 'react'
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components'

import { Button } from './button'

import './confirm-dialog.sass'

type ConfirmDialogProps = {
  cancelLabel: string
  /** What happens if they confirm, in a sentence or two. */
  children: React.ReactNode
  confirmLabel: string
  isOpen: boolean
  /** The confirmation is on its way: the buttons wait for it. */
  isPending?: boolean
  onCancel: () => void
  onConfirm: () => void
  title: string
}

/** Asks before an action that changes things for other people — replacing the family link. */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  cancelLabel,
  children,
  confirmLabel,
  isOpen,
  isPending = false,
  onCancel,
  onConfirm,
  title
}) => (
  <ModalOverlay
    className='confirm-dialog-overlay'
    isDismissable={!isPending}
    isOpen={isOpen}
    onOpenChange={(isStillOpen) => {
      if (!isStillOpen) onCancel()
    }}
  >
    <Modal className='confirm-dialog-modal'>
      <Dialog className='confirm-dialog' role='alertdialog'>
        <Heading className='confirm-dialog-title' slot='title'>
          {title}
        </Heading>
        <div className='confirm-dialog-body'>{children}</div>
        <div className='confirm-dialog-actions'>
          <Button isDisabled={isPending} onPress={onCancel} variant='ghost'>
            {cancelLabel}
          </Button>
          <Button isPending={isPending} onPress={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </Dialog>
    </Modal>
  </ModalOverlay>
)
