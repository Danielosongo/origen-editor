---
description: Construye la composición HyperFrames con gráficos premium (overlays) sobre el rough cut — primer pase.
argument-hint: [job]
---

# /origen-editor:graficos $ARGUMENTS

Genera los **gráficos** (overlays premium) sobre el rough cut aprobado.

1. Identifica el `<job>` (de `$ARGUMENTS` o del proyecto activo en `projects/`). Asegúrate de que el **corte está aprobado** (fase 2 cerrada).
2. Ejecuta la skill **graficos** (fase 3): carga el preset del formato desde `${CLAUDE_PLUGIN_ROOT}/plantillas/presets/`, parte de la plantilla `${CLAUDE_PLUGIN_ROOT}/plantillas/comp/index.html`, planifica un gráfico por segmento de `script.md` y construye la composición en `projects/<job>/comp/`.
3. Renderiza el draft con `-w 1` y `HYPERFRAMES_BROWSER_PATH` apuntando a Chrome.

Este es el primer pase ("del montón"). La calidad real llega en el **segundo pase** (manual): usa `/origen-editor:editor` o corrige hablando (skill **segundo-pase**), y re-renderiza solo lo que cambie.
