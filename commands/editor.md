---
description: Abre el editor visual local (tipo CapCut) en el navegador para mover overlays, recortar clips, subtítulos y sonidos.
---

# /origen-editor:editor

Abre el **editor visual** (un único HTML standalone, en local, sin servidor):

- **Windows:**
  ```powershell
  start "" "${CLAUDE_PLUGIN_ROOT}\editor-visual\index.html"
  ```
- **mac:**
  ```bash
  open "${CLAUDE_PLUGIN_ROOT}/editor-visual/index.html"
  ```
- **Linux:**
  ```bash
  xdg-open "${CLAUDE_PLUGIN_ROOT}/editor-visual/index.html"
  ```

Qué hace el editor:
- **Toggle Render ⇄ Editar:** alterna entre previsualizar el resultado y editar la línea de tiempo.
- **Timeline con pistas:** vídeo, gráficos (overlays), subtítulos y audio.
- **Overlays arrastrables/recortables:** mueve las tarjetas premium, ajusta su entrada/salida, y
  **redimensiona con los tiradores de las esquinas** (tipo CapCut) el clip seleccionado.
- **Subtítulos** karaoke y **sonidos** sobre la pista de audio.
- **Preview en vivo** + inspector; guardar/exportar los cambios.

> Si `${CLAUDE_PLUGIN_ROOT}/editor-visual/index.html` no existe todavía, avisa al usuario: el editor visual se copia en una versión posterior del plugin. Mientras tanto, usa la skill **segundo-pase** para corregir los overlays por instrucción hablada.
