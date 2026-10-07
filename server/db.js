import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS chamados (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo      TEXT NOT NULL,
  descricao   TEXT NOT NULL DEFAULT '',
  solicitante TEXT NOT NULL,
  responsavel TEXT,
  status      TEXT NOT NULL DEFAULT 'aberto'
              CHECK (status IN ('aberto', 'em_andamento', 'fechado')),
  criado_em   TEXT NOT NULL,
  fechado_em  TEXT
);
CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados (status);
`;

export function openDb(arquivo = ':memory:') {
  if (arquivo !== ':memory:') mkdirSync(dirname(arquivo), { recursive: true });
  const db = new DatabaseSync(arquivo);
  db.exec(SCHEMA);
  return db;
}
