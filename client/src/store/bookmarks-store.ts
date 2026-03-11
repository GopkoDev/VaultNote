import { makeAutoObservable, runInAction } from "mobx"
import { bookmarksApi } from "@/api/bookmarks"
import type { Bookmark } from "@/types/bookmarks"
import { toast } from "sonner"

class BookmarksStore {
  bookmarks: Bookmark[] = []

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true, deep: true })
  }

  async load() {
    const res = await bookmarksApi.getAll()
    runInAction(() => {
      if (res.ok) {
        this.bookmarks = res.data
      } else {
        toast.error("Failed to load bookmarks")
      }
    })
  }

  isPathBookmarked(path: string): boolean {
    return this.bookmarks.some((b) => b.path === path)
  }

  bookmarksForPath(path: string): Bookmark[] {
    return this.bookmarks.filter((b) => b.path === path)
  }

  async create(name: string, path: string): Promise<boolean> {
    const res = await bookmarksApi.create({ name, path })
    if (res.ok) {
      runInAction(() => this.bookmarks.push(res.data))
      toast.success("Bookmark added")
    } else {
      toast.error("Failed to add bookmark")
    }
    return res.ok
  }

  async rename(id: number, name: string): Promise<boolean> {
    const res = await bookmarksApi.update(id, name)
    if (res.ok) {
      runInAction(() => {
        const idx = this.bookmarks.findIndex((b) => b.id === id)
        if (idx >= 0) this.bookmarks[idx] = res.data
      })
    } else {
      toast.error("Failed to rename bookmark")
    }
    return res.ok
  }

  async remove(id: number): Promise<boolean> {
    const res = await bookmarksApi.delete(id)
    if (res.ok) {
      runInAction(() => {
        this.bookmarks = this.bookmarks.filter((b) => b.id !== id)
      })
    } else {
      toast.error("Failed to delete bookmark")
    }
    return res.ok
  }

  async reorder(ids: number[]): Promise<void> {
    // Optimistic update first
    runInAction(() => {
      const map = new Map(this.bookmarks.map((b) => [b.id, b]))
      this.bookmarks = ids.map((id) => map.get(id)!).filter(Boolean)
    })

    const res = await bookmarksApi.reorder(ids)
    if (!res.ok) {
      toast.error("Failed to reorder bookmarks")
      await this.load()
    }
  }
}

export const bookmarksStore = new BookmarksStore()
