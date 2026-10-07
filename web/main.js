import './style.css';
import { renderLista } from './lista.js';
import { renderDetalhe } from './detalhe.js';
import { renderPainel } from './painel.js';
import { esc } from './api.js';

const app = document.getElementById('app');

async function rotear() {
  const [, rota, id] = location.hash.split('/');
  try {
    if (rota === 'painel') await renderPainel(app);
    else if (rota === 'chamado' && id) await renderDetalhe(app, id);
    else await renderLista(app);
  } catch (erro) {
    app.innerHTML = `<p class="erro">${esc(erro.message)}</p>`;
  }
}

window.addEventListener('hashchange', rotear);
rotear();
