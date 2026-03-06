import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';

const app = express();
const PORT = process.env.PORT || 3001;

const DOCS_ROOT = resolve(__dirname, '../../', process.env.DOCS_ROOT || 'docs');

async function ensureDocsFolder(): Promise<void> {
  await fs.ensureDir(DOCS_ROOT);
  console.log(`Docs folder ready: ${DOCS_ROOT}`);
}

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', docsRoot: DOCS_ROOT });
});

ensureDocsFolder().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

export default app;
