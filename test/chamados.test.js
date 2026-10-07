import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { iniciar, chamar, inserir } from './helpers.js';

let ctx;
before(async () => {
  ctx = await iniciar();
});
after(() => ctx.fechar());

test('cria um chamado aberto', async () => {
  const { status, corpo } = await chamar(ctx.base, 'POST', '/api/chamados', {
    titulo: '  VPN fora do ar ',
    solicitante: 'Ana',
  });
  assert.equal(status, 201);
  assert.equal(corpo.titulo, 'VPN fora do ar');
  assert.equal(corpo.status, 'aberto');
  assert.equal(corpo.fechado_em, null);
});

test('rejeita chamado sem título', async () => {
  const { status } = await chamar(ctx.base, 'POST', '/api/chamados', { titulo: '   ', solicitante: 'Ana' });
  assert.equal(status, 400);
});

test('rejeita chamado sem solicitante', async () => {
  const { status } = await chamar(ctx.base, 'POST', '/api/chamados', { titulo: 'Algo' });
  assert.equal(status, 400);
});

test('lista filtrando por status', async () => {
  inserir(ctx.db, { titulo: 'em andamento', status: 'em_andamento' });
  const { status, corpo } = await chamar(ctx.base, 'GET', '/api/chamados?status=em_andamento');
  assert.equal(status, 200);
  assert.ok(corpo.itens.length >= 1);
  assert.ok(corpo.itens.every((c) => c.status === 'em_andamento'));
});

test('lista com status inválido retorna 400', async () => {
  const { status } = await chamar(ctx.base, 'GET', '/api/chamados?status=voando');
  assert.equal(status, 400);
});

test('chamado inexistente retorna 404', async () => {
  const { status } = await chamar(ctx.base, 'GET', '/api/chamados/99999');
  assert.equal(status, 404);
});

test('fechar um chamado grava fechado_em', async () => {
  const id = inserir(ctx.db, { titulo: 'para fechar' });
  const { status, corpo } = await chamar(ctx.base, 'PATCH', `/api/chamados/${id}/status`, { status: 'fechado' });
  assert.equal(status, 200);
  assert.equal(corpo.status, 'fechado');
  assert.ok(corpo.fechado_em);
});

test('reabrir um chamado limpa fechado_em', async () => {
  const id = inserir(ctx.db, { status: 'fechado', fechado_em: new Date().toISOString() });
  const { corpo } = await chamar(ctx.base, 'PATCH', `/api/chamados/${id}/status`, { status: 'aberto' });
  assert.equal(corpo.status, 'aberto');
  assert.equal(corpo.fechado_em, null);
});

test('status inválido retorna 400', async () => {
  const id = inserir(ctx.db, {});
  const { status } = await chamar(ctx.base, 'PATCH', `/api/chamados/${id}/status`, { status: 'sumiu' });
  assert.equal(status, 400);
});

test('atribui e remove responsável', async () => {
  const id = inserir(ctx.db, {});
  const atribuido = await chamar(ctx.base, 'PATCH', `/api/chamados/${id}/responsavel`, { responsavel: 'Paula' });
  assert.equal(atribuido.corpo.responsavel, 'Paula');
  const removido = await chamar(ctx.base, 'PATCH', `/api/chamados/${id}/responsavel`, { responsavel: null });
  assert.equal(removido.corpo.responsavel, null);
});
