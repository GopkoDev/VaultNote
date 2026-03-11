import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/database';
import { createError } from '../middleware/errorHandler';
import type {
  CreateBookmarkBody,
  UpdateBookmarkBody,
  ReorderBookmarksBody,
} from '../types/index';

/**
 * GET /api/bookmarks
 * Returns all bookmarks sorted by sort_order, then created_at
 */
export async function getBookmarks(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
    });
    res.json({ ok: true, data: bookmarks });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/bookmarks
 * Create a new bookmark
 * Body: { name, path }
 */
export async function createBookmark(
  req: Request<object, object, CreateBookmarkBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, path } = req.body;

    if (!name?.trim()) return next(createError('name is required', 400));
    if (!path?.trim()) return next(createError('path is required', 400));

    const max = await prisma.bookmark.aggregate({ _max: { sort_order: true } });
    const nextOrder = (max._max.sort_order ?? 0) + 1;

    const bookmark = await prisma.bookmark.create({
      data: { name: name.trim(), path: path.trim(), sort_order: nextOrder },
    });

    res.status(201).json({ ok: true, data: bookmark });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/bookmarks/:id
 * Rename a bookmark
 * Body: { name }
 */
export async function updateBookmark(
  req: Request<{ id: string }, object, UpdateBookmarkBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    if (!name?.trim()) return next(createError('name is required', 400));

    const existing = await prisma.bookmark.findUnique({ where: { id } });
    if (!existing) return next(createError(`Bookmark not found: ${id}`, 404));

    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: { name: name.trim() },
    });

    res.json({ ok: true, data: bookmark });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/bookmarks/:id
 * Delete a bookmark
 */
export async function deleteBookmark(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.bookmark.findUnique({ where: { id } });
    if (!existing) return next(createError(`Bookmark not found: ${id}`, 404));

    await prisma.bookmark.delete({ where: { id } });

    res.json({ ok: true, data: { deleted: id } });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/bookmarks/reorder
 * Reorder bookmarks by providing an ordered array of IDs
 * Body: { ids: number[] }
 */
export async function reorderBookmarks(
  req: Request<object, object, ReorderBookmarksBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return next(createError('ids must be an array', 400));
    }

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.bookmark.update({
          where: { id },
          data: { sort_order: index },
        })
      )
    );

    res.json({ ok: true, data: { reordered: ids.length } });
  } catch (err) {
    next(err);
  }
}
