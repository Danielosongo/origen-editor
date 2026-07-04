---
description: De 0 a 100 con un solo comando — coge una toma cruda y encadena TODO sin parar: corte de silencios, transiciones, gráficos, b-roll, SFX, subtítulos, zooms, música de marca y export final.
argument-hint: <ruta-del-clip> [formato]
---

# /origen-editor:auto $ARGUMENTS

Convierte la toma cruda de `$ARGUMENTS` en un **vídeo funcional completo** encadenando las 7 fases
**sin parar entre ellas**. Solo pregunta al principio; después trabaja de un tirón y presenta el
resultado terminado. Si `$ARGUMENTS` viene vacío, pide la ruta del clip y arranca.

## Antes de arrancar (una sola pregunta, si hace falta)

- **Formato:** segundo argumento opcional (`long-form` · `short-explainer` · `tiktok-raw`).
  Si no viene, pregunta UNA vez; por defecto `long-form`.
- A partir de aquí **no vuelvas a parar a preguntar**: usa los valores por defecto de cada skill y
  anota las decisiones en `projects/<job>/auto-log.md` para que el usuario las repase al final.

## La cadena (ejecuta cada skill en orden, sin saltarte ninguna)

1. **Intake** (skill `intake`) — crea `projects/<job>/` y copia el clip a `raw/`.
2. **Rough cut** (skill `rough-cut`) — transcribe palabra a palabra (faster-whisper), corta los
   **silencios reales entre frases** (>0.6s), tomas falsas y muletillas — corta SOLO el vacío, sin
   cercenar palabras — y concatena en `work.mp4` + `cuts.json` + `script.md`.
3. **Transiciones en cada corte + SFX + gráficos con la regla de los 5s** (skill `graficos` — sigue el MÉTODO DEL CANAL de CLAUDE.md):
   - **En cada corte**, transición del CRM **alternando** según el tono de lo que se dice en ese segundo:
     Zoom In/Out → `whoosh`/`pop` · Flash blanco → `boom`/`tick` · Transición vídeo 1 (`bvid`) → `snap`.
   - **REGLA DE LOS 5 SEGUNDOS:** nunca más de 5 s sin estímulo visual (efectos, resaltados, textos
     emergentes, títulos, stickers/emojis). Sonido: texto/título/resaltado → `pop`/`snap`;
     afirmación/positivo → `ding` (CORRECTO); negación/error → `error` (INCORRECTO).
   - **B-roll** en tramos largos (clips del kit o imagen IA ken-burns).
   - **Colocación:** nunca tapar la cara; gráficos abajo/laterales/esquinas superiores.
4. **Subtítulos** (skill `subtitulos`) — **SOLO si el usuario lo pidió**. RAE y **sin ningún signo de
   puntuación** (ni comas ni puntos), palabra a palabra. Si no lo pidió, **sáltate este paso**.
5. **Música de marca** (skill `musica`) — usa por defecto
   `${CLAUDE_PLUGIN_ROOT}/biblioteca/musica/ultimo-bastion-en-auge.mp3` (44s, en bucle con crossfade
   si el vídeo es más largo), **sidechain duck** para no tapar la voz, fundido de entrada/salida.
   Si el usuario pasó su propia canción, usa la suya.
6. **Pase de Claude** — escribe `projects/<job>/editor/claude-pase.js`
   (`window.EF_CLAUDE={clips:[…],markers:[…]}`) con TODO el montaje (gráficos, b-roll, SFX, música,
   transiciones) para que el usuario pulse **"Pase de Claude"** en el editor visual
   (`/origen-editor:editor`) y lo retoque clip a clip sin rehacer nada.
7. **Export** (skill `export`) — render `-w 1`, **remux de audio** (el render sale mudo a menudo)
   → `outputs/<job>.final.mp4` + copia a Descargas.

## Al terminar, presenta SIEMPRE

- La ruta del MP4 final y su duración.
- **Los recortes hechos, con los segundos exactos del vídeo original** (dónde, cuánto y por qué).
- La lista de gráficos/b-roll/SFX colocados (segundo → qué).
- El recordatorio: "ábrelo con `/origen-editor:editor` y pulsa **Pase de Claude** para retocar lo
  que quieras; luego `/origen-editor:exportar` para el render final".

> **Honestidad:** este comando deja un vídeo *funcional* de una pasada. El acabado profesional llega
> con el retoque del usuario en el editor (paso 4 del sistema). No lo vendas como "perfecto sin tocar".
