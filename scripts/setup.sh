#!/usr/bin/env bash
# Editor Fantasma — setup del entorno (mac / Linux).
# Comprueba e instala lo necesario para renderizar vídeo con HyperFrames + Claude.
# Defensivo: ningún check opcional tumba el script. Imprime un resumen al final.
# Uso:  bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup.sh"

OK=(); WARN=()
have() { command -v "$1" >/dev/null 2>&1; }

echo "=== Editor Fantasma · setup (mac/Linux) ==="

# Detectar gestor de paquetes para las pistas de instalación
if [[ "$(uname)" == "Darwin" ]]; then PKG="brew install"; else PKG="sudo apt install -y"; fi

# 1. Node + npx + HyperFrames
if have node; then
  OK+=("Node $(node -v)")
  if have npx; then
    if HF="$(npx --yes hyperframes --version 2>/dev/null)"; then
      OK+=("HyperFrames ${HF} (npx)")
    else
      WARN+=("No pude ejecutar 'npx hyperframes --version'. Prueba: npx hyperframes doctor")
    fi
  else
    WARN+=("Falta npx (viene con Node). Reinstala Node 18+.")
  fi
else
  WARN+=("Falta Node.js (18+). Instala:  ${PKG} node   (mac: brew install node)")
fi

# 2. ffmpeg / ffprobe
if have ffmpeg;  then OK+=("ffmpeg presente");  else WARN+=("Falta ffmpeg. Instala:  ${PKG} ffmpeg"); fi
if have ffprobe; then OK+=("ffprobe presente"); else WARN+=("Falta ffprobe (viene con ffmpeg). Instala:  ${PKG} ffmpeg"); fi

# 3. Chrome / Chromium + HYPERFRAMES_BROWSER_PATH
CHROME=""
for c in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "$(command -v google-chrome 2>/dev/null)" \
  "$(command -v google-chrome-stable 2>/dev/null)" \
  "$(command -v chromium 2>/dev/null)" \
  "$(command -v chromium-browser 2>/dev/null)"; do
  if [[ -n "$c" && -e "$c" ]]; then CHROME="$c"; break; fi
done
if [[ -n "$CHROME" ]]; then
  OK+=("Chrome/Chromium detectado: $CHROME")
  if [[ -n "$HYPERFRAMES_BROWSER_PATH" ]]; then
    OK+=("HYPERFRAMES_BROWSER_PATH ya configurado")
  else
    WARN+=("Exporta la ruta de Chrome:  export HYPERFRAMES_BROWSER_PATH=\"$CHROME\"  (añádelo a ~/.zshrc o ~/.bashrc)")
  fi
else
  WARN+=("No encuentro Chrome/Chromium. Instálalo y luego:  export HYPERFRAMES_BROWSER_PATH=\"/ruta/a/chrome\"")
fi

# 4. Python + faster-whisper
PY=""
if have python3; then PY="python3"; elif have python; then PY="python"; fi
if [[ -n "$PY" ]]; then
  OK+=("$($PY --version 2>&1)")
  if $PY -c "import faster_whisper" >/dev/null 2>&1; then
    OK+=("faster-whisper presente")
  else
    echo "Instalando faster-whisper (pip)..."
    $PY -m pip install --quiet faster-whisper >/dev/null 2>&1
    if $PY -c "import faster_whisper" >/dev/null 2>&1; then
      OK+=("faster-whisper instalado")
    else
      WARN+=("No pude instalar faster-whisper. Ejecuta:  $PY -m pip install faster-whisper")
    fi
  fi
else
  WARN+=("Falta Python 3.10+. Instala:  ${PKG} python3   (y luego: pip install faster-whisper)")
fi

# Resumen
echo ""
echo "----- Resumen -----"
for o in "${OK[@]}";   do echo "  OK    $o"; done
for w in "${WARN[@]}"; do echo "  AVISO $w"; done
echo ""
if [[ ${#WARN[@]} -eq 0 ]]; then
  echo "Todo listo. Ya puedes usar /origen-editor:nuevo <ruta-del-clip>"
else
  echo "Faltan ${#WARN[@]} cosa(s). Resuelve los AVISO de arriba y vuelve a ejecutar /origen-editor:setup"
fi

# 5. Dependencias del motor de export (puppeteer-core)
RENDER_DIR="$(cd "$(dirname "$0")/../render" && pwd)"
if command -v npm >/dev/null 2>&1 && [ -f "$RENDER_DIR/package.json" ]; then
  [ -d "$RENDER_DIR/node_modules/puppeteer-core" ] || (echo "Instalando deps del motor de export (npm)..."; cd "$RENDER_DIR" && npm install --silent >/dev/null 2>&1)
  [ -d "$RENDER_DIR/node_modules/puppeteer-core" ] && echo "  OK   Motor de export listo (puppeteer-core)" || echo "  AVISO  Ejecuta: cd '$RENDER_DIR' && npm install"
fi
