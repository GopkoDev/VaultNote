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

// ─── Env ──────────────────────────────────────────────────────────────────────

export interface Env {
  PORT: number;
  DOCS_ROOT: string;
  CLIENT_URL: string;
}
