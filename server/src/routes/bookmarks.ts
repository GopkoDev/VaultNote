import { Router } from 'express';
import {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  reorderBookmarks,
} from '../controllers/bookmarksController';

export const bookmarksRouter = Router();

/** GET /api/bookmarks — list all */
bookmarksRouter.get('/', getBookmarks);

/** POST /api/bookmarks — create */
bookmarksRouter.post('/', createBookmark);

/** PUT /api/bookmarks/reorder — reorder (must come before /:id) */
bookmarksRouter.put('/reorder', reorderBookmarks);

/** PATCH /api/bookmarks/:id — rename */
bookmarksRouter.patch('/:id', updateBookmark);

/** DELETE /api/bookmarks/:id — delete */
bookmarksRouter.delete('/:id', deleteBookmark);
