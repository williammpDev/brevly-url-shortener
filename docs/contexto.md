# Contexto do projeto

Brev.ly é um encurtador de URL. Permite cadastrar, listar e remover links encurtados, redireciona
o link curto para o original e exporta um relatório de acessos em CSV. É o desafio avaliativo de
uma pós-graduação, com entrega até 28/08/2026 — o que é avaliado é este repositório.

## Stack

Backend: Node.js, TypeScript, Fastify, Zod, Drizzle, PostgreSQL, Cloudflare R2, OpenAPI.
Frontend: React, Vite, TypeScript.
Ambiente local: Docker Compose com Postgres; as duas aplicações rodam pelo npm. Empacotar o backend
no compose depende da imagem Docker ser exercitada (#28).

## Onde estamos

Esteira completa (#1 a #6) e backend em construção. Prontos: variáveis de ambiente validadas com
Zod (#11), tabela de links com Drizzle e migrations (#12), cadastro com 201/409/400 (#13), listagem
ordenada (#14) e remoção por slug com 204/404 (#15).
Falta do backend: busca por slug e incremento de acessos, agora em rotas separadas (#16), cliente do
R2 (#17), relatório em CSV (#18), OpenAPI (#19) e CORS com rate limit (#20). O frontend ainda não
começou — a primeira é o Style Guide do Figma (#21).

## Nível da esteira

Nível 1 — enxuto.

Rodando: Biome (lint e formatação), Commitlint no hook local e no CI, Vitest nos dois workspaces,
CI com lint, testes e build em cada PR, checklist de arquitetura na revisão do PR.
Ainda previsto para o nível 1: rate limit nas rotas públicas (#20), que depende das rotas existirem.
Fora deste nível: observabilidade, testes de integração e e2e, cobertura medida, mutation testing.

## Decisões recentes

- 14/08/2026 — nível 1 da esteira — projeto de prazo curto avaliado como código, não como produto
  em operação; observabilidade e e2e custariam dias sem pesar na avaliação.
- 14/08/2026 — repositório único com `server/` e `web/` — mantém o histórico de Issues e PRs em um
  lugar só.
- 14/08/2026 — termos de uso e política de privacidade fora de escopo — não há usuário real nem
  coleta de dado pessoal.
- 14/08/2026 — entrega em 28/08/2026 — é o desafio avaliativo de uma pós-graduação, com prazo fixo
  definido pelo enunciado.
- 14/08/2026 — deploy do backend em AWS ECS é opcional, dependente de sobrar prazo — Docker Compose
  local é obrigatório e já cobre a avaliação; publicar em nuvem só se o restante do backlog estiver
  pronto antes de 28/08/2026.

## Requisitos do enunciado

O enunciado oficial do desafio (documento de instruções da pós, mais Figma e vídeo) chegou em
19/08/2026, quando o backend já tinha cadastro, listagem e remoção prontos. O material é da
instituição e não é reproduzido aqui; o que segue é o resumo do que ele exige, com as nossas
palavras.

Obrigatório no backend:

- Criar link, recusando URL encurtada mal formatada e slug já existente.
- Deletar link, obter a URL original a partir da URL encurtada e listar todas as URLs.
- Incrementar a quantidade de acessos — listado como funcionalidade **separada** da busca.
- Exportar os links em CSV acessível por CDN, com nome de arquivo aleatório e único, listagem
  performática e as colunas URL original, URL encurtada, contagem de acessos e data de criação.
- `.env.example` em cada projeto, script com a chave exata `db:migrate`, Dockerfile e CORS habilitado.
- TypeScript, Fastify, Drizzle e Postgres.

Obrigatório no frontend:

- SPA em React com Vite, três páginas: raiz com formulário e listagem, `/:url-encurtada` que consulta
  a API e redireciona, e página de recurso não encontrado.
- Empty state, indicadores de carregamento e bloqueio de ações conforme o estado.
- Responsividade em celular e desktop, seguindo o layout do Figma.
- `.env.example` com `VITE_FRONTEND_URL` e `VITE_BACKEND_URL`.

Entrega: repositório público, com as subpastas `web` e `server`.

O que continua sendo decisão nossa, porque o enunciado não define: formato do corpo de erro
(`{ message, issues? }`), slug de 3 a 60 caracteres normalizado para minúsculas, ordenação da
listagem, ausência de paginação, e usar slug — e não id — para deletar e incrementar. O enunciado
deixa essa última escolha aberta, mas exige consistência entre as duas operações.

Fora da entrega: as ideias da seção "Quer ir além" do enunciado (SSR, OpenGraph, upload de imagem,
interface otimista). O próprio documento pede que fiquem em branch separada, depois do envio.

## Pendências abertas

- Deploy do backend em AWS ECS continua opcional (ver Decisões recentes). O Docker Compose local já
  está no repositório e cobre a obrigação; se o prazo não sobrar, o registro da decisão fica aqui e
  em `docs/arquitetura.md`, e a Issue #29 cuida apenas do deploy do frontend.

## Regras de trabalho

Toda tarefa vira Issue (correção, melhoria ou nova função) e toda entrega vira Pull Request com
Issue vinculada, o que mudou, como foi validado, riscos e próximos passos.
Ver `CONTRIBUTING.md` antes de implementar qualquer mudança.
