import { api, esc, ROTULO_STATUS, formatarData } from './api.js';

export async function renderDetalhe(el, id) {
  const c = await api(`/chamados/${id}`);

  el.innerHTML = `
    <p><a href="#/">&larr; Voltar</a></p>
    <h2>#${c.id} — ${esc(c.titulo)}</h2>
    <p>${esc(c.descricao) || '<em>Sem descrição.</em>'}</p>
    <dl>
      <dt>Solicitante</dt><dd>${esc(c.solicitante)}</dd>
      <dt>Responsável</dt><dd>${esc(c.responsavel) || '—'}</dd>
      <dt>Status</dt><dd><span class="status ${c.status}">${ROTULO_STATUS[c.status]}</span></dd>
      <dt>Aberto em</dt><dd>${formatarData(c.criado_em)}</dd>
      <dt>Fechado em</dt><dd>${formatarData(c.fechado_em)}</dd>
    </dl>
    <div class="acoes">
      ${Object.entries(ROTULO_STATUS)
        .filter(([valor]) => valor !== c.status)
        .map(([valor, nome]) => `<button data-status="${valor}">Marcar como ${nome.toLowerCase()}</button>`)
        .join('')}
    </div>
    <form id="atribuir">
      <input name="responsavel" placeholder="Responsável" value="${esc(c.responsavel)}" />
      <button>Atribuir</button>
    </form>`;

  const recarregar = () => renderDetalhe(el, id);
  const tentar = async (acao) => {
    try {
      await acao();
      recarregar();
    } catch (erro) {
      alert(erro.message);
    }
  };

  el.querySelectorAll('[data-status]').forEach((botao) =>
    botao.addEventListener('click', () =>
      tentar(() => api(`/chamados/${id}/status`, { metodo: 'PATCH', corpo: { status: botao.dataset.status } })),
    ),
  );

  el.querySelector('#atribuir').addEventListener('submit', (e) => {
    e.preventDefault();
    const responsavel = new FormData(e.target).get('responsavel').trim() || null;
    tentar(() => api(`/chamados/${id}/responsavel`, { metodo: 'PATCH', corpo: { responsavel } }));
  });
}
