import { makeAutoObservable, runInAction } from "mobx"

class ModalStore {
  modalProps: Record<string, unknown> = {}

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true, deep: true })
  }

  updateModalProps = (payload: Record<string, unknown>) => {
    console.log("update modal props", payload)

    const payloadPare = Object.entries(payload)
    payloadPare.forEach((pare) => {
      runInAction(() => {
        this.modalProps[pare[0]] = pare[1]
      })
    })
  }

  resetModalProps = () => {
    runInAction(() => {
      this.modalProps = {}
    })
  }
}

export const modalStore = new ModalStore()
