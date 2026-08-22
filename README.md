# Brev.ly

Encurtador de URL: cadastra links com slug escolhido por quem cria, redireciona o link curto para o
original, conta os acessos e exporta um relatório em CSV servido por CDN.

É o desafio avaliativo de uma pós-graduação, entregue como um repositório só, com backend e frontend.

## Stack

**Backend** (`server/`): Node.js 24, TypeScript, Fastify, Zod, Drizzle, PostgreSQL, Cloudflare R2 e
OpenAPI gerado dos próprios schemas.

**Frontend** (`web/`): React com Vite, TypeScript, Tailwind 4, React Query, React Hook Form e Zod.

**Esteira**: Biome (lint e formatação), Commitlint, Vitest e GitHub Actions rodando lint, testes e
build em cada Pull Request.

## Como rodar

Pré-requisitos: Node 24 (o repositório tem `.nvmrc`), Docker e uma conta Cloudflare R2 para o
relatório em CSV.

```bash
git clone https://github.com/williammpDev/brevly-url-shortener.git
cd brevly-url-shortener
npm install
```

Copie os três arquivos de exemplo e preencha o que for necessário:

```bash
cp .env.example .env
cp server/.env.example server/.env
cp web/.env.example web/.env
```

O `.env` da raiz serve ao Docker Compose e funciona sem edição. Em `server/.env`, preencha as cinco
variáveis do Cloudflare — `CLOUDFLARE_ACCOUNT_ID` é só o identificador de 32 caracteres, sem
`https://` e sem `.r2.cloudflarestorage.com`. Sem elas o server não sobe, e a mensagem diz qual
falta.

Suba o banco e aplique as migrations:

```bash
docker compose up -d --wait
npm run db:migrate --workspace=server
```

Em dois terminais:

```bash
npm run dev --workspace=server   # API em http://localhost:3333
npm run dev --workspace=web      # interface em http://localhost:5173
```

## Scripts

Na raiz, valendo para os dois projetos:

| Comando | O que faz |
|---|---|
| `npm run lint` | Biome sobre `server/` e `web/` |
| `npm run lint:fix` | corrige o que for automático |
| `npm run test` | Vitest nos dois workspaces |
| `npm run build` | compila os dois |

No `server/`: `db:generate` cria migration a partir do schema, `db:migrate` aplica, `db:studio` abre
o navegador de dados do Drizzle.

## API

Com o server rodando, a documentação fica em **http://localhost:3333/docs**, e o documento OpenAPI
cru em `/docs/json`. Ela é gerada a partir dos mesmos schemas Zod que validam as rotas, então não
envelhece em relação ao código.

| Rota | O que faz |
|---|---|
| `POST /links` | cadastra; 409 se o slug já existe |
| `GET /links` | lista, do mais recente para o mais antigo |
| `GET /links/:slug` | devolve o link, sem contar acesso |
| `PATCH /links/:slug/access-count` | soma 1 ao contador |
| `DELETE /links/:slug` | remove |
| `POST /links/exports` | gera o CSV no R2 e devolve a URL pública |

## Decisões de arquitetura

As decisões estão registradas em [`docs/arquitetura.md`](docs/arquitetura.md), cada uma no formato
Escolhemos / Porque / Descartamos. As que mais afetam quem lê o código:

- **O redirecionamento é do frontend, não um 302 do backend.** A página `/:slug` consulta a API,
  registra o acesso e então redireciona — é o que permite tela de carregamento e página de link não
  encontrado.
- **Buscar e contar são rotas separadas**, e o incremento é uma única instrução SQL: dois acessos
  simultâneos não perdem contagem.
- **O relatório vai do cursor do Postgres direto para o R2 por stream**, sem montar o CSV em memória.
- **A API devolve só o slug**; quem monta a URL curta é o frontend, com o próprio domínio.
- **Postgres pelo driver `postgres-js`**, e não node-postgres, porque é ele que expõe o cursor de que
  o relatório depende.

Contexto do projeto, estado atual e requisitos do enunciado estão em
[`docs/contexto.md`](docs/contexto.md). O fluxo de contribuição está em
[`CONTRIBUTING.md`](CONTRIBUTING.md).

## Qualidade

Cada Pull Request roda lint, testes e build no GitHub Actions, e a `main` só aceita merge com os dois
checks verdes. São 131 testes automatizados: 85 no backend e 46 no frontend.

Além do automatizado, cada entrega foi verificada contra o serviço real — requisições à API com o
Postgres de pé, upload e download no R2, e a interface exercitada no navegador.
