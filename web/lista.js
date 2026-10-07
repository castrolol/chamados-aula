import { api, esc, ROTULO_STATUS, formatarData } from './api.js';

export async function renderLista(el) {
  const filtro = sessionStorage.getItem('filtroStatus') || '';
  const query = filtro ? `?status=${filtro}` : '';
  const { itens, total } = await api('/chamados' + query);

  el.innerHTML = `
    <h2>Chamados <small>(${total})</small></h2>
    <form id="novo">
      <input name="titulo" placeholder="Título" required />
      <input name="solicitante" placeholder="Solicitante" required />
      <button>Abrir chamado</button>
    </form>
    <label>Status:
      <select id="filtro">
        <option value="">todos</option>
        ${Object.entries(ROTULO_STATUS)
          .map(([valor, nome]) => `<option value="${valor}" ${valor === filtro ? 'selected' : ''}>${nome}</option>`)
          .join('')}
      </select>
    </label>
    <table>
      <thead><tr><th>#</th><th>Título</th><th>Solicitante</th><th>Responsável</th><th>Status</th><th>Aberto em</th></tr></thead>
      <tbody>
        ${itens
          .map(
            (c) => `<tr>
              <td>${c.id}</td>
              <td><a href="#/chamado/${c.id}">${esc(c.titulo)}</a></td>
              <td>${esc(c.solicitante)}</td>
              <td>${esc(c.responsavel) || '—'}</td>
              <td><span class="status ${c.status}">${ROTULO_STATUS[c.status]}</span></td>
              <td>${formatarData(c.criado_em)}</td>
            </tr>`,
          )
          .join('')}
      </tbody>
    </table>`;

  el.querySelector('#filtro').addEventListener('change', (e) => {
    sessionStorage.setItem('filtroStatus', e.target.value);
    renderLista(el);
  });

  el.querySelector('#novo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(e.target));
    try {
      await api('/chamados', { metodo: 'POST', corpo: dados });
      renderLista(el);
    } catch (erro) {
      alert(erro.message);
    }
  });
}
