# Trama-App | Windows 11 | Inicializador local: MySQL + Spring Boot + React/Vite
# Compatibilidade: Windows PowerShell 5.1 e PowerShell 7+
[CmdletBinding()]
param(
    [string]$DbHost = '127.0.0.1',
    [ValidateRange(1,65535)][int]$DbPort = 3306,
    [string]$DbName = 'teiadb',
    [string]$DbUser = 'teia_app',
    [string]$DbUrl = '',
    [ValidateRange(1,65535)][int]$ApiPort = 8080,
    [ValidateRange(1,65535)][int]$FrontPort = 5173,
    [switch]$StartDatabase,
    [switch]$CheckOnly,
    [switch]$SkipInstall,
    [switch]$RunTests,
    [switch]$NoBrowser
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$api = Join-Path $root 'api'
$frontend = Join-Path $root 'frontend'
$state = Join-Path $root '.trama-app'
$logs = Join-Path $state 'logs'
$backend = $null
$web = $null
$failed = $false
$oldEnv = @{}
$envNames = @('DB_URL','DB_USER','DB_PASSWORD','JWT_SECRET','SERVER_PORT','TRAMA_API_PORT','TRAMA_FRONT_PORT','VITE_DEMO_MODE')
foreach ($name in $envNames) {
    $oldEnv[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}

function Say([string]$message) { Write-Host "[Trama-App] $message" }
function WarningMessage([string]$message) { Write-Warning $message }
function Fail([string]$message) { throw $message }
function Test-Tcp([string]$hostName, [int]$port) {
    $client = New-Object System.Net.Sockets.TcpClient
    $async = $null
    try {
        $async = $client.BeginConnect($hostName, $port, $null, $null)
        if (-not $async.AsyncWaitHandle.WaitOne(2000, $false)) { return $false }
        $client.EndConnect($async)
        return $true
    }
    catch { return $false }
    finally {
        if ($null -ne $async) { $async.AsyncWaitHandle.Close() }
        $client.Close()
    }
}
function Test-Http([string]$url) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        return ($response.StatusCode -eq 200)
    }
    catch { return $false }
}
function Log-Tail([string]$file) {
    if (Test-Path $file) {
        Write-Host "`n---- Ultimas linhas: $file ----"
        Get-Content -Path $file -Tail 35 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
    }
}
function Stop-OwnedProcess($proc) {
    if ($null -eq $proc) { return }
    try {
        # /T encerra a arvore cmd.exe -> mvnw.cmd -> java, ou cmd.exe -> npm -> vite.
        & taskkill.exe /PID $proc.Id /T /F 2>$null | Out-Null
    }
    catch { }
}
function Wait-Ready([string]$url, $proc, [string]$log, [string]$label, [int]$maxChecks) {
    for ($n = 0; $n -lt $maxChecks; $n++) {
        if (Test-Http $url) { return }
        $proc.Refresh()
        if ($proc.HasExited) {
            Log-Tail $log
            Fail "$label encerrou antes de ficar pronto. Consulte o log acima."
        }
        Start-Sleep -Seconds 2
    }
    Log-Tail $log
    Fail "$label nao respondeu ao teste de prontidao. Verifique o log."
}
function Get-Secret {
    if (-not [string]::IsNullOrWhiteSpace($env:JWT_SECRET)) { return $env:JWT_SECRET }
    $file = Join-Path $state 'jwt.windows.dpapi'
    if (Test-Path $file) {
        try {
            $secure = Get-Content -Path $file -Raw | ConvertTo-SecureString -ErrorAction Stop
            $secret = ([System.Net.NetworkCredential]::new('', $secure)).Password
            return $secret
        }
        catch { Fail "Nao foi possivel ler a chave JWT criptografada. Ela pertence ao usuario/Windows que a criou. Confirme o usuario ou defina JWT_SECRET manualmente." }
    }
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) }
    finally { $rng.Dispose() }
    $secret = [Convert]::ToBase64String($bytes)
    $secure = ConvertTo-SecureString -String $secret -AsPlainText -Force
    $secure | ConvertFrom-SecureString | Set-Content -Path $file -Encoding ASCII -NoNewline
    Say 'Chave JWT gerada e armazenada com protecao DPAPI para seu usuario Windows.'
    return $secret
}
function Try-StartMySql {
    $services = @(Get-Service -Name 'MySQL*','MariaDB*' -ErrorAction SilentlyContinue)
    if ($services.Count -eq 0) {
        WarningMessage 'Servico MySQL/MariaDB nao encontrado. Inicie seu banco manualmente.'
        return
    }
    foreach ($service in $services) {
        if ($service.Status -eq 'Running') { return }
    }
    $chosen = $services | Sort-Object Name | Select-Object -First 1
    Say "Tentando iniciar servico local: $($chosen.Name)"
    try { Start-Service -Name $chosen.Name -ErrorAction Stop }
    catch { WarningMessage "Falha ao iniciar $($chosen.Name). Verifique as permissoes do Windows e o servico MySQL." }
}

try {
    Say 'Verificando estrutura e ferramentas...'
    if (-not (Test-Path (Join-Path $api 'pom.xml')) -or -not (Test-Path (Join-Path $api 'mvnw.cmd')) -or
        -not (Test-Path (Join-Path $api '.mvn/wrapper/maven-wrapper.properties'))) {
        Fail 'Maven Wrapper incompleto. Confirme as pastas api, mvnw.cmd e .mvn/wrapper.'
    }
    if (-not (Test-Path (Join-Path $frontend 'package.json')) -or -not (Test-Path (Join-Path $frontend 'vite.config.js'))) {
        Fail 'Frontend incompleto. Confirme package.json e vite.config.js.'
    }
    foreach ($command in @('java.exe','javac.exe','node.exe','npm.cmd')) {
        if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { Fail "Comando $command nao encontrado. Instale/configure JDK 25, Node.js e npm." }
    }
    if (-not [string]::IsNullOrWhiteSpace($env:JAVA_HOME)) {
        $javacPath = Join-Path $env:JAVA_HOME 'bin/javac.exe'
        $javaPath = Join-Path $env:JAVA_HOME 'bin/java.exe'
        if (-not (Test-Path $javaPath) -or -not (Test-Path $javacPath)) { Fail "JAVA_HOME incorreto: $env:JAVA_HOME" }
        $jdkVersion = (& $javacPath -version | Out-String).Trim()
    }
    else { $jdkVersion = (& javac.exe -version | Out-String).Trim() }
    if ($jdkVersion -match '^javac\s+(\d+)') { $jdkMajor = [int]$Matches[1] }
    else { Fail "Nao foi possivel identificar a versao do JDK: $jdkVersion" }
    if ($jdkMajor -lt 25) { Fail "O backend exige JDK 25 ou superior. Encontrado: $jdkVersion" }
    $nodeVersion = (& node.exe --version | Out-String).Trim()
    if ($nodeVersion -match '^v(\d+)') { $nodeMajor = [int]$Matches[1] }
    else { Fail "Nao foi possivel identificar a versao do Node.js: $nodeVersion" }
    if ($nodeMajor -lt 18) { Fail 'Node.js 18 ou superior necessario (recomendado Node 20/22 LTS).' }
    Say "Ferramentas OK: $jdkVersion | Node $nodeVersion | npm $((& npm.cmd --version | Out-String).Trim())"

    $explicitConfig = ($PSBoundParameters.ContainsKey('DbHost') -or $PSBoundParameters.ContainsKey('DbPort') -or $PSBoundParameters.ContainsKey('DbName'))
    if (-not [string]::IsNullOrWhiteSpace($DbUrl)) { $effectiveUrl = $DbUrl }
    elseif (-not $explicitConfig -and -not [string]::IsNullOrWhiteSpace($env:DB_URL)) { $effectiveUrl = $env:DB_URL }
    else {
        if ($DbHost -notmatch '^[a-zA-Z0-9._-]+$' -or $DbName -notmatch '^[a-zA-Z0-9_-]+$') { Fail 'Host ou nome do banco invalido.' }
        $effectiveUrl = "jdbc:mysql://${DbHost}:${DbPort}/${DbName}"
    }
    if ($effectiveUrl -match '^jdbc:mysql://([^/:?]+)(?::(\d+))?/([^?]+)') {
        $dbCheckHost = $Matches[1]
        $dbCheckPort = if ($Matches.ContainsKey('2') -and $Matches['2']) { [int]$Matches['2'] } else { 3306 }
    }
    else { Fail 'DB_URL deve seguir jdbc:mysql://host:porta/banco. URLs especiais precisam de configuracao manual.' }
    if ($dbCheckPort -lt 1 -or $dbCheckPort -gt 65535) { Fail 'Porta invalida na DB_URL.' }
    $effectiveUser = if (-not $PSBoundParameters.ContainsKey('DbUser') -and -not [string]::IsNullOrWhiteSpace($env:DB_USER)) { $env:DB_USER } else { $DbUser }
    Say "Banco: ${dbCheckHost}:${dbCheckPort} | Usuario: $effectiveUser"

    if (-not (Test-Tcp $dbCheckHost $dbCheckPort)) {
        if ($StartDatabase -and @('127.0.0.1','localhost') -contains $dbCheckHost) {
            Try-StartMySql
            for ($n=0; $n -lt 20 -and -not (Test-Tcp $dbCheckHost $dbCheckPort); $n++) { Start-Sleep -Seconds 1 }
        }
    }
    if (-not (Test-Tcp $dbCheckHost $dbCheckPort)) {
        Fail "MySQL nao responde em ${dbCheckHost}:${dbCheckPort}. Inicie o servico ou execute com -StartDatabase (com permissao)."
    }
    Say 'MySQL acessivel pela rede. Usuario e senha serao validados na inicializacao do Spring/Flyway.'
    if ($ApiPort -eq $FrontPort) { Fail 'As portas da API e do frontend precisam ser diferentes.' }
    if (Test-Tcp '127.0.0.1' $ApiPort) { Fail "Porta $ApiPort ja utilizada. Feche a API anterior ou use -ApiPort." }
    if (Test-Tcp '127.0.0.1' $FrontPort) { Fail "Porta $FrontPort ja utilizada. Feche o frontend anterior ou use -FrontPort." }

    if ($CheckOnly) {
        Say 'Ambiente e conexao TCP verificados. Nada foi iniciado.'
        Say 'O teste nao verifica login MySQL, migrations, compilacao ou API.'
        return
    }
    New-Item -ItemType Directory -Force -Path $state, $logs | Out-Null
    $databasePassword = $env:DB_PASSWORD
    if ([string]::IsNullOrWhiteSpace($databasePassword)) {
        $securePassword = Read-Host 'Senha do usuario MySQL' -AsSecureString
        $databasePassword = ([System.Net.NetworkCredential]::new('', $securePassword)).Password
    }
    if ([string]::IsNullOrWhiteSpace($databasePassword)) { Fail 'Senha MySQL vazia.' }
    $secret = Get-Secret
    try { $secretBytes = [Convert]::FromBase64String($secret) }
    catch { Fail 'JWT_SECRET invalida: a chave precisa estar codificada em Base64.' }
    if ($secretBytes.Length -lt 32) { Fail 'JWT_SECRET deve conter pelo menos 32 bytes decodificados.' }

    $env:DB_URL = $effectiveUrl
    $env:DB_USER = $effectiveUser
    $env:DB_PASSWORD = $databasePassword
    $env:JWT_SECRET = $secret
    $env:SERVER_PORT = [string]$ApiPort
    $env:TRAMA_API_PORT = [string]$ApiPort
    $env:TRAMA_FRONT_PORT = [string]$FrontPort
    $env:VITE_DEMO_MODE = 'false'

    if (-not (Test-Path (Join-Path $frontend 'node_modules'))) {
        if ($SkipInstall) { Fail 'Dependencias do frontend ausentes. Execute sem -SkipInstall.' }
        Say 'Instalando dependencias do frontend...'
        Push-Location $frontend
        try {
            if (Test-Path 'package-lock.json') { & npm.cmd ci } else { & npm.cmd install }
            if ($LASTEXITCODE -ne 0) { Fail 'Falha ao instalar dependencias npm. Confira a rede e o registro npm.' }
        }
        finally { Pop-Location }
    }

    if ($RunTests) {
        Say 'Executando testes do backend...'
        Push-Location $api
        try {
            & .\mvnw.cmd test
            if ($LASTEXITCODE -ne 0) { Fail 'Falha nos testes Maven. Backend nao iniciado.' }
        }
        finally { Pop-Location }
        Say 'Compilando o frontend...'
        Push-Location $frontend
        try {
            & npm.cmd run build
            if ($LASTEXITCODE -ne 0) { Fail 'Falha no build Vite. Aplicacoes nao iniciadas.' }
        }
        finally { Pop-Location }
    }

    $backOut = Join-Path $logs 'backend.log'
    $backErr = Join-Path $logs 'backend-error.log'
    $frontOut = Join-Path $logs 'frontend.log'
    $frontErr = Join-Path $logs 'frontend-error.log'
    $wrapper = Join-Path $api 'mvnw.cmd'
    Say "Iniciando Spring Boot na porta $ApiPort..."
    $backArgs = '/d /s /c ""{0}" spring-boot:run"' -f $wrapper
    $backend = Start-Process -FilePath 'cmd.exe' -ArgumentList $backArgs -WorkingDirectory $api -PassThru -RedirectStandardOutput $backOut -RedirectStandardError $backErr
    Wait-Ready "http://127.0.0.1:${ApiPort}/auth/csrf" $backend $backOut 'Spring Boot' 180
    Say 'Spring Boot pronto. Autenticacao de banco e Flyway passaram pela inicializacao.'

    Say "Iniciando React/Vite na porta $FrontPort..."
    $frontArgs = '/d /s /c "npm run dev -- --host 127.0.0.1 --port {0} --strictPort"' -f $FrontPort
    $web = Start-Process -FilePath 'cmd.exe' -ArgumentList $frontArgs -WorkingDirectory $frontend -PassThru -RedirectStandardOutput $frontOut -RedirectStandardError $frontErr
    Wait-Ready "http://127.0.0.1:${FrontPort}/" $web $frontOut 'Frontend Vite' 60
    Write-Host ''
    Say 'Aplicacao pronta.'
    Say "Frontend: http://127.0.0.1:${FrontPort}/"
    Say "API: http://127.0.0.1:${ApiPort}/"
    Say "Logs: $logs"
    Say 'Para encerrar os processos iniciados pelo Trama-App, pressione Ctrl+C.'
    if (-not $NoBrowser) {
        try { Start-Process "http://127.0.0.1:${FrontPort}/" | Out-Null }
        catch { WarningMessage 'Nao foi possivel abrir navegador automaticamente.' }
    }
    while ($true) {
        $backend.Refresh()
        $web.Refresh()
        if ($backend.HasExited) { Log-Tail $backOut; Log-Tail $backErr; Fail 'Backend foi encerrado inesperadamente.' }
        if ($web.HasExited) { Log-Tail $frontOut; Log-Tail $frontErr; Fail 'Frontend foi encerrado inesperadamente.' }
        Start-Sleep -Seconds 2
    }
}
catch {
    Write-Host "[ERRO] $($_.Exception.Message)" -ForegroundColor Red
    if ($null -ne $backend) {
        Log-Tail (Join-Path $logs 'backend.log')
        Log-Tail (Join-Path $logs 'backend-error.log')
    }
    if ($null -ne $web) {
        Log-Tail (Join-Path $logs 'frontend.log')
        Log-Tail (Join-Path $logs 'frontend-error.log')
    }
    $failed = $true
}
finally {
    if ($null -ne $backend -or $null -ne $web) { Say 'Encerrando processos iniciados por esta sessao...' }
    Stop-OwnedProcess $web
    Stop-OwnedProcess $backend
    foreach ($name in $envNames) {
        [Environment]::SetEnvironmentVariable($name, $oldEnv[$name], 'Process')
    }
}
if ($failed) { exit 1 }
