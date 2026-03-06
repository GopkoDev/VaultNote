import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs-extra';
import { config } from '../config';
import { createError } from '../middleware/errorHandler';
import type {
  FileItem,
  CreateFileBody,
  UpdateFileBody,
  RenameBody,
  MoveBody,
} from '../types/index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toRelative(absPath: string): string {
  return path.relative(config.DOCS_ROOT, absPath);
}

function toAbsolute(relPath: string): string {
  return path.resolve(config.DOCS_ROOT, relPath);
}

function sortItems(a: FileItem, b: FileItem): number {
  if (a.type === b.type) return a.name.localeCompare(b.name);
  return a.type === 'directory' ? -1 : 1;
}

async function buildTree(absPath: string): Promise<FileItem> {
  const stat = await fs.stat(absPath);
  const name = path.basename(absPath);
  const rel = toRelative(absPath);

  if (stat.isDirectory()) {
    const entries = await fs.readdir(absPath);
    const children = await Promise.all(
      entries.filter((e) => !e.startsWith('.')).map((e) => buildTree(path.join(absPath, e))),
    );

    children.sort(sortItems);

    return { name, path: rel, type: 'directory', children };
  }

  return {
    name,
    path: rel,
    type: 'file',
    size: stat.size,
    modified: stat.mtime.toISOString(),
  };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/files
 * Returns full recursive file tree from DOCS_ROOT
 */
export async function getTree(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await fs.ensureDir(config.DOCS_ROOT);
    const entries = await fs.readdir(config.DOCS_ROOT);
    const children = await Promise.all(
      entries
        .filter((e) => !e.startsWith('.'))
        .map((e) => buildTree(path.join(config.DOCS_ROOT, e))),
    );

    children.sort(sortItems);

    res.json({ ok: true, data: children });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/files/content?path=notes/todo.md
 * Returns raw text content of a file
 */
export async function getFileContent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const relPath = req.query['path'] as string;
    const absPath = toAbsolute(relPath);

    if (!(await fs.pathExists(absPath))) {
      return next(createError(`File not found: ${relPath}`, 404));
    }

    const stat = await fs.stat(absPath);
    if (stat.isDirectory()) {
      return next(createError('Cannot read content of a directory', 400));
    }

    const content = await fs.readFile(absPath, 'utf-8');
    res.json({ ok: true, data: { content, path: relPath } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/files
 * Create a new file or directory
 * Body: { path, type, content? }
 */
export async function createItem(
  req: Request<object, object, CreateFileBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { path: relPath, type, content = '' } = req.body;
    const absPath = toAbsolute(relPath);

    if (await fs.pathExists(absPath)) {
      return next(createError(`Already exists: ${relPath}`, 409));
    }

    if (type === 'directory') {
      await fs.ensureDir(absPath);
    } else {
      await fs.ensureDir(path.dirname(absPath));
      await fs.writeFile(absPath, content, 'utf-8');
    }

    const item = await buildTree(absPath);
    res.status(201).json({ ok: true, data: item });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/files
 * Update file content
 * Body: { path, content }
 */
export async function updateFile(
  req: Request<object, object, UpdateFileBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { path: relPath, content } = req.body;
    const absPath = toAbsolute(relPath);

    if (!(await fs.pathExists(absPath))) {
      return next(createError(`File not found: ${relPath}`, 404));
    }

    const stat = await fs.stat(absPath);
    if (stat.isDirectory()) {
      return next(createError('Cannot write content to a directory', 400));
    }

    await fs.writeFile(absPath, content, 'utf-8');

    res.json({
      ok: true,
      data: {
        path: relPath,
        modified: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/files?path=notes/old.md
 * Delete a file or directory (recursive)
 */
export async function deleteItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const relPath = req.query['path'] as string;
    const absPath = toAbsolute(relPath);

    if (!(await fs.pathExists(absPath))) {
      return next(createError(`Not found: ${relPath}`, 404));
    }

    await fs.remove(absPath);

    res.json({ ok: true, data: { deleted: relPath } });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/files/rename
 * Rename a file or directory
 * Body: { path, newName }
 */
export async function renameItem(
  req: Request<object, object, RenameBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { path: relPath, newName } = req.body;

    if (!newName?.trim()) {
      return next(createError('newName is required', 400));
    }

    const absPath = toAbsolute(relPath);
    const parentDir = path.dirname(absPath);
    const newAbsPath = path.join(parentDir, newName);
    const newRelPath = toRelative(newAbsPath);

    if (!(await fs.pathExists(absPath))) {
      return next(createError(`Not found: ${relPath}`, 404));
    }

    if (await fs.pathExists(newAbsPath)) {
      return next(createError(`Already exists: ${newRelPath}`, 409));
    }

    await fs.move(absPath, newAbsPath);

    const item = await buildTree(newAbsPath);
    res.json({ ok: true, data: item });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/files/move
 * Move a file or directory to a new location
 * Body: { path, targetPath }
 */
export async function moveItem(
  req: Request<object, object, MoveBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { path: relPath, targetPath } = req.body;
    const absPath = toAbsolute(relPath);
    const absTargetPath = toAbsolute(targetPath);

    if (!(await fs.pathExists(absPath))) {
      return next(createError(`Not found: ${relPath}`, 404));
    }

    if (await fs.pathExists(absTargetPath)) {
      return next(createError(`Target already exists: ${targetPath}`, 409));
    }

    await fs.ensureDir(path.dirname(absTargetPath));
    await fs.move(absPath, absTargetPath);

    const item = await buildTree(absTargetPath);
    res.json({ ok: true, data: item });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/files/search?q=keyword
 * Search files by name or content
 */
export async function searchFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = (req.query['q'] as string)?.toLowerCase().trim();

    if (!query) {
      return next(createError('Missing search query: q', 400));
    }

    const results: FileItem[] = [];

    async function walk(dir: string): Promise<void> {
      const entries = await fs.readdir(dir);

      await Promise.all(
        entries
          .filter((e) => !e.startsWith('.'))
          .map(async (entry) => {
            const absPath = path.join(dir, entry);
            const stat = await fs.stat(absPath);

            if (stat.isDirectory()) {
              await walk(absPath);
            } else if (entry.endsWith('.md')) {
              const nameMatch = entry.toLowerCase().includes(query);

              if (nameMatch) {
                results.push({
                  name: entry,
                  path: toRelative(absPath),
                  type: 'file',
                  size: stat.size,
                  modified: stat.mtime.toISOString(),
                });
                return;
              }

              const content = await fs.readFile(absPath, 'utf-8');
              if (content.toLowerCase().includes(query)) {
                results.push({
                  name: entry,
                  path: toRelative(absPath),
                  type: 'file',
                  size: stat.size,
                  modified: stat.mtime.toISOString(),
                });
              }
            }
          }),
      );
    }

    await walk(config.DOCS_ROOT);

    res.json({ ok: true, data: results });
  } catch (err) {
    next(err);
  }
}
