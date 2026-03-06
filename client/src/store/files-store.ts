import { makeAutoObservable, runInAction } from "mobx"

import { filesApi } from "@/api/files"
import type { FileItem } from "@/types/files"

class FilesStore {
  tree: FileItem[] = []
  loading = false
  error: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async loadTree() {
    this.loading = true
    this.error = null

    const res = await filesApi.getTree()

    runInAction(() => {
      if (res.ok) {
        this.tree = res.data
      } else {
        this.error = res.error
      }
      this.loading = false
    })
  }

  async deleteFile(path: string) {
    const res = await filesApi.delete(path)
    if (res.ok) {
      await this.loadTree()
    }
    return res
  }

  async renameFile(path: string, newName: string) {
    const res = await filesApi.rename(path, newName)
    if (res.ok) {
      await this.loadTree()
    }
    return res
  }

  async moveFile(path: string, targetPath: string) {
    const res = await filesApi.move(path, targetPath)
    if (res.ok) {
      await this.loadTree()
    }
    return res
  }

  async createItem(path: string, type: "file" | "directory", content = "") {
    const res = await filesApi.create({ path, type, content })
    if (res.ok) {
      await this.loadTree()
    }
    return res
  }

  destroy = () => {
    this.tree = []
    this.loading = false
    this.error = null
  }
}

export const filesStore = new FilesStore()
