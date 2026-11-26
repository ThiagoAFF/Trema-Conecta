#!/usr/bin/env bash
# Trama-App | Linux | Iniciador local de MySQL + Spring Boot + React/Vite
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
API="$ROOT/api"
FRONT="$ROOT/frontend"
STATE="$ROOT/.trama-app"
LOGS="$STATE/logs"
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=teiadb
DB_USER_OPT=teia_app
API_PORT=8080
FRONT_PORT=5173
DB_URL_OPT=""
EXPLICIT_DB=0
START_DB=0
CHECK_ONLY=0
SKIP_INSTALL=0
RUN_TESTS=0
NO_BROWSER=0
BACK_PID=""
FRONT_PID=""
BACK_GROUP=0
FRONT_GROUP=0

usage() {
  cat <<'EOF'
Trama-App - Inicializador do Trama Conecta (Linux)

Uso: ./Trama-App.sh [opcoes]
  --db-host HOST      Host MySQL (padrao: 127.0.0.1)
  --db-port PORTA     Porta MySQL (padrao: 3306; alternativa: 33062)
  --db-name NOME      Banco existente (padrao: teiadb)
  --db-user USUARIO   Usuario MySQL (padrao: teia_app)
  --db-url JDBC       URL JDBC completa (prevalece sobre DB_URL)
  --api-port PORTA    Porta da API (padrao: 8080)
  --front-port PORTA  Porta do Vite (padrao: 5173)
  --start-db          Tenta iniciar servico MySQL/MariaDB se estiver parado
  --check-only        Valida ambiente e conectividade, sem executar aplicacoes
  --skip-install      Nao instala dependencias npm ausentes
  --run-tests         Executa Maven test e npm run build antes de iniciar
  --no-browser        Nao abre navegador automaticamente
  --help              Exibe esta ajuda

DB_PASSWORD e JWT_SECRET podem ser definidos no ambiente antes da execucao.
A senha MySQL sera solicitada se DB_PASSWORD nao estiver definido.
EOF
}

fail() { printf '[ERRO] %s\n' "$*" >&2; exit 1; }
info() { printf '[Trama-App] %s\n' "$*"; }
warn() { printf '[AVISO] %s\n' "$*" >&2; }
require_value() { (($# >= 2)) || fail "Falta um valor para $1"; }
port_check() { [[ "$1" =~ ^[0-9]+$ ]] && (( 1 <= 10#$1 && 10#$1 <= 65535 )); }
tcp_check() {
  local host="$1" port="$2"
  if command -v timeout >/dev/null 2>&1; then
    timeout 3 bash -c 'echo > /dev/tcp/"$1"/"$2"' _ "$host" "$port" >/dev/null 2>&1
  else
    (echo > "/dev/tcp/$host/$port") >/dev/null 2>&1
  fi
}
http_check() {
  local url="$1"
  if command -v curl >/dev/null 2>&1; then
    curl --silent --show-error --fail --max-time 3 -o /dev/null "$url" 2>/dev/null
  else
    wget --quiet --timeout=3 --output-document=/dev/null "$url" 2>/dev/null
  fi
}
show_log_tail() {
  local file="$1"
  if [[ -s "$file" ]]; then
    printf '\n---- Ultimas linhas de %s ----\n' "$file" >&2
    tail -n 35 "$file" >&2
  fi
}
stop_group() {
  local pid="$1" grouped="$2"
  [[ -n "$pid" ]] || return 0
  if [[ "$grouped" == 1 ]]; then
    kill -TERM -- "-$pid" 2>/dev/null || true
  else
    kill -TERM "$pid" 2>/dev/null || true
  fi
  # Espera curta antes de encerramento forçado, para evitar processos orfaos.
  for _ in {1..12}; do
    kill -0 "$pid" 2>/dev/null || return 0
    sleep 0.25
  done
  if [[ "$grouped" == 1 ]]; then kill -KILL -- "-$pid" 2>/dev/null || true
  else kill -KILL "$pid" 2>/dev/null || true; fi
}
cleanup() {
  local status=$?
  trap - EXIT INT TERM
  if [[ -n "$FRONT_PID" || -n "$BACK_PID" ]]; then
    printf '\n[Trama-App] Encerrando somente os processos iniciados por este script...\n'
  fi
  stop_group "$FRONT_PID" "$FRONT_GROUP"
  stop_group "$BACK_PID" "$BACK_GROUP"
  [[ -n "$FRONT_PID" ]] && wait "$FRONT_PID" 2>/dev/null || true
  [[ -n "$BACK_PID" ]] && wait "$BACK_PID" 2>/dev/null || true
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

while (($#)); do
  case "$1" in
    --db-host) require_value "$@"; DB_HOST="$2"; EXPLICIT_DB=1; shift 2 ;;
    --db-port) require_value "$@"; DB_PORT="$2"; EXPLICIT_DB=1; shift 2 ;;
    --db-name) require_value "$@"; DB_NAME="$2"; EXPLICIT_DB=1; shift 2 ;;
    --db-user) require_value "$@"; DB_USER_OPT="$2"; shift 2 ;;
    --db-url) require_value "$@"; DB_URL_OPT="$2"; shift 2 ;;
    --api-port) require_value "$@"; API_PORT="$2"; shift 2 ;;
    --front-port) require_value "$@"; FRONT_PORT="$2"; shift 2 ;;
    --start-db) START_DB=1; shift ;;
    --check-only) CHECK_ONLY=1; shift ;;
    --skip-install) SKIP_INSTALL=1; shift ;;
    --run-tests) RUN_TESTS=1; shift ;;
    --no-browser) NO_BROWSER=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) fail "Opcao desconhecida: $1 (use --help)" ;;
  esac
done

port_check "$DB_PORT" || fail "Porta DB invalida: $DB_PORT"
port_check "$API_PORT" || fail "Porta API invalida: $API_PORT"
port_check "$FRONT_PORT" || fail "Porta frontend invalida: $FRONT_PORT"
[[ "$API_PORT" != "$FRONT_PORT" ]] || fail "As portas API e frontend devem ser diferentes."
[[ -f "$API/pom.xml" && -f "$API/mvnw" && -f "$API/.mvn/wrapper/maven-wrapper.properties" ]] || fail "Maven Wrapper incompleto em $API"
[[ -f "$FRONT/package.json" && -f "$FRONT/vite.config.js" ]] || fail "Frontend incompleto em $FRONT"
[[ -x "$API/mvnw" ]] || chmod u+x "$API/mvnw" || fail "Nao foi possivel tornar o Maven Wrapper executavel."

for tool in java javac node npm; do
  command -v "$tool" >/dev/null 2>&1 || fail "Comando '$tool' nao encontrado no PATH."
done
if [[ -n "${JAVA_HOME:-}" ]]; then
  [[ -x "$JAVA_HOME/bin/java" && -x "$JAVA_HOME/bin/javac" ]] || fail "JAVA_HOME incorreto: $JAVA_HOME"
  java_major=$("$JAVA_HOME/bin/javac" -version 2>&1 | grep -oE '[0-9]+' | head -1)
else
  java_major=$(javac -version 2>&1 | grep -oE '[0-9]+' | head -1)
fi
[[ "$java_major" =~ ^[0-9]+$ ]] && ((java_major >= 25)) || fail "JDK 25+ necessario (javac encontrado: $(javac -version 2>&1))."
node_major=$(node --version | sed -E 's/^v([0-9]+).*/\1/')
[[ "$node_major" =~ ^[0-9]+$ ]] && ((node_major >= 18)) || fail "Node.js 18+ necessario (recomendado 20/22 LTS)."
command -v curl >/dev/null 2>&1 || command -v wget >/dev/null 2>&1 || fail "Instale curl ou wget para os testes de prontidao HTTP."
info "Java: $(java -version 2>&1 | head -1) | Node: $(node --version) | npm: $(npm --version)"

# Prioridade: --db-url > DB_URL anterior > host/porta/nome informados.
if [[ -n "$DB_URL_OPT" ]]; then
  EFFECTIVE_DB_URL="$DB_URL_OPT"
elif ((EXPLICIT_DB == 0)) && [[ -n "${DB_URL:-}" ]]; then
  EFFECTIVE_DB_URL="$DB_URL"
else
  [[ "$DB_HOST" =~ ^[a-zA-Z0-9._-]+$ && "$DB_NAME" =~ ^[a-zA-Z0-9_-]+$ ]] || fail "Host/nome do banco invalidos."
  EFFECTIVE_DB_URL="jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}"
fi
if [[ "$EFFECTIVE_DB_URL" =~ ^jdbc:mysql://([^/:?]+)(:([0-9]+))?/([^?]+) ]]; then
  DB_CHECK_HOST="${BASH_REMATCH[1]}"
  DB_CHECK_PORT="${BASH_REMATCH[3]:-3306}"
else
  fail "DB_URL deve seguir o formato jdbc:mysql://host:porta/banco (URL atual nao suportada pelo verificador)."
fi
port_check "$DB_CHECK_PORT" || fail "Porta invalida na DB_URL"
DB_USER="${DB_USER:-$DB_USER_OPT}"
info "Banco: ${DB_CHECK_HOST}:${DB_CHECK_PORT} | Usuario: $DB_USER"

if ! tcp_check "$DB_CHECK_HOST" "$DB_CHECK_PORT"; then
  if ((START_DB == 1)) && [[ "$DB_CHECK_HOST" == 127.0.0.1 || "$DB_CHECK_HOST" == localhost ]]; then
    command -v systemctl >/dev/null 2>&1 || fail "systemctl ausente; inicialize MySQL manualmente."
    info "Tentando iniciar o servico local MySQL/MariaDB..."
    started=0
    for svc in mysql mysqld mariadb; do
      if systemctl list-unit-files "$svc.service" --no-legend 2>/dev/null | grep -q "^$svc.service"; then
        if systemctl start "$svc.service"; then started=1; break; fi
      fi
    done
    ((started == 1)) || fail "Nao foi possivel iniciar o banco. Execute com permissoes apropriadas ou inicie manualmente."
    for _ in {1..20}; do tcp_check "$DB_CHECK_HOST" "$DB_CHECK_PORT" && break; sleep 1; done
  fi
fi
tcp_check "$DB_CHECK_HOST" "$DB_CHECK_PORT" || fail "MySQL indisponivel em ${DB_CHECK_HOST}:${DB_CHECK_PORT}. Confirme servico/porta ou use --start-db (Linux com permissao)."
info "Conexao TCP com MySQL: OK (autenticacao sera validada pelo Spring/Flyway)."

if tcp_check 127.0.0.1 "$API_PORT"; then fail "Porta $API_PORT ja utilizada. Encerre a instancia anterior ou use --api-port."; fi
if tcp_check 127.0.0.1 "$FRONT_PORT"; then fail "Porta $FRONT_PORT ja utilizada. Encerre a instancia anterior ou use --front-port."; fi

if ((CHECK_ONLY == 1)); then
  info 'Verificacoes basicas concluidas. Nenhuma aplicacao foi iniciada.'
  info 'Nao foram verificados usuario/senha do banco, migrations, compilacao ou login.'
  exit 0
fi

umask 077
mkdir -p "$STATE" "$LOGS"
if [[ -z "${DB_PASSWORD:-}" ]]; then
  [[ -t 0 ]] || fail "DB_PASSWORD ausente e terminal nao interativo. Defina DB_PASSWORD no ambiente."
  read -r -s -p 'Senha do usuario MySQL: ' DB_PASSWORD
  printf '\n'
fi
[[ -n "$DB_PASSWORD" ]] || fail "Senha do banco vazia."
if [[ -z "${JWT_SECRET:-}" ]]; then
  if [[ -f "$STATE/jwt.linux.secret" ]]; then
    JWT_SECRET="$(cat "$STATE/jwt.linux.secret")"
  else
    JWT_SECRET="$(head -c 32 /dev/urandom | base64 | tr -d '\n')"
    (umask 077; printf '%s\n' "$JWT_SECRET" > "$STATE/jwt.linux.secret")
    chmod 600 "$STATE/jwt.linux.secret"
    info 'Chave JWT criada e salva com permissao 600 (nao compartilhe nem comite).'
  fi
fi
decoded_len="$(printf '%s' "$JWT_SECRET" | base64 --decode 2>/dev/null | wc -c | tr -d ' ')" || fail 'JWT_SECRET nao e Base64 valido.'
[[ "$decoded_len" =~ ^[0-9]+$ ]] && ((decoded_len >= 32)) || fail 'JWT_SECRET deve conter pelo menos 32 bytes ao decodificar Base64.'
export DB_URL="$EFFECTIVE_DB_URL" DB_USER DB_PASSWORD JWT_SECRET
export SERVER_PORT="$API_PORT" TRAMA_API_PORT="$API_PORT" TRAMA_FRONT_PORT="$FRONT_PORT"
export VITE_DEMO_MODE=false

if [[ ! -d "$FRONT/node_modules" ]]; then
  ((SKIP_INSTALL == 0)) || fail 'node_modules ausente; execute sem --skip-install.'
  info 'Instalando dependencias do frontend...'
  if [[ -f "$FRONT/package-lock.json" ]]; then
    (cd "$FRONT" && npm ci) || fail 'Falha no npm ci. Confira a conexao com o registro npm.'
  else
    (cd "$FRONT" && npm install) || fail 'Falha no npm install. Confira a conexao com o registro npm.'
  fi
fi

if ((RUN_TESTS == 1)); then
  info 'Executando testes de backend...'
  (cd "$API" && ./mvnw test) || fail 'Testes Maven falharam. Backend nao iniciado.'
  info 'Compilando frontend...'
  (cd "$FRONT" && npm run build) || fail 'Build frontend falhou. Aplicacoes nao iniciadas.'
fi

info "Iniciando Spring Boot na porta $API_PORT (log: $LOGS/backend.log)..."
: > "$LOGS/backend.log"
if command -v setsid >/dev/null 2>&1; then
  setsid bash -c 'cd "$1"; exec "$2" spring-boot:run' _ "$API" "$API/mvnw" > "$LOGS/backend.log" 2>&1 &
  BACK_GROUP=1
else
  warn 'setsid ausente: encerramento automatico de subprocessos pode ser incompleto.'
  (cd "$API" && exec "$API/mvnw" spring-boot:run) > "$LOGS/backend.log" 2>&1 &
fi
BACK_PID=$!
ready=0
for _ in {1..180}; do
  if http_check "http://127.0.0.1:${API_PORT}/auth/csrf"; then ready=1; break; fi
  if ! kill -0 "$BACK_PID" 2>/dev/null; then
    show_log_tail "$LOGS/backend.log"
    fail 'Spring Boot encerrou antes de responder em /auth/csrf (veja log).'
  fi
  sleep 2
done
if ((ready != 1)); then
  show_log_tail "$LOGS/backend.log"
  fail 'Spring Boot nao ficou pronto no limite de espera. Confira o log e as credenciais MySQL.'
fi
info "Spring Boot: pronto em http://127.0.0.1:${API_PORT}/auth/csrf"

info "Iniciando React/Vite na porta $FRONT_PORT (log: $LOGS/frontend.log)..."
: > "$LOGS/frontend.log"
if command -v setsid >/dev/null 2>&1; then
  setsid bash -c 'cd "$1"; exec npm run dev -- --host 127.0.0.1 --port "$2" --strictPort' _ "$FRONT" "$FRONT_PORT" > "$LOGS/frontend.log" 2>&1 &
  FRONT_GROUP=1
else
  (cd "$FRONT" && exec npm run dev -- --host 127.0.0.1 --port "$FRONT_PORT" --strictPort) > "$LOGS/frontend.log" 2>&1 &
fi
FRONT_PID=$!
ready=0
for _ in {1..60}; do
  if http_check "http://127.0.0.1:${FRONT_PORT}/"; then ready=1; break; fi
  if ! kill -0 "$FRONT_PID" 2>/dev/null; then
    show_log_tail "$LOGS/frontend.log"
    fail 'Frontend encerrou antes de responder. Confira o log.'
  fi
  sleep 2
done
if ((ready != 1)); then
  show_log_tail "$LOGS/frontend.log"
  fail 'Frontend nao ficou pronto. Confira o log.'
fi

printf '\n[Trama-App] Aplicacao iniciada com sucesso!\n'
printf '  Frontend: http://127.0.0.1:%s/\n  API:      http://127.0.0.1:%s/\n  Logs:     %s\n' "$FRONT_PORT" "$API_PORT" "$LOGS"
printf '  Para encerrar frontend e backend: Ctrl+C neste terminal.\n\n'
if ((NO_BROWSER == 0)) && [[ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ]] && command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://127.0.0.1:${FRONT_PORT}/" >/dev/null 2>&1 || true
fi
while :; do
  kill -0 "$BACK_PID" 2>/dev/null || { show_log_tail "$LOGS/backend.log"; fail 'Backend encerrou inesperadamente.'; }
  kill -0 "$FRONT_PID" 2>/dev/null || { show_log_tail "$LOGS/frontend.log"; fail 'Frontend encerrou inesperadamente.'; }
  sleep 2
done
