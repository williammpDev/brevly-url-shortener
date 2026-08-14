# Contexto do projeto

Brev.ly é um encurtador de URL. Permite cadastrar, listar e remover links encurtados, redireciona
o link curto para o original e exporta um relatório de acessos em CSV. É o desafio avaliativo de
uma pós-graduação, com entrega até 28/08/2026 — o que é avaliado é este repositório.

## Stack

Backend: Node.js, TypeScript, Fastify, Zod, Drizzle, PostgreSQL, Cloudflare R2, OpenAPI.
Frontend: React, Vite, TypeScript.
Ambiente local: Docker Compose (aplicação + Postgres).

## Onde estamos

Repositório recém-criado. Nada implementado ainda: os arquivos de processo existem, o código não.
Próximo passo é o setup do monorepo e a esteira rodando no CI antes da primeira feature.

## Nível da esteira

Nível 1 — enxuto.

Rodando: nada ainda, o setup é a primeira tarefa.
Previsto para o nível 1: Biome (lint e formatação), Commitlint, testes unitários do núcleo com
Vitest, rate limit nas rotas públicas, checklist de arquitetura na revisão do PR, CI rodando lint,
testes e build em cada PR.
Fora deste nível: observabilidade, testes de integração e e2e, cobertura medida, mutation testing.

## Decisões recentes

- 14/08/2026 — nível 1 da esteira — projeto de prazo curto avaliado como código, não como produto
  em operação; observabilidade e e2e custariam dias sem pesar na avaliação.
- 14/08/2026 — repositório único com `server/` e `web/` — mantém o histórico de Issues e PRs em um
  lugar só.
- 14/08/2026 — termos de uso e política de privacidade fora de escopo — não há usuário real nem
  coleta de dado pessoal.

## Suposições sobre o enunciado

O enunciado recebido é um parágrafo de descrição, sem lista de requisitos nem layout de
referência. Estas decisões preenchem as lacunas e podem estar diferentes do esperado:

- O slug é definido pelo usuário, não gerado automaticamente.
- O acesso é contabilizado no redirecionamento.
- O CSV é gerado sob demanda e disponibilizado por URL pública no R2.
- Não há autenticação nem expiração de links.

## Pendências abertas

- Deploy do backend ainda não decidido. Docker Compose local é obrigatório; publicar em AWS ECS
  depende de sobrar prazo. Se não sobrar, a decisão fica registrada aqui e em `docs/arquitetura.md`.

## Regras de trabalho

Toda tarefa vira Issue (correção, melhoria ou nova função) e toda entrega vira Pull Request com
Issue vinculada, o que mudou, como foi validado, riscos e próximos passos.
Ver `CONTRIBUTING.md` antes de implementar qualquer mudança.
