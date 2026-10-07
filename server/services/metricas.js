export function contagemPorStatus(db) {
  const contagem = { aberto: 0, em_andamento: 0, fechado: 0 };
  const linhas = db.prepare('SELECT status, COUNT(*) AS n FROM chamados GROUP BY status').all();
  for (const { status, n } of linhas) contagem[status] = n;
  return contagem;
}

// Média, em horas, do tempo de atendimento dos chamados.
export function tempoMedioResolucaoHoras(db) {
  const { horas } = db
    .prepare(
      `SELECT AVG((julianday(COALESCE(fechado_em, 'now')) - julianday(criado_em)) * 24) AS horas
       FROM chamados`,
    )
    .get();
  return horas === null ? null : Math.round(horas * 10) / 10;
}
