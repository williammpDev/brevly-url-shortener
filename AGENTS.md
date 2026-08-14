# Instruções para agentes

Antes de implementar qualquer mudança neste repositório, leia:

1. `docs/contexto.md` — estado atual do projeto, suposições e regras de trabalho
2. `CONTRIBUTING.md` — fluxo de Issue, branch e Pull Request
3. `docs/arquitetura.md` — decisões estruturais e limites entre as camadas

Regras que valem sempre:

- Toda tarefa vira uma Issue classificada como `correção`, `melhoria` ou `nova função`.
- Toda entrega vira um Pull Request com Issue vinculada, o que mudou, como foi validado, riscos e
  limitações, próximos passos.
- Nada entra na `main` sem lint, testes e build passando no CI.
- Antes de criar um componente, verifique se ele já existe — por nome e por comportamento.
- Se a mudança tocou a interface, faça a passada final de revisão antes de abrir o PR e registre
  no Pull Request o que foi ajustado.

Ao final de uma entrega, atualize `docs/contexto.md`.
