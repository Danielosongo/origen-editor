---
name: subtitulos
description: Fase 5 del Editor Fantasma — subtítulos karaoke SOLO bajo demanda; ortografía RAE, SIN puntuación, palabra a palabra.
---

# Fase 5 — Subtítulos · **SOLO BAJO DEMANDA**

**Actívate solo si el usuario lo pide explícitamente.** Objetivo: subtítulos karaoke palabra a palabra, sincronizados al habla.

**Estilo ESTRICTO (regla fija del canal):**
- Ortografía **RAE** en las palabras (mayúsculas/minúsculas correctas; nombres propios y siglas como toca).
- **PROHIBIDO cualquier signo de puntuación**: ni comas, ni puntos, ni puntos suspensivos, ni `¿¡?!` ni `;:`. Quítalos de cada palabra.
- **Palabra por palabra o frases muy cortas** (máx. ~4 palabras por tarjeta), alineadas con el ritmo del habla.

En vertical/corto se queman; en `long-form` puedes dejar los CC de YouTube salvo que el usuario pida subtítulos quemados.

1. Usa la skill **embedded-captions** (HyperFrames) con `${CLAUDE_PLUGIN_ROOT}/plantillas/presets/captions-style.json` (identidad por defecto `anchor`; mayúsculas, máx. 4 palabras por tarjeta, resaltado amarillo).
2. **No re-transcribas:** reutiliza `projects/<job>/transcript.json` de la fase 2. Las palabras aparecen a la vez que se dicen.
3. Posición según preset: `short-explainer` = centro · `tiktok-raw` = bajo la cara.
4. Aplica `${CLAUDE_PLUGIN_ROOT}/plantillas/presets/caption-corrections.json` (marca/ortografía) antes de quemar.
5. La plantilla `${CLAUDE_PLUGIN_ROOT}/plantillas/comp/index.html` ya trae los bloques `CAPS-HTML`/`CAPS-CSS`/`CAPS-JS` del karaoke: rellénalos con tus palabras y tiempos, no inventes la estructura.
6. Render incremental como en la fase 4 (`-w 1`, `HYPERFRAMES_BROWSER_PATH`).

**Salida:** `work.mp4` con subtítulos.
