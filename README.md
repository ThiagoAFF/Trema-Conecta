# Trama Conecta — V5.1 com inicializador Trama-App

Esta entrega substitui integralmente a interface da V4.9 pelo **frontend inicial fornecido pelo usuário**, mantendo seus nove módulos administrativos, componentes, identidade visual e modo de demonstração opcional. A API Spring Boot V4.9 foi **estendida**, preservando as rotas e o esquema existentes, para atender aos contratos necessários ao frontend inicial.

## Inicializacao automatizada: Trama-App (Windows 11 e Linux)

A V5.1 substitui `api/teia-start.ps1` por dois inicializadores na raiz:

- **Windows 11:** `./Trama-App.ps1` no PowerShell (ou `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Trama-App.ps1` se necessario).
- **Linux:** `chmod +x ./Trama-App.sh ./api/mvnw && ./Trama-App.sh`.

O Trama-App verifica Java/Node/npm, conectividade MySQL e portas, prepara JWT persistente, instala as dependencias npm ausentes, inicia Spring Boot e depois Vite, testa prontidao HTTP e registra logs. Opcionalmente, pode tentar iniciar o servico local do MySQL. **Nao instala MySQL, Java ou Node e nao cria o banco/usuario.**

> Consulte [docs/TRAMA-APP.md](docs/TRAMA-APP.md) para instrucoes, parametros, seguranca e limitacoes.


## Requisitos

- Windows 11, **Java JDK 25** (conforme `api/pom.xml`) e MySQL 8.x.
- Node.js e npm. Para Vite 5, Node 20 ou 22 LTS são opções usuais.
- O Maven instalado globalmente não é necessário: execute `api/mvnw.cmd`.
- Acesso à internet para baixar as dependências do frontend e backend.

## Segurança e backup

**Antes de substituir sua versão atual, faça backup do banco `teiadb` e da pasta do projeto.**

A migration `V5__integracao_frontend_inicial.sql` é **aditiva**: inclui colunas nas tabelas existentes e cria `empresa_preferencias`, `lotes`, `movimentacoes` e `notificacoes`, sem executar `DROP TABLE` ou apagar registros. O Flyway a executará no primeiro início da nova API. Não execute a migration manualmente se estiver usando o Flyway.

Mantenha `DB_URL`, `DB_USER`, `DB_PASSWORD` e `JWT_SECRET` como variáveis de ambiente no terminal da API (não coloque credenciais em commits). O JWT continua com chave Base64, BCrypt nas senhas, autenticação Spring Security e CSRF nas operações de alteração.

## Iniciar o backend

Abra PowerShell na pasta `api`:

```powershell
cd .\api
# Reutilize as variáveis de ambiente do ambiente anterior.
# Exemplo de DB_URL local: jdbc:mysql://127.0.0.1:3306/teiadb
.\mvnw.cmd clean test
.\mvnw.cmd spring-boot:run
```

Se o terminal for novo, configure novamente as quatro variáveis de ambiente, incluindo `JWT_SECRET`. Para bancos já existentes, o Flyway executará V5 apenas uma vez.

## Iniciar o frontend

Em **outro** PowerShell, na pasta `frontend`:

```powershell
cd .\frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. **Use `npm install` na primeira execução**, pois o ZIP do frontend inicial não continha `package-lock.json`; após instalá-lo, pode ser utilizado `npm ci` em instalações seguintes. O Vite encaminha automaticamente as rotas da API para `http://127.0.0.1:8080`.

### Login

Use o **e-mail** e a senha de um usuário já cadastrado na API. Não é necessário recadastrar sua empresa. O identificador apresentado após o registro é apenas informativo (`EMP-<id>`), **não** substitui o e-mail no login. O token JWT é armazenado em `sessionStorage` e a API verifica tokens Bearer; o frontend envia o token CSRF ao alterar dados.

### Demonstração sem API

Para testar o protótipo isolado, crie `frontend/.env.local` com `VITE_DEMO_MODE=true` e reinicie o Vite. Dados desse modo são fictícios e não são gravados no MySQL. O modo **real** é o padrão.

## Funcionalidades e endpoints

| Módulo | Integração |
| --- | --- |
| Cadastro e login | `POST /empresas/cadastro`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/csrf` |
| Configurações e senha | `GET/PUT /empresas/atual`, `GET/PUT /empresas/atual/preferencias-notificacoes`, `POST /auth/alterar-senha` |
| Clientes | CRUD existente expandido com documento, cidade, estado, observações e total de pedidos |
| Pedidos | Listar, cadastrar, editar pedido com um item, alterar situação no frontend; preserva endpoints e status legados |
| Lotes | `GET /lotes`, `GET /lotes/{id}`, `POST /lotes` |
| Movimentações | `GET /movimentacoes`, `GET /movimentacoes/{id}`, `POST /movimentacoes` |
| Usuários | Cadastro existente, consulta, edição e ativação/desativação (somente administração para escrita) |
| Notificações | Consulta, leitura individual e leitura em lote, avisos de movimentação e prazos |
| Dashboard | `GET /dashboard` |
| Relatórios | `GET /relatorios/resumo` |

Todos os endpoints de dados autenticados continuam **restritos à empresa do usuário**. Os formulários de usuários agora exigem senha inicial de pelo menos oito caracteres; a senha não é retornada pela API.

## Compatibilidade e limitações

- O frontend inicial modela **um único item por pedido**, enquanto a API V4.9 permite vários itens. A edição pelo frontend integrado é recusada se o pedido existente possuir mais de um item, evitando perda acidental de dados.
- O campo `situacao` do frontend é mantido em `pedidos.situacao_web`; o status original (`ABERTO`, `ENTREGUE`, `CANCELADO`) não é apagado. Há uma separação intencional entre ciclo de produção e status de entrega.
- Os alertas por prazo são gerados periodicamente a partir dos lotes e das preferências; o agendador verifica prazos após o início e a cada hora, por padrão. Não há entrega de e-mails ou notificações push.
- O frontend usa React 18 + Vite 5, conforme o arquivo inicial enviado. Não é o React 19 da V4.9 responsiva. O CSS inicial já tem breakpoints para desktop, tablet e celular, mas testes visuais em dispositivos reais ainda são recomendados.
- Os campos adicionais dos registros antigos começam vazios; podem ser preenchidos gradualmente. Nenhuma migration preenche esses valores artificialmente.
- O modo de demonstração (`VITE_DEMO_MODE=true`) é independente da API real. Não o habilite inadvertidamente no deploy.
- Em produção, configure HTTPS e `app.auth.cookie-secure=true` e use um proxy reverso com a mesma origem para frontend e backend; a configuração do Vite só serve ao desenvolvimento.

## Verificação

Foram feitas verificações **estáticas** de sintaxe dos 79 arquivos Java e dos módulos de serviço/configuração JavaScript, além da conferência da estrutura do ZIP e dos endpoints. Foram acrescentados dois testes Mockito para checar isolamento entre empresas em lotes e movimentações.

**Não foram executadas nesta sessão a compilação Maven, a suite JUnit, o build Vite nem testes ponta-a-ponta.** O ambiente de verificação dispõe de Java 21 (o projeto exige 25) e o registro npm estava inacessível. Antes de qualquer produção, execute os testes no Windows 11 e faça um ciclo completo de cadastro, pedido, lote, movimentação, atualização de status e login/logout.

## Ordem mínima do teste funcional manual

1. Confirme que o banco existente inicializou e que `flyway_schema_history` contém `V5`.
2. Entre com o e-mail e a senha de administrador anteriormente cadastrados.
3. Cadastre um cliente novo com documento, cidade e estado.
4. Cadastre um pedido com **um item** para esse cliente.
5. Crie um lote vinculado ao pedido e registre uma movimentação.
6. Consulte o dashboard, os relatórios e as notificações.
7. Cadastre um usuário com senha inicial, faça logout e teste esse login.
8. Edite os dados da empresa e as preferências de notificações.
9. Teste o isolamento entre duas empresas cadastradas diferentes.
