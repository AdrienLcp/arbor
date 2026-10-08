import type React from 'react'
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components'

import { Button } from './button'
import { ClearIcon } from './icons'

import './form-dialog.sass'

type FormDialogProps = {
  children: React.ReactNode
  /** Names the button that closes the dialog without saving. */
  closeLabel: string
  isOpen: boolean
  /** A save is on its way: the dialog stays until it lands. */
  isPending?: boolean
  onClose: () => void
  title: string
}

/** A form over the page, for a change made in a few fields: the whole screen on a phone, a panel on a computer. */
export const FormDialog: React.FC<FormDialogProps> = ({
  children,
  closeLabel,
  isOpen,
  isPending = false,
  onClose,
  title
}) => (
  <ModalOverlay
    className='form-dialog-overlay'
    isDismissable={!isPending}
    isKeyboardDismissDisabled={isPending}
    isOpen={isOpen}
    onOpenChange={(isStillOpen) => {
      if (!isStillOpen) onClose()
    }}
  >
    <Modal className='form-dialog-modal'>
      <Dialog className='form-dialog'>
        <div className='form-dialog-head'>
          <Heading className='form-dialog-title' slot='title'>
            {title}
          </Heading>
          <Button
            aria-label={closeLabel}
            className='form-dialog-close'
            isDisabled={isPending}
            onPress={onClose}
            variant='quiet'
          >
            <ClearIcon aria-hidden='true' />
          </Button>
        </div>
        <div className='form-dialog-body'>{children}</div>
      </Dialog>
    </Modal>
  </ModalOverlay>
)
