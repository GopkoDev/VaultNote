// ─── File System Types ──────────────────────────────────────────────────────

export type FileItemType = 'file' | 'directory';

export interface FileItem {
  name: string;
  path: string;
  type: FileItemType;
  children?: FileItem[];
  size?: number;
  modified?: string;
}

export interface SearchResult {
  name: string;
  path: string;
  type: 'file';
  size?: number;
  modified?: string;
  snippet?: string;
  matchType: 'name' | 'content';
}

// ─── Request Bodies ──────────────────────────────────────────────────────────

export interface CreateFileBody {
  path: string;
  type: FileItemType;
  content?: string;
}

export interface UpdateFileBody {
  path: string;
  content: string;
}

export interface RenameBody {
  path: string;
  newName: string;
}

export interface MoveBody {
  path: string;
  targetPath: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface FilePathQuery {
  path: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
  details?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export interface Bookmark {
  id: number;
  name: string;
  path: string;
  sort_order: number;
  created_at: string;
}

export interface CreateBookmarkBody {
  name: string;
  path: string;
}

export interface UpdateBookmarkBody {
  name: string;
}

export interface ReorderBookmarksBody {
  ids: number[];
}

// ─── Env ──────────────────────────────────────────────────────────────────────

export interface Env {
  PORT: number;
  DOCS_ROOT: string;
  CLIENT_URL: string;
}
