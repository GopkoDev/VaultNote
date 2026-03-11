import { _request as request } from "./_request"
import type { ApiResponse, FileItem, SearchResult } from "@/types/files"

export const filesApi = {
  getTree(): Promise<ApiResponse<FileItem[]>> {
    return request("/api/files")
  },

  getContent(
    path: string
  ): Promise<ApiResponse<{ content: string; path: string }>> {
    return request(`/api/files/content?path=${encodeURIComponent(path)}`)
  },

  search(q: string): Promise<ApiResponse<SearchResult[]>> {
    return request(`/api/files/search?q=${encodeURIComponent(q)}`)
  },

  create(body: {
    path: string
    type: "file" | "directory"
    content?: string
  }): Promise<ApiResponse<FileItem>> {
    return request("/api/files", {
      method: "POST",
      body: JSON.stringify(body),
    })
  },

  update(
    path: string,
    content: string
  ): Promise<ApiResponse<{ path: string; modified: string }>> {
    return request("/api/files", {
      method: "PUT",
      body: JSON.stringify({ path, content }),
    })
  },

  delete(path: string): Promise<ApiResponse<{ deleted: string }>> {
    return request(`/api/files?path=${encodeURIComponent(path)}`, {
      method: "DELETE",
    })
  },

  rename(path: string, newName: string): Promise<ApiResponse<FileItem>> {
    return request("/api/files/rename", {
      method: "PATCH",
      body: JSON.stringify({ path, newName }),
    })
  },

  move(path: string, targetPath: string): Promise<ApiResponse<FileItem>> {
    return request("/api/files/move", {
      method: "PATCH",
      body: JSON.stringify({ path, targetPath }),
    })
  },
}
