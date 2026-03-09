import { makeAutoObservable, autorun } from "mobx"
import { arrayMove } from "@dnd-kit/sortable"
import type { OpenedTab } from "./types/content-tabs-store.types"

const STORAGE_KEY = "content-tabs-store"

function buildNewTab(isActive = true): OpenedTab {
  const id = Date.now()
  return { id, path: null, title: "New tab", isActive }
}

function buildDefaultTabs(): Record<number, OpenedTab> {
  const tab = buildNewTab()
  return { [tab.id]: tab }
}

function loadFromStorage(): Record<number, OpenedTab> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildDefaultTabs()
    const parsed = JSON.parse(raw) as Record<number, OpenedTab>
    if (!Object.keys(parsed).length) return buildDefaultTabs()
    return parsed
  } catch {
    return buildDefaultTabs()
  }
}

class ContentTabsStore {
  openedTabs: Record<number, OpenedTab> = loadFromStorage()
  mode: "edit" | "view" = "view"

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true, deep: true })
    autorun(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.openedTabs))
    })
  }

  get activeTab(): OpenedTab | null {
    return Object.values(this.openedTabs).find((tab) => tab.isActive) || null
  }

  addOpenedTab(): void {
    const openedTabsNew: Record<number, OpenedTab> = Object.keys(
      this.openedTabs
    ).reduce(
      (acc, key) => ({
        ...acc,
        [Number(key)]: {
          ...this.openedTabs[Number(key)],
          isActive: false,
        },
      }),
      {} as Record<number, OpenedTab>
    )
    const newTab = buildNewTab()
    openedTabsNew[newTab.id] = newTab

    this.openedTabs = openedTabsNew
  }

  removeOpenedTab(id: number): void {
    const targetTab = this.openedTabs[id]
    if (!targetTab) return

    const wasActive = targetTab.isActive
    const remaining = Object.fromEntries(
      Object.entries(this.openedTabs).filter(([key]) => Number(key) !== id)
    ) as Record<number, OpenedTab>

    if (Object.keys(remaining).length === 0) {
      this.addOpenedTab()
      return
    }

    if (wasActive) {
      const lastKey = Number(Object.keys(remaining).at(-1))
      remaining[lastKey] = { ...remaining[lastKey], isActive: true }
    }

    this.openedTabs = remaining
  }

  setOpenedTabActive(id: number): void {
    if (!this.openedTabs[id]) return

    this.openedTabs = Object.fromEntries(
      Object.entries(this.openedTabs).map(([key, tab]) => [
        key,
        { ...tab, isActive: Number(key) === id },
      ])
    ) as Record<number, OpenedTab>
  }

  reorderOpenedTabs(activeId: number, overId: number): void {
    const tabsList = Object.values(this.openedTabs)
    const activeIndex = tabsList.findIndex((tab) => tab.id === activeId)
    const overIndex = tabsList.findIndex((tab) => tab.id === overId)

    if (activeIndex === -1 || overIndex === -1) return

    const newTabs = arrayMove(tabsList, activeIndex, overIndex)

    this.openedTabs = Object.fromEntries(
      newTabs.map((tab) => [tab.id, tab])
    ) as Record<number, OpenedTab>
  }

  updateTabData({ path, name }: { path: string; name: string }) {
    const tab = Object.values(this.openedTabs).find((tab) => tab.isActive)
    if (!tab) return

    this.openedTabs[tab.id] = { ...tab, title: name, path }
  }

  closeTabsForPath(path: string): void {
    const tabs = Object.values(this.openedTabs)
    tabs.forEach((tab) => {
      if (tab.path && (tab.path === path || tab.path.startsWith(path + "/"))) {
        this.removeOpenedTab(tab.id)
      }
    })
  }

  renameTabsForPath(oldPath: string, newPath: string): void {
    this.openedTabs = Object.fromEntries(
      Object.entries(this.openedTabs).map(([key, tab]) => {
        if (!tab.path || !tab.path.startsWith(oldPath)) return [key, tab]
        const updatedPath = newPath + tab.path.slice(oldPath.length)
        const name = updatedPath.split("/").pop() ?? tab.title
        return [key, { ...tab, path: updatedPath, title: name }]
      })
    )
  }

  moveTabsForPath(oldPath: string, newPath: string): void {
    this.renameTabsForPath(oldPath, newPath)
  }

  toggleMode(): void {
    this.mode = this.mode === "edit" ? "view" : "edit"
  }
}

export const contentTabsStore = new ContentTabsStore()
