# Arquitetura

## Visão geral

Duas aplicações no mesmo repositório, conversando só por HTTP.

```
web (React + Vite)  ──HTTP──>  server (Fastify)  ──>  Postgres
                                      │
                                      └──>  Cloudflare R2 (CSV do relatório)
```

O `web` é uma SPA estática: não renderiza no servidor, não tem backend próprio e não conhece o
banco. O `server` expõe a API REST documentada em OpenAPI e é o único que toca Postgres e R2.

O redirecionamento não acontece no backend por HTTP 302: a rota `/:slug` é uma página do front que
consulta a API pela URL original, registra o acesso e então redireciona. O enunciado oficial, lido em
19/08/2026, confirmou esse desenho ao descrever a página `/:url-encurtada` do frontend. Isso mantém a SPA como
dona do roteamento e permite mostrar estado de carregamento e página de "link não encontrado".

## Estrutura de pastas

```
server/
  src/
    db/           schema e migrations do Drizzle
    routes/       uma rota por arquivo, com schema Zod de entrada e saída
    services/     regras de negócio, sem dependência de Fastify
    lib/          clientes externos (Postgres, R2)
  Dockerfile
web/
  src/
    pages/        uma pasta por rota
    components/   componentes reutilizáveis — consultar antes de criar novo
    http/         funções de acesso à API, uma por endpoint
docs/
docker-compose.yml
```

O que interessa aqui: `services/` não importa nada de `routes/`. A regra de negócio precisa rodar
em teste unitário sem subir servidor.

## Decisões

### Repositório único para as duas aplicações

**Escolhemos:** um repositório com `server/` e `web/`.
**Porque:** o histórico de Issues e PRs conta a história do projeto inteiro em um lugar só, que é
o que o avaliador lê.
**Descartamos:** dois repositórios — fragmentaria o rastro sem trazer benefício em um projeto
deste tamanho.

### Fastify + Zod no backend

**Escolhemos:** Fastify com type provider do Zod, validando entrada e saída.
**Porque:** o schema Zod serve de validação, de tipagem e de fonte do documento OpenAPI ao mesmo
tempo — um artefato, três usos.
**Descartamos:** Express com validação manual — mais código para o mesmo resultado, e sem
documentação derivada.

### Drizzle como ORM

**Escolhemos:** Drizzle com Postgres.
**Porque:** fica próximo do SQL, o que importa aqui porque o relatório usa cursor, e as migrations
são versionadas em arquivo.
**Descartamos:** Prisma — a camada de abstração atrapalha justamente na parte de streaming.

### Slug definido pelo usuário

**Escolhemos:** o usuário informa o slug ao cadastrar o link; a API recusa slug já existente com
409 e valida o formato (letras, números e hífen).
**Porque:** o enunciado fala em cadastro de links encurtados, não em geração automática, e slug
customizado é o comportamento esperado de um encurtador.
**Descartamos:** geração aleatória — vira decisão do sistema onde deveria ser do usuário.
Suposição registrada: o enunciado não é explícito neste ponto.

### Relatório em CSV por stream, com cursor no Postgres

**Escolhemos:** cursor do Postgres alimentando um stream do Node, que sobe direto para o R2; a API
devolve a URL do arquivo.
**Porque:** o consumo de memória não cresce com o tamanho da tabela. Com poucos registros o ganho é
teórico, mas a estrutura é a correta e é o que o projeto se propõe a exercitar.
**Descartamos:** carregar tudo em memória e montar a string do CSV — mais simples e errado por
construção.

### Busca e contagem de acessos em rotas separadas

**Escolhemos:** uma rota devolve a URL original a partir do slug, sem efeito colateral, e outra
incrementa o contador. A página de redirecionamento do front chama as duas.
**Porque:** o enunciado lista "obter a URL original" e "incrementar acessos" como funcionalidades
separadas. Além disso, um `GET` sem efeito colateral permite consultar um link sem inflar o contador,
o que a listagem e a página de erro precisam.
**Descartamos:** devolver e incrementar na mesma rota, que era a decisão anterior a 19/08/2026 —
junta o que o enunciado separa e esconde efeito colateral num `GET`. Descartamos também contar no
carregamento da listagem, que contaria visualização do dono, não acesso.

O incremento é uma única instrução SQL (`access_count = access_count + 1`), e não uma leitura
seguida de gravação: dois acessos simultâneos ao mesmo link perderiam contagem no segundo caso.

### Slug como identificador nas operações

**Escolhemos:** deletar e incrementar acessos identificam o link pelo slug.
**Porque:** o enunciado deixa a escolha entre id e URL encurtada em aberto, mas exige consistência
entre as operações — e o slug é o que o frontend tem em mãos na página de redirecionamento.
**Descartamos:** usar o `id` uuid, que obrigaria o front a guardar um identificador que ele não vê na
URL curta.

### React + Vite, sem framework de servidor

**Escolhemos:** SPA com React e Vite, build estático.
**Porque:** não há conteúdo que precise de SEO ou renderização no servidor, e o build estático
simplifica o deploy do front.
**Descartamos:** Next.js — traria servidor onde não existe necessidade dele.

## Limites

O front não fala com o banco, não conhece nomes de tabela e não decide regra de negócio. Tudo que
ele sabe do domínio vem da API, e cada endpoint tem uma função correspondente em `web/src/http/`.

Segredos (credenciais do Postgres e do R2) vivem só no ambiente do servidor. Nada de chave em
variável `VITE_`, porque tudo que tem esse prefixo vai para o bundle e fica público.
