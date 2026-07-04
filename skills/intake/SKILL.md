---
name: intake
description: Fase 1 del Editor Fantasma — crea el job y deja el clip crudo en su sitio (projects/<job>/raw/). Trivial.
---

# Fase 1 — Intake

**Objetivo:** crear el job y dejar el clip crudo en su sitio. Trivial.

Las carpetas de trabajo (`projects/<job>/`) viven en el **directorio del usuario** (su cwd), no dentro del plugin.
Los assets del plugin (presets, plantillas, scripts) viven en `${CLAUDE_PLUGIN_ROOT}`.

1. Pide la **ruta del clip** si no la tienes.
2. Pregunta el **formato** si no está claro: `long-form` (def.) · `short-explainer` · `tiktok-raw`.
3. Crea la estructura y copia el clip (no muevas el original; cópialo):
   ```powershell
   # Windows
   $job = "<slug>"
   New-Item -ItemType Directory -Force -Path "projects\$job\raw","projects\$job\music","projects\$job\comp" | Out-Null
   Copy-Item "C:\ruta\al\clip.mp4" "projects\$job\raw\" -Force
   '{ "job": "<slug>", "format": "long-form" }' | Out-File -Encoding utf8 "projects\$job\job.json"
   ```
   ```bash
   # mac/Linux
   job="<slug>"
   mkdir -p "projects/$job/raw" "projects/$job/music" "projects/$job/comp"
   cp "/ruta/al/clip.mp4" "projects/$job/raw/"
   printf '{ "job": "%s", "format": "long-form" }\n' "$job" > "projects/$job/job.json"
   ```
4. Confirma **duración y resolución** del clip (`ffprobe -v error -show_entries format=duration -show_entries stream=width,height "projects/<job>/raw/<clip>"` o `ffmpeg -i ...`) y **para**. No sigas al corte hasta que el usuario lo pida.

**Salida:** `projects/<job>/raw/<clip>` listo. El clip crudo **NO se modifica nunca**.
