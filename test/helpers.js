import { openDb } from '../server/db.js';
import { createApp } from '../server/app.js';

const silencioso = { info() {}, warn() {}, error() {} };

export async function iniciar() {
  const db = openDb(':memory:');
  const server = await new Promise((resolve) => {
    const s = createApp(db, { log: silencioso }).listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  return {
    db,
    base,
    fechar: () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  };
}

export async function chamar(base, metodo, caminho, corpo) {
  const res = await fetch(base + caminho, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  return { status: res.status, corpo: await res.json() };
}

export function inserir(db, { titulo = 'Chamado', status = 'aberto', criado_em, fechado_em = null }) {
  const r = db
    .prepare(
      `INSERT INTO chamados (titulo, solicitante, status, criado_em, fechado_em)
       VALUES (?, 'Teste', ?, ?, ?)`,
    )
    .run(titulo, status, criado_em ?? new Date().toISOString(), fechado_em);
  return Number(r.lastInsertRowid);
}
