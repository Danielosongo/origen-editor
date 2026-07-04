---
description: Comprueba e instala el entorno del Editor Fantasma (Node + HyperFrames, ffmpeg/ffprobe, Chrome, Python + faster-whisper).
---

# /origen-editor:setup

Deja el motor listo. Ejecuta el script de setup según el sistema operativo del usuario:

- **Windows (PowerShell):**
  ```powershell
  & "${CLAUDE_PLUGIN_ROOT}\scripts\setup.ps1"
  ```
- **mac / Linux (bash):**
  ```bash
  bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup.sh"
  ```

El script comprueba e instala/avisa de:
1. **Node + npx** y que **HyperFrames** se ejecuta (`npx hyperframes --version` / `doctor`).
2. **ffmpeg** y **ffprobe** en el PATH (con pista de instalación: `winget` / `brew` si faltan).
3. **Chrome** del sistema → recuerda configurar `HYPERFRAMES_BROWSER_PATH` (en Windows, típicamente `C:\Program Files\Google\Chrome\Application\chrome.exe`).
4. **Python + faster-whisper** (`pip install faster-whisper`) para la transcripción (whisper-cpp NO hace falta).

Al terminar, el script imprime un resumen claro: `✅ Todo listo` o `⚠️ Falta X`. Lee la salida y, si algo falta, indícale al usuario el comando concreto para arreglarlo. No falla en bloque si un check opcional falla.
