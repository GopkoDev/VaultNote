import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import { config } from './config';
import { logger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { filesRouter } from './routes/files';

function createApp() {
  const app = express();

  // ─── Middleware ───────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: config.CLIENT_URL,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(logger);

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        docsRoot: config.DOCS_ROOT,
      },
    });
  });

  // ─── Routes ───────────────────────────────────────────────────────────────
  app.use('/api/files', filesRouter);

  // ─── 404 ──────────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'Route not found' });
  });

  // ─── Error handler ────────────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}

async function bootstrap(): Promise<void> {
  await fs.ensureDir(config.DOCS_ROOT);

  const app = createApp();

  app.listen(config.PORT, () => {
    console.log('\x1b[36m');
    console.log('╔════════════════════════════════════╗');
    console.log('║        VaultNote  Server           ║');
    console.log('╚════════════════════════════════════╝');
    console.log('\x1b[0m');
    console.log(
      `\x1b[32m✓\x1b[0m Server running on  \x1b[1mhttp://localhost:${config.PORT}\x1b[0m`,
    );
    console.log(`\x1b[32m✓\x1b[0m Docs root:         \x1b[1m${config.DOCS_ROOT}\x1b[0m`);
    console.log(`\x1b[32m✓\x1b[0m Client origin:     \x1b[1m${config.CLIENT_URL}\x1b[0m`);
    console.log('');
  });
}

bootstrap().catch((err) => {
  console.error('\x1b[31m[FATAL]\x1b[0m', err);
  process.exit(1);
});

export default createApp;
