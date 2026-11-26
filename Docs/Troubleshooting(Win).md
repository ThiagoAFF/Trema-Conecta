# Tear Conexão — Guia rápido de solução de problemas (Windows 11)

**Projeto:** TEIA Connection — API Spring Boot  
**Ambiente:** Windows 11, IntelliJ IDEA, Java 25, Maven e MySQL 8.0.43  
**Atualização:** 05/11/2026

> **Atenção:** neste ambiente Windows, o MySQL foi configurado na porta **33062**, enquanto no Nobara Linux utiliza a porta **3306**. Confirme a porta real da sua instalação antes de alterá-la. Execute os comandos abaixo no **PowerShell** (terminal do IntelliJ configurado para PowerShell), salvo indicação contrária.

## 1. Senha do banco (`DB_PASSWORD`) não definida

**Sintomas:** erro de variável `DB_PASSWORD` ausente, falha ao criar o `DataSource` ou ao iniciar o Spring Boot.

**Solução para a sessão atual (sem exibir a senha):**

```powershell
$senhaSegura = Read-Host "Senha do MySQL" -AsSecureString
$env:DB_PASSWORD = [System.Net.NetworkCredential]::new('', $senhaSegura).Password
Remove-Variable senhaSegura
```

Em seguida, **no mesmo terminal**, execute:

```powershell
mvn spring-boot:run
```

> Essa variável vale apenas para o processo PowerShell atual e os processos iniciados por ele. Não registre a senha em arquivos versionados, prints ou histórico de comandos. A variável de ambiente em texto simples pode ser lida por processos com permissões apropriadas; encerre o terminal ao terminar.

## 2. `teia-start` não funciona no Windows

**Causa provável:** `teia-start` é um script Bash criado **somente no Nobara Linux** em `~/.local/bin/teia-start`; ele não existe automaticamente no Windows.
**Atualização:** para rodar `teia-start` no Windows, , basta apenas rodar:
```powershell
cd C:\caminho\para\TEIA-Connection\api
.\teia-start.ps1
```

**Alternativa imediata:** no terminal PowerShell do IntelliJ, entre na pasta da API e execute o Maven:

```powershell
cd C:\caminho\para\TEIA-Connection\api
mvn spring-boot:run
```

Antes, defina as variáveis de ambiente conforme as seções 1 e 3. **Não tente usar `chmod`, `source ~/.teia-env` ou o script Linux diretamente no PowerShell.** Um script Windows próprio (`.ps1`) pode ser criado posteriormente, mas não é requisito para iniciar a API.

## 3. `DB_URL` ou `DB_USER` não definidos

**Sintomas:** `Could not resolve placeholder 'DB_URL'`, `DB_USER` ausente ou erro de conexão.

**Solução (PowerShell, sessão atual):**

```powershell
$env:DB_URL = 'jdbc:mysql://localhost:33062/teiadb'
$env:DB_USER = 'teia_app'
```

**Verificação sem mostrar a senha:**

```powershell
Write-Output "DB_URL=$env:DB_URL"
Write-Output "DB_USER=$env:DB_USER"
Write-Output "DB_PASSWORD definida: $(-not [string]::IsNullOrEmpty($env:DB_PASSWORD))"
```

**Importante:** variáveis definidas em um terminal **não são automaticamente repassadas** a uma configuração Run/Debug já iniciada pelo IntelliJ. Se iniciar pelo botão **Run**, configure `DB_URL`, `DB_USER` e `DB_PASSWORD` em **Run → Edit Configurations → Environment variables**, preferencialmente usando um mecanismo de segredo apropriado e evitando salvar a senha em configurações compartilhadas. Não versione `.run` com credenciais.

## 4. `Access denied for user 'teia_app'@'localhost'`

**Sintomas:** autenticação rejeitada mesmo quando o MySQL está ligado.

**Verifique:**

1. A porta é **33062** neste Windows, não 3306.
2. O usuário é `teia_app` e a senha corresponde à conta criada **neste servidor Windows**.
3. O terminal ou configuração de execução do IntelliJ está usando a senha esperada.
4. O login funciona diretamente no cliente MySQL.

**Teste no PowerShell** (se `mysql` estiver no `PATH`):

```powershell
mysql -h 127.0.0.1 -P 33062 -u teia_app -p teiadb
```

Digite a senha apenas quando o cliente solicitar. Se o login no cliente funcionar, mas a aplicação falhar, investigue as variáveis da **configuração de execução do IntelliJ**. Se o login falhar também, revise a conta e as permissões no MySQL com um usuário administrador. Não execute `GRANT ALL` indiscriminadamente.

## 5. MySQL não inicia ou `Connection refused`

**Diagnóstico do serviço (PowerShell):**

```powershell
Get-Service -Name MySQL80
Test-NetConnection 127.0.0.1 -Port 33062
```

Se o serviço `MySQL80` estiver parado, abra o PowerShell **como administrador** e, se esse for realmente o nome do serviço instalado, execute:

```powershell
Start-Service -Name MySQL80
```

Se o serviço tiver outro nome, localize-o com `Get-Service *mysql*`. Se o teste da porta falhar mesmo com o serviço em execução, verifique o `my.ini`, a porta configurada e os logs do MySQL. Não altere a porta sem confirmar a configuração existente.

## 6. `mvn` ou `java` não reconhecido

**Sintomas:** `mvn : O termo 'mvn' não é reconhecido` ou `java` não encontrado.

**Diagnóstico:**

```powershell
java -version
mvn -version
```

Instale ou configure o **JDK 25** e o Maven no `PATH`. No IntelliJ, confira **File → Project Structure → Project SDK** e a configuração do Maven. Se houver Maven Wrapper (`mvnw.cmd`) no projeto, ele pode ser usado no lugar de uma instalação global do Maven:

```powershell
.\mvnw.cmd clean compile
```

Use o wrapper **somente se o arquivo existir**.

## 7. Erro de compilação ou dependência JDBC incorreta

**Sintomas:** `BUILD FAILURE`, classe do driver ausente ou erro relacionado a MariaDB/MySQL.

**No diretório `api`:**

```powershell
Select-String -Path .\pom.xml -Pattern 'mysql-connector-j|mariadb-java-client|flyway-core|flyway-mysql'
mvn clean compile
```

O `pom.xml` deve conter `mysql-connector-j`, `flyway-core` e `flyway-mysql`, **sem** `mariadb-java-client`. Se o IntelliJ mostrar dependências antigas, use **Load Maven Changes**. Não edite manualmente arquivos dentro de `target/`.

## 8. Flyway falha ao aplicar migrations

**Sintomas:** `FlywayValidateException`, `checksum mismatch`, erro de tabela já existente ou migration que não executa.

**Procedimento:** confirme que `DB_URL` aponta para o banco correto (`teiadb`), examine o erro completo e verifique o histórico de migrations com um usuário autorizado:

```sql
SELECT installed_rank, version, description, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

**Não apague a tabela `flyway_schema_history` nem altere uma migration já aplicada para “corrigir” o problema.** Primeiro identifique se há divergência entre o banco Windows e o esquema versionado.

## 9. Porta HTTP 8080 ocupada

**Sintomas:** `Port 8080 was already in use`.

**Diagnóstico:**

```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue |
    Select-Object LocalAddress, LocalPort, OwningProcess
```

Se houver um PID, identifique o processo:

```powershell
Get-Process -Id <PID>
```

Substitua `<PID>` pelo número exibido. Encerre apenas processos que você reconheça, preferencialmente pelo próprio IntelliJ. Outra opção é configurar temporariamente outra porta HTTP.

## 10. Git: `main` divergiu de `origin/main`

**Sintomas:** mensagem indicando commits diferentes nas branches local e remota.

**Diagnóstico (na pasta do repositório):**

```powershell
git status
git fetch origin
git log --oneline --graph --decorate --all -12
```

No IntelliJ, examine **Git → Log** antes de usar **Pull** ou **Merge**. Se houver alterações não commitadas, preserve-as primeiro. **Não use `git push --force`** para resolver divergências na `main` compartilhada.

## 11. Arquivos `target/` aparecem no Git

**Causa:** arquivos gerados pelo Maven podem ter sido versionados antes da criação do `.gitignore`.

Confirme que o `.gitignore` na raiz contém:

```gitignore
**/target/
```

Se algum arquivo ainda estiver rastreado, verifique antes de removê-lo do índice:

```powershell
git ls-files -- '*target/*'
```

A remoção do rastreamento deve ser feita apenas para os caminhos identificados, com `git rm --cached -- <caminho>`, após confirmar que são artefatos gerados. Isso preserva os arquivos locais.

## 12. API inicia, mas `/clientes/1` não responde

**Teste:** com a aplicação em execução:

```powershell
curl.exe -i http://localhost:8080/clientes/1
```

- **200:** endpoint respondeu corretamente.
- **401/403:** verificar regras do Spring Security e autenticação.
- **404:** verificar rota, ID e existência do registro.
- **500:** verificar logs da aplicação e consulta ao banco.
- **Falha de conexão:** verificar se o Spring Boot está realmente escutando na porta 8080.

## Checklist rápido antes de executar a API

- [ ] Java 25 e Maven reconhecidos.
- [ ] MySQL Windows em execução e acessível na porta configurada (neste ambiente, 33062).
- [ ] Banco `teiadb` e usuário `teia_app` disponíveis.
- [ ] `DB_URL`, `DB_USER` e `DB_PASSWORD` definidos **no ambiente usado para iniciar** a aplicação.
- [ ] `pom.xml` com `mysql-connector-j`, sem driver MariaDB.
- [ ] `mvn clean compile` termina em `BUILD SUCCESS`.
- [ ] Spring Boot inicia sem erro de conexão ou migration.
- [ ] Endpoint testado com `curl.exe`.

---

**Nota sobre multiplataforma:** Git sincroniza código, configurações versionadas e migrations, **não** sincroniza automaticamente registros, contas ou senhas entre os bancos MySQL do Windows e do Linux. Nunca envie credenciais ou backups contendo dados sensíveis ao repositório.
