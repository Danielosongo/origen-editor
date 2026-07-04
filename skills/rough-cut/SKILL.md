---
name: rough-cut
description: Fase 2 del Editor Fantasma — de toma cruda a corte limpio (fuera silencios, tomas malas y muletillas) usando transcripción palabra a palabra. Casi automático.
---

# Fase 2 — Rough cut (el corte)

**Objetivo:** de toma cruda a un corte limpio: fuera silencios, tomas malas y muletillas. Casi automático.

1. **Transcribe con timestamps por palabra** (faster-whisper en español; HyperFrames usa whisper-cpp, que normalmente NO está instalado en Windows — por eso usamos faster-whisper):
   ```powershell
   python "${CLAUDE_PLUGIN_ROOT}\scripts\transcribe.py" "projects\<job>\raw\<clip>" --out "projects\<job>" --lang es
   ```
   ```bash
   python "${CLAUDE_PLUGIN_ROOT}/scripts/transcribe.py" "projects/<job>/raw/<clip>" --out "projects/<job>" --lang es
   ```
   Genera `transcript.json` (palabras) y `transcript.srt`. Para subtítulos (fase 5) podrás importarlo: `npx hyperframes transcribe "projects/<job>/transcript.srt"`.
2. **Aplica `${CLAUDE_PLUGIN_ROOT}/plantillas/presets/caption-corrections.json`** al texto (claude→Claude, cloud code→Claude Code, hyperframes→HyperFrames, etc.).
3. **Decide qué se queda.** Lee el transcript y construye `projects/<job>/cuts.json`:
   ```json
   [ { "start": 2.10, "end": 9.80, "text": "..." }, { "start": 12.4, "end": 20.0, "text": "..." } ]
   ```
   Criterio: quita silencios largos (>0.6s), repeticiones, tomas falsas, "eeeh/mmm". Deja respiración natural (~0.15s) al inicio/fin de cada segmento. Si dudas, **conserva**.
4. **Escribe `script.md`** = el guion final que resulta del corte (texto de los segmentos que se quedan, en orden). Es el guion del vídeo y la base de los gráficos.
5. **Construye `rough.mp4` / `work.mp4`** concatenando los segmentos elegidos con ffmpeg (reencode para cortes exactos por keyframes):
   ```powershell
   # genera el filtro a partir de cuts.json (un trim+concat por segmento)
   ffmpeg -i raw\clip.mp4 -vf "select='between(t,A,B)+between(t,C,D)...',setpts=N/FRAME_RATE/TB" `
     -af "aselect='between(t,A,B)+between(t,C,D)...',asetpts=N/SR/TB" projects\<job>\work.mp4
   ```
6. **Reporta SIEMPRE los cortes en segundos (obligatorio).** Al terminar, dile al usuario exactamente qué quitaste, en una lista o tabla: cada corte como **`inicio → fin (−duración, motivo)`** en tiempo del vídeo ORIGINAL, el **total de segundos eliminados**, la **duración final**, y opcionalmente los trozos que se quedan. Ejemplo: `Corté 10.06s → 11.17s (−1.11s, silencio)`. Nunca hagas los cortes "a ciegas": el usuario quiere verlos para revisarlos/ajustarlos.
7. Si pide ajustes ("deja más aire antes de esta frase", "te dejaste una palabra"), edita `cuts.json` y rehaz solo el corte.

> ⚠️ **No cercenes palabras.** `silencedetect` incluye las colas suaves de las palabras; si cortas ese rango entero te comes el final/inicio de las palabras vecinas. Mira los `word.end`/`word.start` reales alrededor del silencio y corta solo desde `fin_palabra_previa+~0.10` hasta `inicio_palabra_siguiente-~0.10`.

**Cierre obligatorio (regla de oro de retención del sistema):** el corte se aprueba ANTES de pasar a gráficos. No avances sin OK. Si cambias el corte después, hay que rehacer lo que va encima.

**Salida:** `transcript.json`, `cuts.json`, `script.md`, `work.mp4` (rough).
