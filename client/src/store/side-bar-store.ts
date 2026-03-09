import { makeAutoObservable } from "mobx"
import { type SideHeaderButtonType } from "./types/side-bar-store.types"

class SideBarStore {
  activeSideBarTab: SideHeaderButtonType = "archive"

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true, deep: true })
  }

  setActiveSideBarTab(type: SideHeaderButtonType): void {
    this.activeSideBarTab = type
  }
}

export const sideBarStore = new SideBarStore()
