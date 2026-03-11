import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import { defineConfig } from 'prisma/config';

const dbPath = path.resolve(process.cwd(), '.data', 'vaultnote.db');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: `file:${dbPath}`,
  },
});
