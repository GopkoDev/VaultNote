import path from 'path';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../generated/prisma/client';

const dbPath = path.resolve(process.cwd(), '.data', 'vaultnote.db');

const adapter = new PrismaLibSql({ url: `file:${dbPath}` });

export const prisma = new PrismaClient({ adapter });
