import { api, ROTULO_STATUS } from './api.js';

export async function renderPainel(el) {
  const p = await api('/painel');
  const tempo = p.tempo_medio_resolucao_horas;

  el.innerHTML = `
    <h2>Painel</h2>
    <div class="cards">
      <div class="card"><span>${p.total}</span>Total de chamados</div>
      ${Object.entries(ROTULO_STATUS)
        .map(([valor, nome]) => `<div class="card"><span>${p.por_status[valor]}</span>${nome}</div>`)
        .join('')}
      <div class="card"><span>${tempo === null ? '—' : tempo + ' h'}</span>Tempo médio de resolução</div>
    </div>`;
}
