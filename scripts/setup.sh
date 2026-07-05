#!/usr/bin/env bash
# Origen Editor (Editor Fantasma) — setup AUTOMÁTICO del entorno (mac / Linux).
# No solo comprueba: INSTALA lo que falte (Homebrew/apt + npm + pip) y configura el navegador.
# Los binarios pesados no viven en el repo: este script los trae. HyperFrames se descarga vía npx.
# Defensivo: ningún paso tumba el script entero. Imprime un resumen al final.
# Uso:  bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup.sh"   (o doble clic en INSTALAR.command)

OK=(); WARN=()
have() { command -v "$1" >/dev/null 2>&1; }

echo "=== Origen Editor · setup automatico (mac/Linux) ==="

IS_MAC=false
[[ "$(uname)" == "Darwin" ]] && IS_MAC=true

# 0. Homebrew (solo mac): instalarlo si falta — es el que baja Node/ffmpeg/Chrome
if $IS_MAC && ! have brew; then
  echo "Instalando Homebrew (gestor de paquetes de Mac, tarda un poco)..."
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" </dev/null
  [[ -x /opt/homebrew/bin/brew ]] && eval "$(/opt/homebrew/bin/brew shellenv)"
  [[ -x /usr/local/bin/brew   ]] && eval "$(/usr/local/bin/brew shellenv)"
fi

# Helper de instalación multiplataforma.  pkg_install <formula-brew> <paquete-apt> [cask]
pkg_install() {
  if $IS_MAC && have brew; then
    if [[ "$3" == "cask" ]]; then brew install --cask "$1"; else brew install "$1"; fi
  elif have apt-get; then
    sudo apt-get update -y >/dev/null 2>&1; sudo apt-get install -y "$2"
  fi
  hash -r
}

# 1. Node + npx + HyperFrames
have node || { echo "Instalando Node.js..."; pkg_install node nodejs; }
if have node; then
  OK+=("Node $(node -v)")
  if have npx; then
    if HF="$(npx --yes hyperframes --version 2>/dev/null)"; then OK+=("HyperFrames ${HF} (npx lo descarga y cachea solo)")
    else WARN+=("No pude ejecutar 'npx hyperframes --version'. Prueba: npx hyperframes doctor"); fi
  else WARN+=("Falta npx (viene con Node). Reinstala Node 18+."); fi
else WARN+=("No pude instalar Node. Descárgalo de nodejs.org y relanza el setup."); fi

# 2. ffmpeg / ffprobe
have ffmpeg || { echo "Instalando ffmpeg..."; pkg_install ffmpeg ffmpeg; }
if have ffmpeg;  then OK+=("ffmpeg presente");  else WARN+=("No pude instalar ffmpeg. Prueba: brew install ffmpeg"); fi
if have ffprobe; then OK+=("ffprobe presente"); fi

# 3. Chrome / Chromium + HYPERFRAMES_BROWSER_PATH (se configura SOLO y de forma permanente)
CHROME=""
for c in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "$(command -v google-chrome 2>/dev/null)" \
  "$(command -v google-chrome-stable 2>/dev/null)" \
  "$(command -v chromium 2>/dev/null)" \
  "$(command -v chromium-browser 2>/dev/null)"; do
  if [[ -n "$c" && -e "$c" ]]; then CHROME="$c"; break; fi
done
if [[ -z "$CHROME" ]] && $IS_MAC; then
  echo "Instalando Google Chrome..."; brew install --cask google-chrome
  [[ -e "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]] && CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
fi
if [[ -n "$CHROME" ]]; then
  OK+=("Chrome/Chromium detectado")
  export HYPERFRAMES_BROWSER_PATH="$CHROME"
  SHRC="$HOME/.zshrc"; [[ "${SHELL##*/}" == "bash" ]] && SHRC="$HOME/.bashrc"
  if grep -q "HYPERFRAMES_BROWSER_PATH" "$SHRC" 2>/dev/null; then
    OK+=("HYPERFRAMES_BROWSER_PATH ya configurado en $SHRC")
  else
    printf '\n# Origen Editor — ruta de Chrome para HyperFrames\nexport HYPERFRAMES_BROWSER_PATH="%s"\n' "$CHROME" >> "$SHRC"
    OK+=("HYPERFRAMES_BROWSER_PATH configurado (permanente) en $SHRC")
  fi
else
  WARN+=("No encuentro Chrome. Instálalo y luego: export HYPERFRAMES_BROWSER_PATH=\"/ruta/a/chrome\"")
fi

# 4. Python + faster-whisper (el modelo de Whisper se baja solo la 1ª vez que transcribes)
PY=""; if have python3; then PY="python3"; elif have python; then PY="python"; fi
if [[ -z "$PY" ]]; then echo "Instalando Python..."; pkg_install python python3; have python3 && PY="python3"; fi
if [[ -n "$PY" ]]; then
  OK+=("$($PY --version 2>&1)")
  if $PY -c "import faster_whisper" >/dev/null 2>&1; then
    OK+=("faster-whisper presente")
  else
    echo "Instalando faster-whisper (pip)..."
    $PY -m pip install --quiet --user faster-whisper >/dev/null 2>&1 || $PY -m pip install --quiet --break-system-packages faster-whisper >/dev/null 2>&1
    if $PY -c "import faster_whisper" >/dev/null 2>&1; then OK+=("faster-whisper instalado")
    else WARN+=("No pude instalar faster-whisper. Ejecuta: $PY -m pip install faster-whisper"); fi
  fi
else
  WARN+=("Falta Python 3.10+. Instálalo y luego: pip install faster-whisper")
fi

# 5. Dependencias del MOTOR DE EXPORT (puppeteer-core para el render que captura el CRM)
RENDER_DIR="$(cd "$(dirname "$0")/../render" && pwd)"
if have npm && [ -f "$RENDER_DIR/package.json" ]; then
  if [ ! -d "$RENDER_DIR/node_modules/puppeteer-core" ]; then
    echo "Instalando dependencias del motor de export (npm install en render/)..."
    ( cd "$RENDER_DIR" && npm install --silent >/dev/null 2>&1 )
  fi
  [ -d "$RENDER_DIR/node_modules/puppeteer-core" ] && OK+=("Motor de export listo (puppeteer-core)") \
    || WARN+=("No pude instalar las deps de render/. Ejecuta: cd '$RENDER_DIR' && npm install")
else
  WARN+=("Falta npm (viene con Node) para instalar el motor de export.")
fi

# Resumen
echo ""; echo "----- Resumen -----"
for o in "${OK[@]}";   do echo "  OK    $o"; done
for w in "${WARN[@]}"; do echo "  AVISO $w"; done
echo ""
if [[ ${#WARN[@]} -eq 0 ]]; then
  echo "Todo listo ✅  Abre una terminal NUEVA (para cargar la ruta de Chrome) y usa: /origen-editor:auto <ruta-del-clip>"
else
  echo "Faltan ${#WARN[@]} cosa(s). Revisa los AVISO de arriba. Casi todo se arregla abriendo una terminal NUEVA y relanzando."
fi
