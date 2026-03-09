import { filesApi } from "@/api/files"
import type { FileItem } from "@/types/files"
import { autorun, makeAutoObservable, runInAction } from "mobx"
import { toast } from "sonner"

const STORAGE_KEY = "tree-store"

function loadFromStorage(): { isAutoRevealActiveFile: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { isAutoRevealActiveFile: false }
  } catch {
    return { isAutoRevealActiveFile: false }
  }
}

interface CreatingState {
  parentPath: string | null
  type: "file" | "directory"
}

class TreeStore {
  tree: FileItem[] = []
  openFolders: Set<string> = new Set()
  selectedFolderPath: string | null = null
  renamingPath: string | null = null
  creatingIn: CreatingState | null = null
  isAutoRevealActiveFile: boolean = loadFromStorage().isAutoRevealActiveFile

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true, deep: true })
    autorun(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ isAutoRevealActiveFile: this.isAutoRevealActiveFile })
      )
    })
  }

  async loadTree() {
    const res = await filesApi.getTree()

    runInAction(() => {
      if (res.ok) {
        this.tree = res.data
      } else {
        this.tree = []
        toast.error("Failed to load tree")
        console.warn(res.error)
        throw new Error(res.error)
      }
    })
  }

  isFolderOpen = (path: string): boolean => {
    return this.openFolders.has(path)
  }

  isFolderSelected = (path: string) => {
    return this.selectedFolderPath === path
  }

  isRenaming = (path: string): boolean => {
    return this.renamingPath === path
  }

  toggleFolder(path: string) {
    const isCurrentlyOpen = this.openFolders.has(path)
    if (isCurrentlyOpen) {
      this.openFolders.delete(path)
    } else {
      this.openFolders.add(path)
    }

    if (
      isCurrentlyOpen &&
      this.selectedFolderPath &&
      (this.selectedFolderPath === path ||
        this.selectedFolderPath.startsWith(path + "/"))
    ) {
      this.selectedFolderPath = path
    }
  }

  setSelectedFolderPath(path: string | null) {
    this.selectedFolderPath = path
  }

  collapseAll() {
    this.openFolders.clear()
    this.selectedFolderPath = null
  }

  startRename(path: string | null) {
    this.renamingPath = path
  }

  async submitRename(path: string, newName: string) {
    this.renamingPath = null

    const res = await filesApi.rename(path, newName)

    if (res.ok) {
      const parentDir = path.slice(0, path.lastIndexOf("/"))
      const newPath = parentDir ? `${parentDir}/${newName}` : newName

      runInAction(() => {
        if (this.selectedFolderPath?.startsWith(path)) {
          this.selectedFolderPath =
            newPath + this.selectedFolderPath.slice(path.length)
        }

        for (const p of [...this.openFolders]) {
          if (p.startsWith(path)) {
            this.openFolders.delete(p)
            this.openFolders.add(newPath + p.slice(path.length))
          }
        }
      })

      await this.loadTree()
    } else {
      toast.error(`Failed to rename`)
      console.warn(res.error)
    }

    return res.ok
  }

  async submitDelete(deleteTarget: FileItem) {
    if (!deleteTarget) return
    const res = await filesApi.delete(deleteTarget.path)
    if (res.ok) {
      const path = deleteTarget.path

      runInAction(() => {
        if (this.selectedFolderPath?.startsWith(path)) {
          this.selectedFolderPath = null
        }

        for (const p of [...this.openFolders]) {
          if (p.startsWith(path)) this.openFolders.delete(p)
        }
      })

      await this.loadTree()
    } else {
      toast.error(`Failed to delete`)
      console.warn(res.error)
    }
  }

  startCreate(type: "file" | "directory" | null) {
    if (!type) this.creatingIn = null
    else this.creatingIn = { parentPath: this.selectedFolderPath, type }
    if (this.selectedFolderPath) this.openFolders.add(this.selectedFolderPath)
  }

  isCreatingHere = (path: string): boolean => {
    return this.creatingIn?.parentPath === path
  }

  async submitCreate(name: string) {
    if (!this.creatingIn) return
    const { parentPath, type } = this.creatingIn
    const fullPath = parentPath ? `${parentPath}/${name}` : name
    this.creatingIn = null
    const res = await filesApi.create({ path: fullPath, type })
    if (res.ok) {
      await this.loadTree()
    } else {
      toast.error(`Failed to create`)
      console.warn(res.error)
    }
  }

  toggleAutoRevealActiveFile() {
    this.isAutoRevealActiveFile = !this.isAutoRevealActiveFile
  }

  // expandToPath(path: string): void {
  //   if (this.isAutoRevealActiveFile) return
  //   const parts = path.split("/").filter(Boolean)
  //   for (let i = 1; i <= parts.length; i++) {
  //     this.openFolders.add(parts.slice(0, i).join("/"))
  //   }
  // }

  async moveFile(path: string, targetPath: string) {
    const res = await filesApi.move(path, targetPath)
    if (res.ok) {
      await this.loadTree()
    } else {
      toast.error(`Failed to move`)
      console.warn(res.error)
    }
  }

  destroy() {
    this.tree = []
    this.openFolders.clear()
    this.selectedFolderPath = null
    this.renamingPath = null
    this.creatingIn = null
  }
}

export const treeStore = new TreeStore()
