import { makeAutoObservable, runInAction } from "mobx"

import { filesApi } from "@/api/files"
import type { FileItem } from "@/types/files"

interface OpenedFile extends FileItem {
  content: string
}

class ContentStore {
  openedFiles: OpenedFile[] = []

  constructor() {
    makeAutoObservable(this)
  }

  async openFile(file: FileItem) {
    if (this.openedFiles.some((f) => f.path === file.path)) return

    this.openedFiles.push({ ...file, content: "" })

    await this._loadContent(file.path)
  }

  private async _loadContent(path: string) {
    const res = await filesApi.getContent(path)

    runInAction(() => {
      if (res.ok) {
        const opened = this.openedFiles.find((f) => f.path === path)
        if (opened) opened.content = res.data.content
      }
    })
  }
}

export const contentStore = new ContentStore()
