---
description: Arranca un proyecto nuevo con un clip — crea projects/<job>/, copia el clip a raw/ y hace el intake + rough cut.
argument-hint: <ruta-del-clip>
---

# /origen-editor:nuevo $ARGUMENTS

Arranca un vídeo nuevo a partir del clip en `$ARGUMENTS`.

1. Si `$ARGUMENTS` viene vacío, pide la ruta del clip.
2. Pregunta el **formato** si no está claro: `long-form` (def.) · `short-explainer` · `tiktok-raw`.
3. Ejecuta la skill **intake** (fase 1): elige un `<job>` (slug a partir del nombre del clip), crea `projects/<job>/raw|music|comp/` en el directorio del usuario y **copia** el clip a `raw/` (el original no se toca). Confirma duración y resolución.
4. Encadena la skill **rough-cut** (fase 2): transcribe con `${CLAUDE_PLUGIN_ROOT}/scripts/transcribe.py` (faster-whisper, español), construye `cuts.json` + `script.md` y genera `work.mp4` (corte limpio).
5. Muestra la duración del corte y **para** para que el usuario lo revise. El corte se aprueba ANTES de pasar a gráficos.

Siguiente paso sugerido: `/origen-editor:graficos`.
