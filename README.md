# Chamados

Sistema de chamados (help desk) pequeno, usado como projeto de prática em uma aula
sobre IA como ferramenta de trabalho em TI. Node + Express + SQLite no backend,
Vite com JavaScript puro no front.

## Requisitos

- Node.js 22.13 ou mais novo (recomendado 24; veja `.nvmrc`)
- Git

Em Windows, `scripts\instalar.cmd` ou `scripts\instalar.ps1` instalam Node, Git e
Claude Code (rodar como administrador).

## Como rodar

```bash
npm install
npm run dev      # API em http://localhost:3001 e front em http://localhost:5173
npm test
```

O banco (`data/chamados.db`) é criado e populado com 200 chamados na primeira
subida. Para recomeçar do zero: `npm run seed`.

## API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | verificação de vida |
| GET | `/api/chamados` | lista (`status`, `pagina`, `por_pagina`) |
| GET | `/api/chamados/:id` | detalhe |
| POST | `/api/chamados` | abre chamado (`titulo`, `solicitante`, `descricao`) |
| PATCH | `/api/chamados/:id/status` | muda status: `aberto`, `em_andamento`, `fechado` |
| PATCH | `/api/chamados/:id/responsavel` | atribui responsável (`null` remove) |
| GET | `/api/painel` | contagens por status e tempo médio de resolução |

## Estrutura

```
server/   API (app.js, db.js, routes/, services/, seed.js, logger.js)
web/      front (Vite, JavaScript puro)
test/     testes (node:test)
logs/     logs de exemplo
scripts/  instalação das ferramentas no Windows
```
