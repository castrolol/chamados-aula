import { fileURLToPath } from 'node:url';
import { rmSync } from 'node:fs';
import { openDb } from './db.js';
import { logger } from './logger.js';

export const ARQUIVO_DB = fileURLToPath(new URL('../data/chamados.db', import.meta.url));

const ASSUNTOS = [
  'Não consigo acessar o VPN',
  'Impressora do 2º andar sem toner',
  'Senha do e-mail expirou',
  'Computador lento após atualização',
  'Pedido de novo monitor',
  'Erro ao abrir planilha compartilhada',
  'Wi-Fi cai toda hora na sala de reunião',
  'Instalar o Docker na máquina nova',
  'Acesso ao repositório negado',
  'Teclado com teclas travando',
  'Backup da pasta de projetos falhou',
  'Liberar porta no firewall para o ambiente de teste',
  'Licença do IDE expirada',
  'Sem som no headset durante chamadas',
  'Criar usuário para estagiário novo',
];
const PESSOAS = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio', 'Gabi', 'Heitor', 'Iara', 'João'];
const TECNICOS = ['Marcos', 'Paula', 'Renato', 'Sofia'];

// gerador pseudoaleatório com semente fixa: todo mundo recebe os mesmos dados
function mulberry32(semente) {
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function popular(db, quantidade = 200) {
  const rand = mulberry32(42);
  const escolher = (lista) => lista[Math.floor(rand() * lista.length)];
  const agora = Date.now();
  const HORA = 3600 * 1000;
  const inserir = db.prepare(
    `INSERT INTO chamados (titulo, descricao, solicitante, responsavel, status, criado_em, fechado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );

  db.exec('BEGIN');
  for (let i = 0; i < quantidade; i++) {
    const criado = agora - Math.floor(rand() * 90 * 24) * HORA - Math.floor(rand() * 24) * HORA;
    const sorteio = rand();
    const status = sorteio < 0.5 ? 'fechado' : sorteio < 0.8 ? 'em_andamento' : 'aberto';
    const responsavel = status === 'aberto' && rand() < 0.7 ? null : escolher(TECNICOS);
    let fechado = null;
    if (status === 'fechado') {
      fechado = Math.min(criado + (1 + Math.floor(rand() * 72)) * HORA, agora);
    }
    inserir.run(
      escolher(ASSUNTOS),
      'Descrição gerada pelo seed para fins de aula.',
      escolher(PESSOAS),
      responsavel,
      status,
      new Date(criado).toISOString(),
      fechado ? new Date(fechado).toISOString() : null,
    );
  }
  db.exec('COMMIT');
}

export function contar(db) {
  return db.prepare('SELECT COUNT(*) AS n FROM chamados').get().n;
}

// `npm run seed` apaga o banco e popula de novo
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  rmSync(ARQUIVO_DB, { force: true });
  const db = openDb(ARQUIVO_DB);
  popular(db);
  logger.info(`Banco recriado com ${contar(db)} chamados em ${ARQUIVO_DB}`);
}
