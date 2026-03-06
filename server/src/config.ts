import dotenv from 'dotenv';
import path from 'path';
import type { Env } from './types';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config: Env = {
  PORT: parseInt(process.env['PORT'] ?? '3001', 10),
  DOCS_ROOT: path.resolve(__dirname, '../..', requireEnv('DOCS_ROOT', './docs')),
  CLIENT_URL: requireEnv('CLIENT_URL', 'http://localhost:5173'),
};
