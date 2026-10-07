export async function api(caminho, { metodo = 'GET', corpo } = {}) {
  const res = await fetch('/api' + caminho, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  const dados = await res.json();
  if (!res.ok) throw new Error(dados.erro || 'Erro inesperado');
  return dados;
}

export function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export const ROTULO_STATUS = { aberto: 'Aberto', em_andamento: 'Em andamento', fechado: 'Fechado' };

export function formatarData(iso) {
  return iso ? new Date(iso).toLocaleString('pt-BR') : '—';
}
