# Prepara uma máquina Windows para a aula: Node.js, Git e Claude Code.
# Uso (PowerShell):  powershell -ExecutionPolicy Bypass -File scripts\instalar.ps1
# Não contém chaves nem endereços: a chave e a URL do proxy são passadas na aula.

param([string]$NodeVersion = '24.18.0')

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Info($m) { Write-Host "==> $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "    OK  $m" -ForegroundColor Green }
function Fail($m) { Write-Host "    ERRO $m" -ForegroundColor Red }

function Atualizar-Path {
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
                [Environment]::GetEnvironmentVariable('Path', 'User')
}

function Tem($comando) { [bool](Get-Command $comando -ErrorAction SilentlyContinue) }

# Instalar programa exige administrador: reabre elevado se preciso.
$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
         ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $admin) {
    Info 'Pedindo permissão de administrador...'
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -NodeVersion $NodeVersion"
    exit
}

$falhas = @()

try {
    # ---------- Node.js ----------
    Info 'Node.js'
    Atualizar-Path
    $major = 0
    if (Tem node) { $major = [int](((node -v) -replace '^v', '').Split('.')[0]) }
    if ($major -ge 22) {
        Ok "já instalado ($(node -v))"
    } else {
        $arq = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'x64' }
        $msi = Join-Path $env:TEMP "node-v$NodeVersion-$arq.msi"
        Write-Host "    baixando Node $NodeVersion ($arq)..."
        Invoke-WebRequest "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-$arq.msi" -OutFile $msi
        Write-Host '    instalando...'
        $p = Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /qn /norestart" -Wait -PassThru
        if ($p.ExitCode -notin 0, 3010) { throw "msiexec saiu com código $($p.ExitCode)" }
        Remove-Item $msi -ErrorAction SilentlyContinue
        Atualizar-Path
        if (-not (Tem node)) { throw 'Node instalado, mas não encontrado no PATH' }
        Ok "instalado ($(node -v))"
    }

    # ---------- Git ----------
    Info 'Git'
    Atualizar-Path
    if (Tem git) {
        Ok "já instalado ($(git --version))"
    } else {
        $instalado = $false
        if (Tem winget) {
            Write-Host '    instalando via winget...'
            winget install --id Git.Git -e --source winget --silent --accept-package-agreements --accept-source-agreements | Out-Null
            Atualizar-Path
            $instalado = Tem git
        }
        if (-not $instalado) {
            Write-Host '    winget indisponível ou falhou; baixando o instalador oficial...'
            $rel = Invoke-RestMethod 'https://api.github.com/repos/git-for-windows/git/releases/latest' -Headers @{ 'User-Agent' = 'instalar-aula' }
            $padrao = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'Git-*-arm64.exe' } else { 'Git-*-64-bit.exe' }
            $asset = $rel.assets | Where-Object { $_.name -like $padrao } | Select-Object -First 1
            if (-not $asset) { throw 'não achei o instalador do Git na release mais recente' }
            $exe = Join-Path $env:TEMP $asset.name
            Invoke-WebRequest $asset.browser_download_url -OutFile $exe
            $p = Start-Process $exe -ArgumentList '/VERYSILENT /NORESTART /SP-' -Wait -PassThru
            if ($p.ExitCode -ne 0) { throw "instalador do Git saiu com código $($p.ExitCode)" }
            Remove-Item $exe -ErrorAction SilentlyContinue
            Atualizar-Path
        }
        if (-not (Tem git)) { throw 'Git instalado, mas não encontrado no PATH' }
        Ok "instalado ($(git --version))"
    }
} catch {
    Fail $_.Exception.Message
    $falhas += $_.Exception.Message
}

# ---------- Claude Code ----------
if ($falhas.Count -eq 0) {
    try {
        Info 'Claude Code'
        Atualizar-Path
        if (Tem claude) {
            Ok "já instalado ($(claude --version))"
        } else {
            npm install -g '@anthropic-ai/claude-code' | Out-Null
            Atualizar-Path
            if (-not (Tem claude)) { throw 'Claude Code instalado, mas não encontrado no PATH' }
            Ok "instalado ($(claude --version))"
        }
    } catch {
        Fail $_.Exception.Message
        $falhas += $_.Exception.Message
    }
}

Write-Host ''
if ($falhas.Count -gt 0) {
    Write-Host 'A instalação NÃO terminou. Avise o professor com a mensagem de erro acima.' -ForegroundColor Red
} else {
    Write-Host 'Tudo pronto. FECHE esta janela e abra um terminal novo (para o PATH atualizar).' -ForegroundColor Green
    Write-Host 'Depois, no terminal novo, confira:  node -v ; git --version ; claude --version'
}
Read-Host 'Enter para fechar'
if ($falhas.Count -gt 0) { exit 1 }
