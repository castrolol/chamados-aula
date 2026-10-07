import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { iniciar, chamar, inserir } from './helpers.js';

let ctx;
before(async () => {
  ctx = await iniciar();
});
after(() => ctx.fechar());

test('painel conta chamados por status', async () => {
  inserir(ctx.db, { status: 'aberto' });
  inserir(ctx.db, { status: 'aberto' });
  inserir(ctx.db, { status: 'em_andamento' });
  inserir(ctx.db, {
    status: 'fechado',
    criado_em: '2026-01-01T10:00:00.000Z',
    fechado_em: '2026-01-01T12:00:00.000Z',
  });

  const { status, corpo } = await chamar(ctx.base, 'GET', '/api/painel');
  assert.equal(status, 200);
  assert.equal(corpo.total, 4);
  assert.deepEqual(corpo.por_status, { aberto: 2, em_andamento: 1, fechado: 1 });
});
