---
description: Añade subtítulos karaoke quemados (solo formato vertical/corto), reutilizando la transcripción de la fase 2.
argument-hint: [job]
---

# /origen-editor:subtitulos $ARGUMENTS

Añade **subtítulos karaoke** on-beat (palabra a palabra).

1. Identifica el `<job>` (de `$ARGUMENTS` o del proyecto activo). Comprueba el formato: solo aplica a `short-explainer` y `tiktok-raw`. En `long-form` se usan los CC de YouTube → avisa y omite.
2. Ejecuta la skill **subtitulos** (fase 5): reutiliza `projects/<job>/transcript.json` (no re-transcribas), aplica `${CLAUDE_PLUGIN_ROOT}/plantillas/presets/captions-style.json` y `caption-corrections.json`, y rellena los bloques de karaoke de la composición.
3. Render incremental con `-w 1` y `HYPERFRAMES_BROWSER_PATH`.

Posición: `short-explainer` = centro · `tiktok-raw` = bajo la cara.
