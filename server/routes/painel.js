import { Router } from 'express';
import { contagemPorStatus, tempoMedioResolucaoHoras } from '../services/metricas.js';

export function painelRouter(db) {
  const router = Router();

  router.get('/', (req, res) => {
    const por_status = contagemPorStatus(db);
    res.json({
      total: Object.values(por_status).reduce((soma, n) => soma + n, 0),
      por_status,
      tempo_medio_resolucao_horas: tempoMedioResolucaoHoras(db),
    });
  });

  return router;
}
