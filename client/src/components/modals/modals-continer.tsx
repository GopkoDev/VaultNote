import { lazy, Suspense } from "react"
import { modalStore } from "@/store/modal-store"
import { observer } from "mobx-react-lite"

const ConfirmModal = lazy(() => import("./confirm-modal"))

export default observer(function ModalsContainer() {
  const { modalProps } = modalStore

  return (
    <Suspense fallback={null}>
      {!!modalProps.confirm && (
        <ConfirmModal
          title={modalProps.title as string}
          description={modalProps.description as string}
          confirmText={modalProps.confirmText as string}
          cancelText={modalProps.cancelText as string}
          onConfirm={modalProps.onConfirm as () => void}
          onCancel={modalProps.onCancel as () => void}
          onClose={modalProps.onClose as () => void}
        />
      )}
    </Suspense>
  )
})
