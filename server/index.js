import { openDb } from './db.js';
import { createApp } from './app.js';
import { ARQUIVO_DB, popular, contar } from './seed.js';
import { logger } from './logger.js';

const PORTA = Number(process.env.PORT) || 3001;

const db = openDb(ARQUIVO_DB);
if (contar(db) === 0) {
  popular(db);
  logger.info('Banco vazio: populado com chamados de exemplo');
}

createApp(db).listen(PORTA, () => {
  logger.info(`API no ar em http://localhost:${PORTA}`);
});
