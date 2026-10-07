import { Router } from 'express';

export const STATUS = ['aberto', 'em_andamento', 'fechado'];

function lerId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ erro: 'Id inválido' });
    return null;
  }
  return id;
}

function textoObrigatorio(valor, max) {
  return typeof valor === 'string' && valor.trim().length > 0 && valor.trim().length <= max;
}

export function chamadosRouter(db) {
  const router = Router();

  const buscar = db.prepare('SELECT * FROM chamados WHERE id = ?');

  router.get('/', (req, res) => {
    const { status } = req.query;
    if (status !== undefined && !STATUS.includes(status)) {
      return res.status(400).json({ erro: `Status deve ser um de: ${STATUS.join(', ')}` });
    }
    const porPagina = Math.min(Math.max(Number(req.query.por_pagina) || 20, 1), 100);
    const pagina = Math.max(Number(req.query.pagina) || 1, 1);
    const filtro = status ? 'WHERE status = ?' : '';
    const params = status ? [status] : [];

    const total = db.prepare(`SELECT COUNT(*) AS n FROM chamados ${filtro}`).get(...params).n;
    const itens = db
      .prepare(`SELECT * FROM chamados ${filtro} ORDER BY id DESC LIMIT ? OFFSET ?`)
      .all(...params, porPagina, (pagina - 1) * porPagina);

    res.json({ itens, total, pagina, por_pagina: porPagina });
  });

  router.get('/:id', (req, res) => {
    const id = lerId(req, res);
    if (id === null) return;
    const chamado = buscar.get(id);
    if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado' });
    res.json(chamado);
  });

  router.post('/', (req, res) => {
    const { titulo, descricao = '', solicitante } = req.body ?? {};
    if (!textoObrigatorio(titulo, 120)) {
      return res.status(400).json({ erro: 'Título é obrigatório (até 120 caracteres)' });
    }
    if (!textoObrigatorio(solicitante, 80)) {
      return res.status(400).json({ erro: 'Solicitante é obrigatório (até 80 caracteres)' });
    }
    if (typeof descricao !== 'string') {
      return res.status(400).json({ erro: 'Descrição deve ser texto' });
    }
    const resultado = db
      .prepare('INSERT INTO chamados (titulo, descricao, solicitante, criado_em) VALUES (?, ?, ?, ?)')
      .run(titulo.trim(), descricao.trim(), solicitante.trim(), new Date().toISOString());
    res.status(201).json(buscar.get(Number(resultado.lastInsertRowid)));
  });

  router.patch('/:id/status', (req, res) => {
    const id = lerId(req, res);
    if (id === null) return;
    const { status } = req.body ?? {};
    if (!STATUS.includes(status)) {
      return res.status(400).json({ erro: `Status deve ser um de: ${STATUS.join(', ')}` });
    }
    if (!buscar.get(id)) return res.status(404).json({ erro: 'Chamado não encontrado' });

    const fechadoEm = status === 'fechado' ? new Date().toISOString() : null;
    db.prepare('UPDATE chamados SET status = ?, fechado_em = ? WHERE id = ?').run(status, fechadoEm, id);
    res.json(buscar.get(id));
  });

  router.patch('/:id/responsavel', (req, res) => {
    const id = lerId(req, res);
    if (id === null) return;
    const { responsavel } = req.body ?? {};
    if (responsavel !== null && !textoObrigatorio(responsavel, 80)) {
      return res.status(400).json({ erro: 'Responsável deve ser um nome (ou null para remover)' });
    }
    if (!buscar.get(id)) return res.status(404).json({ erro: 'Chamado não encontrado' });

    db.prepare('UPDATE chamados SET responsavel = ? WHERE id = ?').run(responsavel?.trim() ?? null, id);
    res.json(buscar.get(id));
  });

  return router;
}
