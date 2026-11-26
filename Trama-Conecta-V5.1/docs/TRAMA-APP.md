# Trama-App — Inicialização do Trama Conecta V5.1

O **Trama-App** substitui `api/teia-start.ps1` por dois inicializadores na raiz do projeto:

- `Trama-App.ps1` — Windows 11, **Windows PowerShell 5.1** ou PowerShell 7.
- `Trama-App.sh` — Linux com Bash.

É um **inicializador de desenvolvimento local**, não um serviço para produção: o Windows ou Linux precisa permanecer ligado, e o terminal do Trama-App deve continuar aberto. O banco já deve existir com o usuário e as permissões configurados. A ferramenta não apaga tabelas nem cria usuários de banco; as migrations são executadas pelo Flyway ao iniciar a API.

## 1. Requisitos

| Requisito | Windows 11 | Linux |
|---|---|---|
| Java | JDK **25 ou superior**, com `java` e `javac` no PATH | JDK **25 ou superior** no PATH / JAVA_HOME |
| Maven | Não precisa instalar: `api/mvnw.cmd` | Não precisa instalar: `api/mvnw` |
| Banco | MySQL 8.x já instalado | MySQL ou MariaDB compatível com as migrations, preferencialmente MySQL 8.x |
| Frontend | Node.js 18+, npm | Node.js 18+, npm |
| Teste HTTP | Recursos internos do PowerShell | `curl` ou `wget` |
| Serviço MySQL opcional | Serviço Windows `MySQL*`/`MariaDB*` | Serviço `mysql`, `mysqld` ou `mariadb` no systemd |

Para Vite 5 (frontend inicial), recomenda-se Node.js 20 ou 22 LTS. A primeira execução pode precisar de internet para Maven e npm baixarem dependências.

## 2. Execução — Windows 11

Abra o **PowerShell** na **pasta raiz do projeto**, onde estão os dois arquivos `Trama-App.*`.

```powershell
# Opcional: verificar antes de iniciar
.\Trama-App.ps1 -CheckOnly

# Inicializar com porta-padrão MySQL 3306
.\Trama-App.ps1

# Seu MySQL pode estar na porta 33062
.\Trama-App.ps1 -DbPort 33062

# Se deseja tentar iniciar o serviço MySQL, quando estiver parado
.\Trama-App.ps1 -DbPort 3306 -StartDatabase

# Executar testes do backend e build frontend antes de abrir
.\Trama-App.ps1 -RunTests
```

Caso a política de execução impeça o script, é possível habilitá-lo **somente nessa chamada**:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Trama-App.ps1
```

Não altere a política global do Windows sem necessidade. `-StartDatabase` pode exigir PowerShell aberto como administrador, dependendo da configuração do serviço. Se o MySQL já está em execução, não precisa de permissão administrativa.

## 3. Execução — Linux

```bash
chmod +x ./Trama-App.sh ./api/mvnw
./Trama-App.sh --check-only
./Trama-App.sh

# Caso o MySQL use outra porta
./Trama-App.sh --db-port 33062

# Tentar iniciar o serviço local (pode exigir permissões de administrador)
sudo systemctl start mysql
./Trama-App.sh
# ou, quando seu usuário já possui permissão de gerenciamento do serviço:
./Trama-App.sh --start-db

# Executar testes/backend e build/frontend antes de abrir
./Trama-App.sh --run-tests
```

Se usar `--start-db` no Linux, o script tenta `systemctl start` sem promover automaticamente privilégios. É preferível iniciar o serviço antes via `sudo systemctl start mysql`, em vez de executar todo o Trama-App como `root`.

## 4. O que o Trama-App faz, na ordem

1. Confirma existência de `api/pom.xml`, Maven Wrapper e `frontend/package.json`.
2. Detecta JDK 25+, Node.js 18+ e npm.
3. Obtém `DB_URL` / host / porta e verifica **conectividade TCP** com MySQL. Se solicitado, tenta iniciar o serviço local do banco.
4. Verifica se as portas do Spring Boot e do Vite estão livres.
5. Pede a senha do usuário MySQL, caso `DB_PASSWORD` não esteja no ambiente (não exibe a senha).
6. Lê ou gera `JWT_SECRET` (Base64 representando pelo menos 32 bytes) de forma **persistente**.
7. Instala o frontend se `node_modules` não existir (`npm ci` quando há `package-lock.json`; caso contrário, `npm install`).
8. Opcionalmente executa `mvnw test` e `npm run build` (`-RunTests` / `--run-tests`).
9. Inicia o Spring com Maven Wrapper; aguarda uma resposta **HTTP 200** de `GET /auth/csrf` para indicar que a API está pronta.
10. Inicia o Vite e aguarda **HTTP 200** em `http://127.0.0.1:5173/`.
11. Exibe os URLs e mantém os processos ativos até **Ctrl+C**.
12. Ao encerrar, tenta finalizar os processos da API e do frontend que criou. **Não encerra o serviço MySQL**, pois pode ser utilizado por outras aplicações.

O teste TCP **não comprova autenticação no banco**. A autenticação, o acesso ao banco e a aplicação de migrations são efetivamente exercitados quando o Spring Boot inicia. O endpoint `/auth/csrf` indica prontidão HTTP do backend, mas não é substituto de testes de cadastro, login e CRUD.

## 5. Configurações e opções

**Portas padrão:** DB 3306, Spring Boot 8080 e Vite 5173. O proxy de desenvolvimento em `frontend/vite.config.js` utiliza `TRAMA_API_PORT` e `TRAMA_FRONT_PORT`; portanto, portas alteradas continuam apontando para a mesma API.

| Windows PowerShell | Linux Bash | Função |
|---|---|---|
| `-DbHost HOST` | `--db-host HOST` | Host do MySQL |
| `-DbPort 33062` | `--db-port 33062` | Porta do MySQL |
| `-DbName teiadb` | `--db-name teiadb` | Nome do banco existente |
| `-DbUser teia_app` | `--db-user teia_app` | Usuário do banco |
| `-DbUrl 'jdbc:mysql://...'` | `--db-url 'jdbc:mysql://...'` | URL JDBC completa |
| `-ApiPort 8081` | `--api-port 8081` | Porta do Spring |
| `-FrontPort 5174` | `--front-port 5174` | Porta do Vite |
| `-StartDatabase` | `--start-db` | Tenta iniciar serviço local MySQL |
| `-CheckOnly` | `--check-only` | Apenas pré-verificação |
| `-SkipInstall` | `--skip-install` | Não instala dependências ausentes |
| `-RunTests` | `--run-tests` | Testes Maven e build Vite antes da inicialização |
| `-NoBrowser` | `--no-browser` | Não abre navegador automaticamente |

A variável `DB_URL` do ambiente é respeitada quando nenhum parâmetro de host/porta/nome do banco é passado; o parâmetro `-DbUrl` ou `--db-url` prevalece sobre tudo. `DB_USER` é respeitada se `-DbUser`/`--db-user` não tiver sido informado. Para URLs JDBC especiais (load balancing, IPv6, formatos alternativos), a checagem de host e porta exige adaptar o inicializador.

**Exemplo de portas alternativas**:

```powershell
.\Trama-App.ps1 -DbPort 33062 -ApiPort 8081 -FrontPort 5174
```

```bash
./Trama-App.sh --db-port 33062 --api-port 8081 --front-port 5174
```

## 6. Segurança de credenciais

- `DB_PASSWORD` é solicitada sem eco. Você também pode defini-la no ambiente antes de executar o inicializador (por exemplo, em ambientes automatizados). **Não coloque a senha no script, em linha de comando ou no Git**.
- Se `JWT_SECRET` já estiver definida, o valor será utilizado. Caso contrário, o Trama-App cria uma chave aleatória e a salva em `.trama-app/`:
  - **Windows:** `jwt.windows.dpapi` — criptografada pela API DPAPI para o usuário do Windows que a criou.
  - **Linux:** `jwt.linux.secret` — chave em texto, com permissão `600` e diretório privado (`umask 077`). Cuide dos backups e permissões desse arquivo.
- A pasta `.trama-app/` está no `.gitignore`. **Não a inclua em commits, capturas ou compartilhamentos**.
- A chave JWT criada anteriormente manualmente poderá ser diferente da nova. Isso invalida **tokens antigos**, mas **não altera as senhas dos usuários nem os dados MySQL**.
- No ambiente local de desenvolvimento, o script força `VITE_DEMO_MODE=false` para não confundir dados simulados com registros reais.

## 7. Logs e diagnóstico

Logs são criados **apenas quando você inicia** as aplicações:

- Windows: `.trama-app/logs/backend.log`, `backend-error.log`, `frontend.log`, `frontend-error.log`.
- Linux: `.trama-app/logs/backend.log`, `frontend.log`.

Problemas comuns:

| Sintoma | Ação |
|---|---|
| JDK 21 encontrado | Instalar JDK 25 e ajustar `JAVA_HOME` e PATH |
| MySQL não responde | Verificar serviço, host e porta (3306 ou 33062) |
| `Access denied for user` | Conferir usuário, senha e permissões do banco |
| Porta 8080/5173 ocupada | Encerrar processo antigo ou especificar outras portas |
| Falha no Maven Wrapper | Conferir internet, Java e `api/.mvn/wrapper/maven-wrapper.properties` |
| Falha no npm | Conferir Node/npm, internet e permissões da pasta |
| Spring não inicia | Ler `backend.log`; verificar migrations, Flyway e JWT |
| Frontend inicia mas não comunica | Verificar proxy do Vite e a resposta de `/auth/csrf` |

## 8. Limitações e boas práticas

- Não instala automaticamente Java, MySQL, Node ou serviços do sistema, pois isso exige decisões e permissões administrativas.
- Não cria banco/usuário automaticamente, nem substitui backups. Execute o Flyway **somente após backup** ao migrar um banco existente para a V5.
- Não valida usuário/senha MySQL no modo `-CheckOnly`/`--check-only`; a checagem real ocorre ao iniciar o Spring.
- Não configura o frontend como servidor de produção; `npm run dev` é apenas para desenvolvimento.
- Os scripts Windows e Linux devem ser testados no sistema operacional de destino antes de serem considerados validados em produção.
- Se executar outro serviço pela mesma porta, o script recusa iniciar, evitando confundir a aplicação antiga com a nova.

## 9. A primeira execução em um computador novo

1. Faça backup do projeto antigo e do banco existente.
2. Extraia o pacote da V5.1.
3. Verifique o serviço do MySQL e as credenciais do usuário `teia_app`.
4. Instale o JDK 25 e Node.js.
5. Execute o Trama-App sem `-RunTests`/`--run-tests` no primeiro momento.
6. Aguarde frontend e backend ficarem prontos; teste login e cadastros reais.
7. Execute a opção de testes para uma verificação adicional.
