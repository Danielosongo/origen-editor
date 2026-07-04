---
name: export
description: Fase 7 del Editor Fantasma — entregable final con audio (remux del render mudo) y copia a outputs/ y Descargas, conservando el proyecto.
---

# Fase 7 — Export

**Objetivo:** entregable final, con audio (no mudo), sin destruir el proyecto.

## Vía CRM → vídeo final con TODO (edición + sonidos + transiciones + subtítulos), MISMA CALIDAD y SONIDO

Cuando el montaje viene del **editor visual (CRM)** — Daniel pulsó **Exportar** y bajó `proyecto-editor-fantasma.json` — el vídeo final se hace con **un solo comando**:

```bash
node "${CLAUDE_PLUGIN_ROOT}/render/exportar.mjs" "<proyecto-editor-fantasma.json>" "<video-original>" "<salida.mp4>"
```

**Render de PARIDAD (clave):** el motor **captura el monitor del CRM entero fotograma a fotograma** — vídeo + transiciones + zoom + animaciones + subtítulos + b-roll, todo junto — en vez de recomponer por capas. Es **literalmente tu preview grabado**, así que sale **idéntico** a como quedó en el CRM (mismo diseño, mismos efectos, **en el mismo segundo**). Qué hace, en orden:
1. **Transcodifica el original a H.264** conservando resolución/calidad (el navegador NO decodifica HEVC; ffmpeg sí). Esa es la base que pinta el CRM.
2. **`render3.js`**: abre el CRM con el proyecto, y por cada frame hace `video.currentTime=t` + `renderOverlays()` (que ya transforma el vídeo con el zoom/flash y hace seek del b-roll, seek-safe) y captura el monitor. Sin recomposición → sin transiciones/sonidos perdidos.
3. **`mix-sfx.js`**: deriva los SFX de cada clip (`c.sfx`→archivo real de `editor-visual/sfx/`, en `c.start`, a `c.sfxVol`), los mezcla en estéreo a su nivel y **remuxa el audio original** → mismo sonido.

> **Por qué antes fallaba:** el motor viejo montaba vídeo y efectos por separado y "pegaba" solo algunos → se perdían transiciones (whip/zoom/fundido) y sonidos. El render de paridad lo elimina de raíz: no hay capas que puedan desincronizarse.

> **Honestidad técnica:** el CRM (navegador) **no puede** producir por sí mismo el MP4 con audio (no decodifica HEVC ni codifica frame-a-frame). Su "Exportar" saca el **proyecto**; este comando lo convierte en el **vídeo final**. El watcher `${CLAUDE_PLUGIN_ROOT}/scripts/watch-exports.mjs` puede lanzarlo solo en cuanto Daniel exporte, dejando el MP4 en Descargas. Necesita el **vídeo original** (de ahí salen calidad y audio; el proyecto no lleva el vídeo dentro).

## Vía HyperFrames (composición propia)

1. **Remux de audio (arregla el render mudo).** HyperFrames a veces saca el MP4 sin pista de audio. Comprueba si `work.mp4` tiene audio y, si no, pégale el audio del clip de trabajo (el de `raw/`):
   ```powershell
   # Windows
   New-Item -ItemType Directory -Force -Path "outputs" | Out-Null
   $hasAudio = (& ffmpeg -i "projects\<job>\work.mp4" 2>&1 | Select-String "Audio:") -ne $null
   if ($hasAudio) {
     Copy-Item "projects\<job>\work.mp4" "outputs\<job>.final.mp4" -Force
   } else {
     ffmpeg -y -i "projects\<job>\work.mp4" -i "projects\<job>\raw\<clip>" `
       -c:v copy -map 0:v:0 -map 1:a:0 -shortest "outputs\<job>.final.mp4"
   }
   Copy-Item "outputs\<job>.final.mp4" "$env:USERPROFILE\Downloads\<job>.final.mp4" -Force
   ```
   ```bash
   # mac/Linux
   mkdir -p outputs
   if ffmpeg -i "projects/<job>/work.mp4" 2>&1 | grep -q "Audio:"; then
     cp "projects/<job>/work.mp4" "outputs/<job>.final.mp4"
   else
     ffmpeg -y -i "projects/<job>/work.mp4" -i "projects/<job>/raw/<clip>" \
       -c:v copy -map 0:v:0 -map 1:a:0 -shortest "outputs/<job>.final.mp4"
   fi
   cp "outputs/<job>.final.mp4" "$HOME/Downloads/<job>.final.mp4"
   ```
2. Confirma **duración/peso** del final y avisa de la ruta (`outputs/<job>.final.mp4` + copia en Descargas).
3. Conserva `projects/<job>/` **intacto** para reeditar mañana. (Opcional: borra los `work*.mp4` intermedios para liberar disco, sin tocar `raw/`, `comp/` ni el final.)

**Salida:** `outputs/<job>.final.mp4` (+ copia en Descargas).
