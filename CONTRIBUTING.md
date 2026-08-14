# Como trabalhamos neste projeto

## Fluxo

Toda mudança começa por uma Issue. Toda Issue vira uma branch. Toda branch vira um Pull Request.
Ninguém commita direto na `main`.

Categorias de Issue: `correção`, `melhoria`, `nova função`. A label é obrigatória — sem ela a Issue
não entra em PR.

Nomes de branch:

- `correcao/<numero>-<slug>`
- `melhoria/<numero>-<slug>`
- `nova-funcao/<numero>-<slug>`

Exemplo: `nova-funcao/7-exportar-relatorio-csv`.

Commits seguem o padrão convencional (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`),
porque o commitlint valida isso no hook e no CI.

## Pull Request

A descrição precisa ter: a Issue relacionada (`Closes #NN`), o que mudou, como foi validado,
riscos e limitações, próximos passos. PR sem isso não é mergeado, mesmo com o código correto —
o rastro é parte da entrega.

Se o PR mexeu na interface, acrescente uma seção `## Revisão de interface` dizendo o que a passada
final de designer ajustou.

## Antes de abrir o PR

Rode localmente, na raiz:

```bash
npm run lint      # Biome: lint + formatação
npm run test      # Vitest: unitários do núcleo
npm run build     # server e web
```

O CI roda os três em cada PR e bloqueia o merge se algum falhar. Verificação que só roda na
máquina de alguém não conta.

## Antes de criar um componente

Procure se ele já existe. Busque por nome e por comportamento, e confira a lista em
`docs/arquitetura.md`. Componente duplicado é o problema mais caro de resolver depois — e é o
erro mais comum quando parte do código vem de assistente de IA.

## Checklist de arquitetura na revisão

- A mudança resolve o problema de hoje, sem camada extra para caso de uso que ninguém pediu.
- Nenhuma consulta N+1, nenhum arquivo grande carregado inteiro em memória, índice presente nas
  colunas que os filtros usam.
- Duplicação só virou abstração quando três ocorrências mudam pela mesma razão.
- O front não conhece a estrutura das tabelas nem fala com o banco. O contrato entre as pontas é
  a API.
