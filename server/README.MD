# VaultNote Server — API Reference

Base URL: `http://localhost:3001`

All responses follow a unified envelope:

```ts
// Success
{ ok: true, data: T }

// Error
{ ok: false, error: string, details?: string }
```

---

## Health Check

### `GET /api/health`

Server status check.

**Response `200`**

```json
{
  "ok": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-03-06T10:00:00.000Z",
    "docsRoot": "/absolute/path/to/docs"
  }
}
```

---

## Files API — `/api/files`

### `GET /api/files`

Returns a recursive tree of files and directories from `DOCS_ROOT`.  
Sorting: directories first, then files — both alphabetically.  
Hidden files (starting with `.`) are ignored.

**Response `200`**

```json
{
  "ok": true,
  "data": [
    {
      "name": "notes",
      "path": "notes",
      "type": "directory",
      "children": [
        {
          "name": "todo.md",
          "path": "notes/todo.md",
          "type": "file",
          "size": 1024,
          "modified": "2026-03-06T10:00:00.000Z"
        }
      ]
    }
  ]
}
```

---

### `GET /api/files/search?q=keyword`

Search within `.md` files — by filename and content.
Case-insensitive. Name matches take priority (file is not opened if name matches).
Content matches include a surrounding text snippet (up to 160 chars).

**Query params**

| Param | Type   | Required | Description   |
| ----- | ------ | -------- | ------------- |
| `q`   | string | ✅       | Search string |

**Response `200`**

```json
{
  "ok": true,
  "data": [
    {
      "name": "todo.md",
      "path": "notes/todo.md",
      "type": "file",
      "size": 1024,
      "modified": "2026-03-06T10:00:00.000Z",
      "matchType": "name"
    },
    {
      "name": "ideas.md",
      "path": "notes/ideas.md",
      "type": "file",
      "size": 2048,
      "modified": "2026-03-06T10:00:00.000Z",
      "matchType": "content",
      "snippet": "…some surrounding text with the keyword inside…"
    }
  ]
}
```

| Field       | Type                    | Description                                      |
| ----------- | ----------------------- | ------------------------------------------------ |
| `matchType` | `"name"` \| `"content"` | Whether keyword matched the filename or content  |
| `snippet`   | string                  | Context snippet around match (only for content)  |

**Errors**

| Status | Reason                  |
| ------ | ----------------------- |
| `400`  | `q` is missing or empty |

---

### `GET /api/files/content?path=notes/todo.md`

Returns the raw text content of a file.

**Query params**

| Param  | Type   | Required | Description                    |
| ------ | ------ | -------- | ------------------------------ |
| `path` | string | ✅       | Relative path from `DOCS_ROOT` |

**Response `200`**

```json
{
  "ok": true,
  "data": {
    "content": "# Todo\n- [ ] Task 1",
    "path": "notes/todo.md"
  }
}
```

**Errors**

| Status | Reason                              |
| ------ | ----------------------------------- |
| `400`  | `path` is missing or is a directory |
| `403`  | Path is outside the vault           |
| `404`  | File not found                      |

---

### `POST /api/files`

Creates a new file or directory.

**Request body**

```json
{
  "path": "notes/new-note.md",
  "type": "file",
  "content": "# New Note"
}
```

| Field     | Type                      | Required | Description                     |
| --------- | ------------------------- | -------- | ------------------------------- |
| `path`    | string                    | ✅       | Relative path of the new item   |
| `type`    | `"file"` \| `"directory"` | ✅       | Item type                       |
| `content` | string                    | ❌       | Initial content (for file only) |

**Response `201`**

```json
{
  "ok": true,
  "data": {
    "name": "new-note.md",
    "path": "notes/new-note.md",
    "type": "file",
    "size": 12,
    "modified": "2026-03-06T10:00:00.000Z"
  }
}
```

**Errors**

| Status | Reason                        |
| ------ | ----------------------------- |
| `400`  | `path` is missing             |
| `403`  | Path is outside the vault     |
| `409`  | File/directory already exists |

---

### `PUT /api/files`

Updates the content of an existing file.

**Request body**

```json
{
  "path": "notes/todo.md",
  "content": "# Updated content"
}
```

| Field     | Type   | Required | Description           |
| --------- | ------ | -------- | --------------------- |
| `path`    | string | ✅       | Relative path of file |
| `content` | string | ✅       | New file content      |

**Response `200`**

```json
{
  "ok": true,
  "data": {
    "path": "notes/todo.md",
    "modified": "2026-03-06T10:05:00.000Z"
  }
}
```

**Errors**

| Status | Reason                              |
| ------ | ----------------------------------- |
| `400`  | `path` is missing or is a directory |
| `403`  | Path is outside the vault           |
| `404`  | File not found                      |

---

### `DELETE /api/files?path=notes/old.md`

Deletes a file or directory (recursively).

**Query params**

| Param  | Type   | Required | Description                    |
| ------ | ------ | -------- | ------------------------------ |
| `path` | string | ✅       | Relative path from `DOCS_ROOT` |

**Response `200`**

```json
{
  "ok": true,
  "data": {
    "deleted": "notes/old.md"
  }
}
```

**Errors**

| Status | Reason                    |
| ------ | ------------------------- |
| `400`  | `path` is missing         |
| `403`  | Path is outside the vault |
| `404`  | Item not found            |

---

### `PATCH /api/files/rename`

Renames a file or directory (stays in the same folder).

**Request body**

```json
{
  "path": "notes/old-name.md",
  "newName": "new-name.md"
}
```

| Field     | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| `path`    | string | ✅       | Relative path of current item |
| `newName` | string | ✅       | New name (not full path)      |

**Response `200`**

```json
{
  "ok": true,
  "data": {
    "name": "new-name.md",
    "path": "notes/new-name.md",
    "type": "file",
    "size": 1024,
    "modified": "2026-03-06T10:00:00.000Z"
  }
}
```

**Errors**

| Status | Reason                         |
| ------ | ------------------------------ |
| `400`  | `path` or `newName` is missing |
| `403`  | Path is outside the vault      |
| `404`  | Item not found                 |
| `409`  | New name already exists        |

---

### `PATCH /api/files/move`

Moves a file or directory to a new location.

**Request body**

```json
{
  "path": "notes/todo.md",
  "targetPath": "archive/todo.md"
}
```

| Field        | Type   | Required | Description                            |
| ------------ | ------ | -------- | -------------------------------------- |
| `path`       | string | ✅       | Current relative path                  |
| `targetPath` | string | ✅       | New relative path (including filename) |

**Response `200`**

```json
{
  "ok": true,
  "data": {
    "name": "todo.md",
    "path": "archive/todo.md",
    "type": "file",
    "size": 1024,
    "modified": "2026-03-06T10:00:00.000Z"
  }
}
```

**Errors**

| Status | Reason                            |
| ------ | --------------------------------- |
| `400`  | `path` or `targetPath` is missing |
| `403`  | Path is outside the vault         |
| `404`  | Item not found                    |
| `409`  | Target already exists             |

---

## Bookmarks API — `/api/bookmarks`

Bookmarks are stored in a local SQLite database (`.data/vaultnote.db`).

### `GET /api/bookmarks`

Returns all bookmarks sorted by `sort_order`, then `created_at`.

**Response `200`**

```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "My Note",
      "path": "notes/my-note.md",
      "sort_order": 0,
      "created_at": "2026-03-11T10:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/bookmarks`

Creates a new bookmark. `sort_order` is assigned automatically (appended to end).

**Request body**

```json
{
  "name": "My Note",
  "path": "notes/my-note.md"
}
```

| Field  | Type   | Required | Description               |
| ------ | ------ | -------- | ------------------------- |
| `name` | string | ✅       | Display name              |
| `path` | string | ✅       | Relative path from vault  |

**Response `201`**

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "name": "My Note",
    "path": "notes/my-note.md",
    "sort_order": 1,
    "created_at": "2026-03-11T10:00:00.000Z"
  }
}
```

**Errors**

| Status | Reason                    |
| ------ | ------------------------- |
| `400`  | `name` or `path` missing  |

---

### `PATCH /api/bookmarks/:id`

Renames a bookmark.

**Request body**

```json
{ "name": "New Name" }
```

| Field  | Type   | Required | Description  |
| ------ | ------ | -------- | ------------ |
| `name` | string | ✅       | New name     |

**Response `200`**

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "name": "New Name",
    "path": "notes/my-note.md",
    "sort_order": 0,
    "created_at": "2026-03-11T10:00:00.000Z"
  }
}
```

**Errors**

| Status | Reason              |
| ------ | ------------------- |
| `400`  | `name` is missing   |
| `404`  | Bookmark not found  |

---

### `DELETE /api/bookmarks/:id`

Deletes a bookmark.

**Response `200`**

```json
{ "ok": true, "data": { "deleted": 1 } }
```

**Errors**

| Status | Reason             |
| ------ | ------------------ |
| `404`  | Bookmark not found |

---

### `PUT /api/bookmarks/reorder`

Reorders bookmarks by providing a full ordered array of IDs.

**Request body**

```json
{ "ids": [3, 1, 2] }
```

| Field | Type       | Required | Description                          |
| ----- | ---------- | -------- | ------------------------------------ |
| `ids` | `number[]` | ✅       | All bookmark IDs in desired order    |

**Response `200`**

```json
{ "ok": true, "data": { "reordered": 3 } }
```

**Errors**

| Status | Reason             |
| ------ | ------------------ |
| `400`  | `ids` is not array |

---

## Security

- **Path traversal protection** — all paths are validated by the `validatePath` middleware. Any path outside `DOCS_ROOT` returns `403 Forbidden`.
- **CORS** — only origin from `CLIENT_URL` (`.env`) is allowed.
- **JSON limit** — request body is limited to `10mb`.

---

## Environment Variables

Всі змінні задаються в кореневому `.env` файлі.

| Variable       | Default                          | Description              |
| -------------- | -------------------------------- | ------------------------ |
| `PORT`         | `3001`                           | HTTP server port         |
| `DOCS_ROOT`    | `./docs`                         | Path to notes directory  |
| `CLIENT_URL`   | `http://localhost:5173`          | Client origin for CORS   |
| `DATABASE_URL` | `file:./.data/vaultnote.db`      | SQLite database path     |

---

## TypeScript Types

```ts
type FileItemType = 'file' | 'directory';

interface FileItem {
  name: string;
  path: string; // relative from DOCS_ROOT
  type: FileItemType;
  children?: FileItem[]; // only for directory
  size?: number; // bytes, only for file
  modified?: string; // ISO date string, only for file
}

interface SearchResult extends FileItem {
  matchType: 'name' | 'content';
  snippet?: string; // only when matchType === 'content'
}

interface Bookmark {
  id: number;
  name: string;
  path: string; // relative from DOCS_ROOT
  sort_order: number;
  created_at: string; // ISO date string
}
```
