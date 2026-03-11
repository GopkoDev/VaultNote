import { filesApi } from "@/api/files"
import type { FileItem } from "@/types/files"

export type FlatTreeNode =
  | { kind: "item"; item: FileItem; depth: number }
  | { kind: "new"; depth: number }
import { autorun, makeAutoObservable, reaction, runInAction } from "mobx"
import { toast } from "sonner"
import { contentTabsStore } from "./content-tabs-store"

const STORAGE_KEY = "tree-store"

interface PersistedState {
  isAutoRevealActiveFile: boolean
  openFolders: string[]
}

function loadFromStorage(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw
      ? JSON.parse(raw)
      : { isAutoRevealActiveFile: false, openFolders: [] }
  } catch {
    return { isAutoRevealActiveFile: false, openFolders: [] }
  }
}

interface CreatingState {
  parentPath: string | null
  type: "file" | "directory"
}

class TreeStore {
  tree: FileItem[] = []
  openFolders: Set<string> = new Set(loadFromStorage().openFolders)
  selectedFolderPath: string | null = null
  renamingPath: string | null = null
  creatingIn: CreatingState | null = null
  isAutoRevealActiveFile: boolean = loadFromStorage().isAutoRevealActiveFile

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true, deep: true })
    autorun(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isAutoRevealActiveFile: this.isAutoRevealActiveFile,
          openFolders: [...this.openFolders],
        })
      )
    })
    reaction(
      () => contentTabsStore.activeTab?.path ?? null,
      (path) => path && this.revealPath(path)
    )
  }

  async init() {
    await this.loadTree()
    const path = contentTabsStore.activeTab?.path
    if (path) this.revealPath(path)
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
      const slashIdx = path.lastIndexOf("/")
      const parentDir = slashIdx >= 0 ? path.slice(0, slashIdx) : ""
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

        contentTabsStore.renameTabsForPath(path, newPath)
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

        contentTabsStore.closeTabsForPath(path)
      })

      await this.loadTree()
    } else {
      toast.error(`Failed to delete`)
      console.warn(res.error)
    }
  }

  startCreate(type: "file" | "directory" | null, rootForce: boolean = false) {
    if (!type) this.creatingIn = null
    else
      this.creatingIn = {
        parentPath: rootForce ? null : this.selectedFolderPath,
        type,
      }
    if (this.selectedFolderPath) this.openFolders.add(this.selectedFolderPath)
  }

  async submitCreate(name: string): Promise<string | null> {
    if (!this.creatingIn) return null
    const { parentPath, type } = this.creatingIn
    const fullPath = parentPath ? `${parentPath}/${name}` : name
    this.creatingIn = null
    const res = await filesApi.create({ path: fullPath, type })
    if (res.ok) {
      await this.loadTree()
      return fullPath
    } else {
      toast.error(`Failed to create`)
      console.warn(res.error)
      return null
    }
  }

  toggleAutoRevealActiveFile() {
    this.isAutoRevealActiveFile = !this.isAutoRevealActiveFile
  }

  revealPath(filePath: string) {
    if (!this.isAutoRevealActiveFile) return

    const parts = filePath.split("/").filter(Boolean)
    for (let i = 1; i < parts.length; i++) {
      this.openFolders.add(parts.slice(0, i).join("/"))
    }
    this.selectedFolderPath =
      parts.length > 1 ? parts.slice(0, -1).join("/") : null
  }

  async moveFile(path: string, targetPath: string) {
    const res = await filesApi.move(path, targetPath)
    if (res.ok) {
      runInAction(() => {
        if (this.selectedFolderPath?.startsWith(path)) {
          this.selectedFolderPath =
            targetPath + this.selectedFolderPath.slice(path.length)
        }

        for (const p of [...this.openFolders]) {
          if (p.startsWith(path)) {
            this.openFolders.delete(p)
            this.openFolders.add(targetPath + p.slice(path.length))
          }
        }

        contentTabsStore.moveTabsForPath(path, targetPath)
      })

      await this.loadTree()
    } else {
      toast.error(`Failed to move`)
      console.warn(res.error)
    }
  }

  get flatVisibleNodes(): FlatTreeNode[] {
    const result: FlatTreeNode[] = []

    const traverse = (items: FileItem[], depth: number) => {
      for (const item of items) {
        result.push({ kind: "item", item, depth })
        if (item.type === "directory" && this.openFolders.has(item.path)) {
          traverse(item.children ?? [], depth + 1)
          if (this.creatingIn?.parentPath === item.path) {
            result.push({ kind: "new", depth: depth + 1 })
          }
        }
      }
    }

    traverse(this.tree, 0)
    if (this.creatingIn?.parentPath === null) {
      result.push({ kind: "new", depth: 0 })
    }

    return result
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
