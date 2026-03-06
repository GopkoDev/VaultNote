import { Router } from 'express';
import {
  validatePath,
  requirePathQuery,
  requirePathBody,
} from '../middleware/validatePath';
import {
  getTree,
  getFileContent,
  createItem,
  updateFile,
  deleteItem,
  renameItem,
  moveItem,
  searchFiles,
} from '../controllers/filesController';

export const filesRouter = Router();

/**
 * GET /api/files
 * Returns recursive file tree
 */
filesRouter.get('/', getTree);

/**
 * GET /api/files/search?q=keyword
 * Search files by name or content
 */
filesRouter.get('/search', searchFiles);

/**
 * GET /api/files/content?path=notes/todo.md
 * Returns raw content of a file
 */
filesRouter.get('/content', requirePathQuery, validatePath, getFileContent);

/**
 * POST /api/files
 * Create file or directory
 * Body: { path, type, content? }
 */
filesRouter.post('/', requirePathBody, validatePath, createItem);

/**
 * PUT /api/files
 * Update file content
 * Body: { path, content }
 */
filesRouter.put('/', requirePathBody, validatePath, updateFile);

/**
 * DELETE /api/files?path=notes/old.md
 * Delete file or directory
 */
filesRouter.delete('/', requirePathQuery, validatePath, deleteItem);

/**
 * PATCH /api/files/rename
 * Rename file or directory
 * Body: { path, newName }
 */
filesRouter.patch('/rename', requirePathBody, validatePath, renameItem);

/**
 * PATCH /api/files/move
 * Move file or directory
 * Body: { path, targetPath }
 */
filesRouter.patch('/move', requirePathBody, validatePath, moveItem);
