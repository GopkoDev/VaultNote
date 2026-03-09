import { modalStore } from "@/store/modal-store"

import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog"

interface ConfirmModalProps {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onCancel?: () => void
  onConfirm?: () => void
  onClose?: () => void
}
export default function ConfirmModal({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onCancel,
  onConfirm = () => {},
  onClose,
}: ConfirmModalProps) {
  const { resetModalProps } = modalStore

  const onCancelClick = () => {
    if (onCancel) onCancel()
    else resetModalProps()
  }

  const onCloseClick = () => {
    if (onClose) onClose()
    else resetModalProps()
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCloseClick()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancelClick}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
