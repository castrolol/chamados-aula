@echo off
rem Prepara uma maquina Windows para a aula: Node.js, Git e Claude Code.
rem Uso: botao direito > "Executar como administrador"  (ou rode em um CMD de administrador)
rem Nao contem chaves nem enderecos: a chave e a URL do proxy sao passadas na aula.
setlocal
set NODE_VERSION=24.18.0
set FALHA=0

net session >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Execute como administrador: botao direito neste arquivo ^> Executar como administrador.
    pause
    exit /b 1
)

rem ---------- Node.js ----------
echo ==^> Node.js
set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%PATH%"
set NV=0
where node >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=1 delims=." %%v in ('node -v') do set NV=%%v
)
set NV=%NV:v=%
if %NV% GEQ 22 (
    echo     OK ja instalado
    goto git
)

set ARQ=x64
if /i "%PROCESSOR_ARCHITECTURE%"=="ARM64" set ARQ=arm64
set MSI=%TEMP%\node-v%NODE_VERSION%-%ARQ%.msi
echo     baixando Node %NODE_VERSION% (%ARQ%)...
curl.exe -fsSL "https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-%ARQ%.msi" -o "%MSI%"
if errorlevel 1 (
    echo [ERRO] Falha ao baixar o Node.
    set FALHA=1
    goto fim
)
echo     instalando...
msiexec /i "%MSI%" /qn /norestart
if errorlevel 1 if not errorlevel 3010 (
    echo [ERRO] Falha ao instalar o Node.
    set FALHA=1
    goto fim
)
del "%MSI%" >nul 2>&1
echo     OK Node instalado

:git
rem ---------- Git ----------
echo ==^> Git
set "PATH=%ProgramFiles%\Git\cmd;%PATH%"
where git >nul 2>&1
if not errorlevel 1 (
    echo     OK ja instalado
    goto claude
)

where winget >nul 2>&1
if not errorlevel 1 (
    echo     instalando via winget...
    winget install --id Git.Git -e --source winget --silent --accept-package-agreements --accept-source-agreements >nul
)
where git >nul 2>&1
if not errorlevel 1 (
    echo     OK Git instalado
    goto claude
)

echo     winget indisponivel ou falhou; baixando o instalador oficial...
set GITEXE=%TEMP%\git-instalador.exe
set GITPAT=Git-*-64-bit.exe
if /i "%PROCESSOR_ARCHITECTURE%"=="ARM64" set GITPAT=Git-*-arm64.exe
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol='Tls12'; $r=Invoke-RestMethod 'https://api.github.com/repos/git-for-windows/git/releases/latest' -Headers @{'User-Agent'='instalar-aula'}; $a=$r.assets | Where-Object { $_.name -like '%GITPAT%' } | Select-Object -First 1; Invoke-WebRequest $a.browser_download_url -OutFile '%GITEXE%'"
if errorlevel 1 (
    echo [ERRO] Falha ao baixar o instalador do Git.
    set FALHA=1
    goto fim
)
"%GITEXE%" /VERYSILENT /NORESTART /SP-
del "%GITEXE%" >nul 2>&1
set "PATH=%ProgramFiles%\Git\cmd;%PATH%"
where git >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Git nao foi instalado.
    set FALHA=1
    goto fim
)
echo     OK Git instalado

:claude
rem ---------- Claude Code ----------
echo ==^> Claude Code
where claude >nul 2>&1
if not errorlevel 1 (
    echo     OK ja instalado
    goto fim
)
call "%ProgramFiles%\nodejs\npm.cmd" install -g @anthropic-ai/claude-code >nul
if errorlevel 1 (
    echo [ERRO] Falha ao instalar o Claude Code.
    set FALHA=1
    goto fim
)
echo     OK Claude Code instalado

:fim
echo.
if "%FALHA%"=="1" (
    echo A instalacao NAO terminou. Avise o professor com a mensagem de erro acima.
    pause
    exit /b 1
)
echo Tudo pronto. FECHE esta janela e abra um terminal novo (para o PATH atualizar).
echo Depois, no terminal novo, confira:  node -v ^&^& git --version ^&^& claude --version
pause
