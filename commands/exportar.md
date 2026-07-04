---
description: Exporta el entregable final — remux del audio (arregla el render mudo) y copia a outputs/ y Descargas.
argument-hint: [job]
---

# /origen-editor:exportar $ARGUMENTS

Genera el **entregable final** con audio.

1. Identifica el `<job>` (de `$ARGUMENTS` o del proyecto activo).
2. Ejecuta la skill **export** (fase 7): comprueba si `work.mp4` tiene audio y, si no, **remuxea** el audio del clip de `raw/` (el render de HyperFrames sale mudo a menudo). Copia el resultado a `outputs/<job>.final.mp4` y a la carpeta de Descargas del usuario.
3. Confirma duración/peso del final y la ruta. Conserva `projects/<job>/` intacto para reeditar.

**Salida:** `outputs/<job>.final.mp4` (+ copia en Descargas).
