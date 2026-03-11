import { _request as request } from "./_request"
import type { ApiResponse } from "@/types/files"
import type { Bookmark } from "@/types/bookmarks"

export const bookmarksApi = {
  getAll(): Promise<ApiResponse<Bookmark[]>> {
    return request("/api/bookmarks")
  },

  create(body: { name: string; path: string }): Promise<ApiResponse<Bookmark>> {
    return request("/api/bookmarks", {
      method: "POST",
      body: JSON.stringify(body),
    })
  },

  update(id: number, name: string): Promise<ApiResponse<Bookmark>> {
    return request(`/api/bookmarks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    })
  },

  delete(id: number): Promise<ApiResponse<{ deleted: number }>> {
    return request(`/api/bookmarks/${id}`, { method: "DELETE" })
  },

  reorder(ids: number[]): Promise<ApiResponse<{ reordered: number }>> {
    return request("/api/bookmarks/reorder", {
      method: "PUT",
      body: JSON.stringify({ ids }),
    })
  },
}
