# Tear Conexão — Guia rápido de solução de problemas

**Projeto:** Tear Conexão — API Spring Boot  
**Ambiente principal:** Nobara Linux, Java 25, Maven, MySQL 8.4 e IntelliJ IDEA  
**Última atualização:** 05/11/2026

> Execute os comandos de Maven e Git no diretório correto. No IntelliJ, o terminal pode abrir diretamente em `TEIA-Connection/api`.

## 1. Senha do MySQL não definida

**Sintomas:** mensagens como `DB_PASSWORD` não definida, falha de autenticação ou `Access denied for user 'teia_app'`.

**Solução (terminal atual):**

```bash
read -rs -p "Senha do MySQL: " DB_PASSWORD; echo
export DB_PASSWORD
```

Depois, inicie a aplicação no mesmo terminal:

```bash
mvn spring-boot:run
```

**Observação:** o comando `teia-start` já solicita a senha interativamente. Não coloque senhas no `application.properties`, em commits ou em mensagens compartilhadas. Se ocorrer `Access denied`, confira também usuário, senha e permissões no servidor MySQL.

## 2. `teia-start`: comando não encontrado

**Possíveis causas:** script ausente, sem permissão de execução ou pasta `~/.local/bin` fora do `PATH`.

**Diagnóstico:**

```bash
ls -l ~/.local/bin/teia-start
command -v teia-start
```

Se o arquivo existir, corrija a permissão:

```bash
chmod 700 ~/.local/bin/teia-start
```

Teste pelo caminho completo:

```bash
~/.local/bin/teia-start
```

Se funcionar apenas pelo caminho completo, adicione `~/.local/bin` ao `PATH` na sessão atual:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Para persistir no Bash, adicione essa configuração ao `~/.bashrc` **somente se ela ainda não existir**. Se o script não existir, será necessário recriá-lo com o caminho correto do projeto.

## 3. Variáveis `DB_URL` e `DB_USER` ausentes

**Sintoma:** falha ao resolver `${DB_URL}` ou `${DB_USER}`.

**Diagnóstico:**

```bash
printf 'DB_URL=%s\nDB_USER=%s\n' "$DB_URL" "$DB_USER"
```

**Configuração no Nobara Linux:**

```bash
export DB_URL="jdbc:mysql://localhost:3306/teiadb"
export DB_USER="teia_app"
```

O projeto utiliza `~/.teia-env` para guardar essas duas variáveis, carregadas pelo `~/.bashrc`. Para carregar manualmente:

```bash
source ~/.teia-env
```

**Atenção:** no Windows 11, a instalação discutida utiliza a porta `33062`, não `3306`. As configurações de cada sistema operacional devem ser feitas localmente.

## 4. MySQL indisponível ou conexão recusada

**Sintomas:** `Communications link failure`, `Connection refused` ou falha de conexão ao banco.

**Diagnóstico no Nobara:**

```bash
systemctl status mysqld
```

Se estiver parado:

```bash
sudo systemctl start mysqld
```

Confirme a porta, a URL JDBC e a existência do banco `teiadb`. Uma falha de autenticação (`Access denied`) é diferente de uma falha de conexão: nesse caso, revise as credenciais e as permissões do usuário `teia_app`.

## 5. `teia-start` existe, mas não inicia a API

Verifique se o script está apontando para a pasta correta do projeto:

```bash
cat ~/.local/bin/teia-start
```

No ambiente configurado, o diretório da API é:

```text
~/IdeaProjects/TEIA-Connection/api
```

Confirme que o Maven está instalado:

```bash
mvn -version
```

Se aparecer erro do Maven ou do Spring Boot, consulte a mensagem completa no terminal. Evite alterar o script antes de identificar a causa.

## 6. Maven: `BUILD FAILURE`

**Diagnóstico:** no diretório `api`, execute:

```bash
mvn clean compile
```

Leia as primeiras mensagens `ERROR` relevantes. Confirme a versão do Java:

```bash
java -version
mvn -version
```

O projeto foi configurado para **Java 25**. No IntelliJ, confira também o SDK do projeto e o JDK usado pelo Maven. `BUILD SUCCESS` confirma a compilação, mas não substitui um teste de conexão com o banco.

## 7. Driver MariaDB reapareceu no `pom.xml`

**Sintoma:** `mariadb-java-client` aparece no lugar de `mysql-connector-j` após uma atualização ou merge.

**Diagnóstico (dentro de `api`):**

```bash
grep -n -E 'mariadb-java-client|mysql-connector-j|flyway-core|flyway-mysql' pom.xml
```

**Configuração esperada:** `flyway-core`, `flyway-mysql` e `mysql-connector-j`. Não deve haver `mariadb-java-client`.

Dependência JDBC esperada:

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

Após corrigir o arquivo, recarregue as dependências Maven no IntelliJ e execute `mvn clean compile`.

## 8. `git pull` ou `git push` informa branches divergentes

**Sintoma:** `main` e `origin/main` têm commits diferentes.

**Primeiro, inspecione:**

```bash
git status
git fetch origin
git log --oneline --graph --decorate --all -12
```

**Não use `git push --force` para resolver divergência.** Confirme que não há alterações pendentes antes de integrar os históricos. Dependendo dos commits, poderá ser necessário um merge ou rebase; conflitos devem ser analisados arquivo por arquivo. No IntelliJ, use **Git → Pull** ou as opções de merge somente depois de revisar o histórico.

## 9. Arquivos `target/` aparecem no Git

**Causa:** arquivos compilados podem ter sido versionados antes da inclusão do `.gitignore`.

**Verifique:**

```bash
git ls-files -- '*target/*'
```

O `.gitignore` deve conter:

```gitignore
**/target/
```

Se algum arquivo compilado continuar rastreado, ele pode ser removido **apenas do índice**, preservando a cópia local:

```bash
git rm --cached -- target/classes/application.properties
```

Use esse comando somente se o arquivo aparecer em `git ls-files` e você estiver dentro de `api`. Revise `git status` antes de criar o commit.

## 10. Comando informa que `api/pom.xml` não existe

**Causa comum:** o terminal já está dentro da pasta `api`.

**Confira:**

```bash
pwd
```

Se o resultado terminar em `/TEIA-Connection/api`, utilize `pom.xml`, e não `api/pom.xml`.

## 11. API inicia, mas endpoint retorna erro

Com a aplicação em execução, teste:

```bash
curl -i http://localhost:8080/clientes/1
```

- `200 OK`: requisição atendida.
- `401 Unauthorized` ou `403 Forbidden`: verifique a configuração de segurança/autenticação.
- `404 Not Found`: confira rota e identificador solicitado.
- `500 Internal Server Error`: consulte os logs do Spring Boot e a conexão com o banco.

## Checklist de recuperação

1. Confirmar o diretório com `pwd`.
2. Confirmar o MySQL com `systemctl status mysqld`.
3. Verificar `DB_URL` e `DB_USER` sem expor senhas.
4. Iniciar a API com `teia-start`.
5. Se necessário, executar `mvn clean compile`.
6. Antes de operações Git, consultar `git status` e o histórico.

---

**Segurança:** nunca envie senhas, arquivos `.env` com credenciais ou backups do banco para o GitHub. Os dados do MySQL não são sincronizados automaticamente pelo Git.
