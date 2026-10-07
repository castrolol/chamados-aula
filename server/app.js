import express from 'express';
import { chamadosRouter } from './routes/chamados.js';
import { painelRouter } from './routes/painel.js';
import { logger } from './logger.js';

export function createApp(db, { log = logger } = {}) {
  const app = express();
  app.use(express.json());

  app.use((req, res, next) => {
    res.on('finish', () => log.info(`${req.method} ${req.originalUrl} ${res.statusCode}`));
    next();
  });

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/chamados', chamadosRouter(db));
  app.use('/api/painel', painelRouter(db));
  app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ erro: 'JSON inválido' });
    }
    log.error(err.stack || String(err));
    res.status(500).json({ erro: 'Erro interno' });
  });

  return app;
}
