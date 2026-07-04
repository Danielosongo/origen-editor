<#  Origen Editor (Editor Fantasma) — setup AUTOMÁTICO del entorno (Windows / PowerShell).
    No solo comprueba: INSTALA lo que falte (winget + pip) y configura el navegador.
    Los binarios pesados no viven en el repo (límites de GitHub): este script los trae con un clic.
    Defensivo: ningún paso tumba el script entero. Imprime un resumen al final.
    Uso:  & "${CLAUDE_PLUGIN_ROOT}\scripts\setup.ps1"   (o doble clic en INSTALAR.bat)  #>

$ErrorActionPreference = "Continue"
$ok = @(); $warn = @()

function Have($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
function RefreshPath {
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" +
              [System.Environment]::GetEnvironmentVariable("Path","User")
}
function WingetInstall($id, $name) {
  if (-not (Have winget)) { return $false }
  Write-Host ("Instalando {0} (winget)..." -f $name) -ForegroundColor Yellow
  & winget install -e --id $id --accept-source-agreements --accept-package-agreements --silent 2>$null | Out-Null
  RefreshPath
  return $true
}

Write-Host "=== Origen Editor · setup automatico (Windows) ===" -ForegroundColor Cyan

# 1. Node + npx + HyperFrames
if (-not (Have node)) {
  if (-not (WingetInstall "OpenJS.NodeJS.LTS" "Node.js LTS")) { $warn += "Falta Node.js 18+ y no hay winget. Instala Node desde nodejs.org y relanza el setup." }
}
if (Have node) {
  $nodev = (& node -v) 2>$null
  $ok += "Node $nodev"
  if (Have npx) {
    try {
      $hf = (& npx --yes hyperframes --version) 2>$null
      if ($LASTEXITCODE -eq 0 -and $hf) { $ok += "HyperFrames $hf (npx lo descarga y cachea solo)" }
      else { $warn += "No pude ejecutar 'npx hyperframes --version'. Prueba: npx hyperframes doctor" }
    } catch { $warn += "Fallo al lanzar HyperFrames vía npx. Prueba: npx hyperframes doctor" }
  } else { $warn += "Falta npx (viene con Node). Abre una TERMINAL NUEVA y relanza el setup." }
}

# 2. ffmpeg / ffprobe
if (-not (Have ffmpeg)) {
  if (-not (WingetInstall "Gyan.FFmpeg" "ffmpeg")) { $warn += "Falta ffmpeg y no hay winget. Descárgalo de gyan.dev/ffmpeg y ponlo en el PATH." }
}
if (Have ffmpeg)  { $ok += "ffmpeg presente" }  else { $warn += "ffmpeg instalado pero el PATH aún no lo ve: abre una TERMINAL NUEVA y relanza el setup." }
if (Have ffprobe) { $ok += "ffprobe presente" }

# 3. Chrome + HYPERFRAMES_BROWSER_PATH (se configura SOLO)
$chromeDefault = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$chromeAlt     = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
$chrome = $null
if (Test-Path $chromeDefault) { $chrome = $chromeDefault }
elseif (Test-Path $chromeAlt) { $chrome = $chromeAlt }

if (-not $chrome) {
  if (WingetInstall "Google.Chrome" "Google Chrome") {
    if (Test-Path $chromeDefault) { $chrome = $chromeDefault }
  }
}
if ($chrome) {
  $env:HYPERFRAMES_BROWSER_PATH = $chrome
  if (-not [System.Environment]::GetEnvironmentVariable("HYPERFRAMES_BROWSER_PATH","User")) {
    & setx HYPERFRAMES_BROWSER_PATH "$chrome" | Out-Null
    $ok += "HYPERFRAMES_BROWSER_PATH configurado (permanente): $chrome"
  } else { $ok += "HYPERFRAMES_BROWSER_PATH ya configurado" }
} else {
  $warn += "No encuentro Chrome. Instálalo y luego:  setx HYPERFRAMES_BROWSER_PATH `"$chromeDefault`""
}

# 4. Python + faster-whisper (el modelo de Whisper se descarga SOLO la primera vez que transcribes)
if (-not (Have python)) {
  if (-not (WingetInstall "Python.Python.3.12" "Python 3.12")) { $warn += "Falta Python 3.10+ y no hay winget. Instálalo de python.org (marca 'Add to PATH')." }
}
if (Have python) {
  $pyv = (& python --version) 2>&1
  $ok += "$pyv"
  & python -c "import faster_whisper" 2>$null
  if ($LASTEXITCODE -eq 0) {
    $ok += "faster-whisper presente"
  } else {
    Write-Host "Instalando faster-whisper (pip)..." -ForegroundColor Yellow
    & python -m pip install --quiet faster-whisper 2>$null
    & python -c "import faster_whisper" 2>$null
    if ($LASTEXITCODE -eq 0) { $ok += "faster-whisper instalado" }
    else { $warn += "No pude instalar faster-whisper. Ejecuta a mano:  python -m pip install faster-whisper" }
  }
} else {
  $warn += "Python instalado pero el PATH aún no lo ve: abre una TERMINAL NUEVA y relanza el setup."
}

# 5. Dependencias del MOTOR DE EXPORT (puppeteer-core para el render que captura el CRM)
$renderDir = Join-Path $PSScriptRoot "..\render"
if ((Have npm) -and (Test-Path (Join-Path $renderDir "package.json"))) {
  if (-not (Test-Path (Join-Path $renderDir "node_modules\puppeteer-core"))) {
    Write-Host "Instalando dependencias del motor de export (npm install en render/)..." -ForegroundColor Yellow
    Push-Location $renderDir; & npm install --silent 2>$null; Pop-Location
  }
  if (Test-Path (Join-Path $renderDir "node_modules\puppeteer-core")) { $ok += "Motor de export listo (puppeteer-core)" }
  else { $warn += "No pude instalar las deps de render/. Ejecuta a mano:  cd `"$renderDir`"; npm install" }
} else { $warn += "Falta npm (viene con Node) para instalar el motor de export. Instala Node y relanza." }

# Resumen
Write-Host ""
Write-Host "----- Resumen -----" -ForegroundColor Cyan
foreach ($o in $ok)   { Write-Host "  OK   $o" -ForegroundColor Green }
foreach ($w in $warn) { Write-Host "  AVISO $w" -ForegroundColor Yellow }
Write-Host ""
if ($warn.Count -eq 0) {
  Write-Host "Todo listo. Ya puedes usar /origen-editor:auto <ruta-del-clip> (o :nuevo para ir paso a paso)" -ForegroundColor Green
} else {
  Write-Host ("Faltan {0} cosa(s). Casi siempre se arregla abriendo una TERMINAL NUEVA y relanzando el setup." -f $warn.Count) -ForegroundColor Yellow
}
