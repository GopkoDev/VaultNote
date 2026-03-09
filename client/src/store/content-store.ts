import { makeAutoObservable, reaction, runInAction } from "mobx"
import { filesApi } from "@/api/files"
import { contentTabsStore } from "./content-tabs-store"

class ContentStore {
  content: string = ""
  currentPath: string | null = null
  isLoading: boolean = false

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true, deep: true })
    reaction(
      () => contentTabsStore.activeTab?.path ?? null,
      (path) => {
        if (path) this.loadContent(path)
        else
          runInAction(() => {
            this.content = ""
            this.currentPath = null
          })
      },
      { fireImmediately: true }
    )
  }

  async loadContent(path: string) {
    runInAction(() => {
      this.isLoading = true
      this.currentPath = path
    })

    const res = await filesApi.getContent(path)

    runInAction(() => {
      this.isLoading = false
      // Ignore stale responses if the active tab changed while loading
      if (this.currentPath !== path) return
      if (res.ok) this.content = res.data.content
    })
  }

  async saveContent(path: string, markdown: string) {
    await filesApi.update(path, markdown)
  }
}

export const contentStore = new ContentStore()
