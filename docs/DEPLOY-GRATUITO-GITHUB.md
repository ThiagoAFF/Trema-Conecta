# Trama Conecta V5.1 — Deploy gratuito usando GitHub

**Status:** branch preparada para deploy, mas nenhum serviço ou banco foi criado.
As migrations V1–V5 ainda não foram validadas em TiDB Cloud Starter;
o uso de memória do Spring Boot/Java 25 ainda não foi validado no Render Free.

## Arquitetura

- GitHub: `ThiagoAFF/Trema-Conecta`, branch `deploy/v5-1`.
- Render Free: API Spring Boot 4, Java 25, Dockerfile em `api/Dockerfile`.
- Cloudflare Pages Free: frontend React/Vite, raiz de build `frontend`.
- Pages Function: `/api/*` encaminha requisições à API no Render, mantendo
  uma mesma origem HTTP para o navegador (JWT e CSRF).
- TiDB Cloud Starter: banco compatível com o protocolo MySQL, mas **não idêntico
  ao MySQL 8.x**. Flyway e JPA precisam de validação.

## 1. Banco — TiDB Cloud Starter

1. Crie um cluster Starter gratuito e um banco vazio na conta TiDB Cloud.
2. Crie usuário e credenciais e armazene-as **apenas** no Render.
3. Use a URL JDBC fornecida pelo serviço, com TLS, por exemplo
   `jdbc:mysql://HOST:4000/BANCO?sslMode=REQUIRED`.
   Verifique se `VERIFY_IDENTITY` é suportado com a cadeia de certificados.
4. Inicie a API de forma controlada e confira a aplicação das migrations V1–V5 e
   o resultado de `spring.jpa.hibernate.ddl-auto=validate`.
5. Se ocorrer falha de migração ou dialeto, registre o erro; **não edite**
   migrations antigas aplicadas e não use `flyway repair` sem avaliação.
6. O TiDB não recebe automaticamente os dados do MySQL do Fedora; use dados
   fictícios para os testes da apresentação.

Fontes: [Compatibilidade TiDB](https://docs.pingcap.com/tidbcloud/mysql-compatibility/);
[Flyway TiDB](https://documentation.red-gate.com/flyway/reference/database-driver-reference/tidb-titanium-db).

## 2. API — Render Free

1. Em [Render](https://dashboard.render.com/), conecte o GitHub e selecione
   `ThiagoAFF/Trema-Conecta` na branch `deploy/v5-1`.
2. Use **New > Blueprint** e o arquivo raiz `render.yaml`. Caso a interface
   não permita selecionar a branch, crie manualmente um Web Service com
   runtime Docker, contexto `api` e Dockerfile `api/Dockerfile`.
3. Selecione o plano **Free** antes de confirmar a criação.
4. Configure as variáveis sensíveis `DB_URL`, `DB_USER`, `DB_PASSWORD`,
   `JWT_SECRET` no painel do Render. Não as inclua no Git.
5. Para gerar o JWT_SECRET: `openssl rand -base64 48`, localmente.
6. Configure `APP_AUTH_COOKIE_SECURE=true` e `SERVER_PORT=10000`;
   confira os valores do `render.yaml`.
7. Verifique se `/auth/csrf` responde HTTP 200 e inspecione os logs do Flyway.

**Limitações:** Render Free pode suspender a API após cerca de 15 minutos de
inatividade e demora a reiniciar. Sua memória é limitada; Java 25/Spring Boot 4
pode exceder a cota. Ajustes da JVM ajudam, mas não garantem o funcionamento.

## 3. Frontend — Cloudflare Pages Free

1. Em [Cloudflare Workers & Pages](https://dash.cloudflare.com/), crie um
   projeto Pages integrado ao repositório `ThiagoAFF/Trema-Conecta`.
2. Selecione a branch de produção `deploy/v5-1`.
3. **Root directory:** `frontend`.
4. **Build command:** `npm ci && npm run build`.
5. **Build output directory:** `dist` (relativo a `frontend`).
6. Defina as variáveis de build `NODE_VERSION=22` e
   `VITE_DEMO_MODE=false`.
7. Defina na configuração de *Runtime/Pages Functions*:
   `API_ORIGIN=https://SEU-SERVICO.onrender.com` (sem barra final).
   `VITE_API_URL` pode ficar ausente; o frontend usa `/api` em produção.
   Não inclua senhas em variáveis `VITE_`, pois ficam públicas no navegador.
8. Teste `https://SEU-SITE.pages.dev/api/auth/csrf`: a resposta esperada é
   JSON com o token CSRF quando a API estiver disponível.

O proxy HTTPS é implementado em
`frontend/functions/api/[[path]].js` e o arquivo
`frontend/public/_routes.json` limita as chamadas à Function para `/api/*`.

## 4. Testes antes da apresentação

- Cadastro fictício de empresa e administrador, login e logout.
- Cadastro, busca e edição de clientes e pedidos.
- Cadastro de lotes e movimentações; dashboard, relatórios e notificações.
- Isolamento de dados entre duas empresas de teste.
- Navegação direta e atualização em `/clientes`, `/pedidos`, etc.
- Abertura em janela anônima e celular.
- Tempo de recuperação do Render após suspensão por inatividade.
- Backup e teste de restauração dos dados de demonstração.

## Segurança e operação

- **Não publique** `DB_PASSWORD`, `JWT_SECRET`, `.env`, chaves privadas ou
  backups em GitHub.
- A `main` não será alterada até revisão e merge explícitos.
- Artefatos que já foram commitados em `api/target` devem ser removidos do
  índice Git nesta branch. Um `.gitignore` só impede novos commits; não remove
  conteúdo do histórico anterior.
- Se um segredo já foi commitado, revogue-o e trate o histórico separadamente.
- Para a apresentação, mantenha o Trama-App local como contingência.
- Termos e cotas dos serviços gratuitos podem mudar.

Referências oficiais: [Render Free](https://render.com/docs/free),
[Render Blueprints](https://render.com/docs/blueprint-spec),
[Cloudflare Pages](https://developers.cloudflare.com/pages/),
[TiDB](https://docs.pingcap.com/tidbcloud/).
