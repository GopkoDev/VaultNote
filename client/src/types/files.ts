export type FileItemType = "file" | "directory"

export interface FileItem {
  name: string
  path: string
  type: FileItemType
  children?: FileItem[]
  size?: number
  modified?: string
}

export interface SearchResult {
  name: string
  path: string
  type: "file"
  size?: number
  modified?: string
  snippet?: string
  matchType: "name" | "content"
}

export interface ApiSuccess<T = unknown> {
  ok: true
  data: T
}

export interface ApiError {
  ok: false
  error: string
  details?: string
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError
