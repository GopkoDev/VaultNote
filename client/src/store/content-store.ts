import { makeAutoObservable, reaction, runInAction } from "mobx"
import { filesApi } from "@/api/files"
import { contentTabsStore } from "./content-tabs-store"
import { toast } from "sonner"

class ContentStore {
  content: string = ""
  currentPath: string | null = null
  isLoading: boolean = false

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true, deep: true })
    reaction(
      () => contentTabsStore.activeTab?.path ?? null,
      (path) => {
        runInAction(() => {
          this.content = ""
          this.currentPath = null
        })
        if (path) this.loadContent(path)
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
      if (res.ok) {
        this.content = res.data.content
      } else {
        toast.error(`Failed to load file: ${path}`)
        console.warn(res.error)
      }
    })
  }

  async saveContent(path: string, markdown: string) {
    await filesApi.update(path, markdown)
  }
}

export const contentStore = new ContentStore()
