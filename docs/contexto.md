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

Bloco de setup concluído, sem nenhuma feature de produto ainda. No repositório: monorepo com
workspaces `server` e `web` (#1), Biome para lint e formatação (#2), Commitlint no hook `commit-msg`
via husky (#3), Vitest configurado nos dois workspaces com um teste de exemplo em cada (#4), Docker
Compose com Postgres para o ambiente local (#5) e workflow de CI rodando lint, testes e build em
cada Pull Request (#6).
Próximo passo é a primeira leva do backend: variáveis de ambiente validadas (#11) e a modelagem da
tabela de links com Drizzle e migrations (#12).

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

## Suposições sobre o enunciado

O enunciado recebido é um parágrafo de descrição, sem lista de requisitos nem layout de
referência. Estas decisões preenchem as lacunas e podem estar diferentes do esperado:

- O slug é definido pelo usuário, não gerado automaticamente.
- O acesso é contabilizado no redirecionamento.
- O CSV é gerado sob demanda e disponibilizado por URL pública no R2.
- Não há autenticação nem expiração de links.

## Pendências abertas

- Deploy do backend em AWS ECS continua opcional (ver Decisões recentes). O Docker Compose local já
  está no repositório e cobre a obrigação; se o prazo não sobrar, o registro da decisão fica aqui e
  em `docs/arquitetura.md`, e a Issue #29 cuida apenas do deploy do frontend.

## Regras de trabalho

Toda tarefa vira Issue (correção, melhoria ou nova função) e toda entrega vira Pull Request com
Issue vinculada, o que mudou, como foi validado, riscos e próximos passos.
Ver `CONTRIBUTING.md` antes de implementar qualquer mudança.
