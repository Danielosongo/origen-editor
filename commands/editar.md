---
description: Edición guiada PASO A PASO con confirmación en cada etapa — jump cuts + reporte de cortes, subtítulos bajo demanda (RAE, sin puntuación), transiciones+SFX por corte y regla de los 5s. A diferencia de `auto`, este flujo SE DETIENE y espera tu confirmación.
argument-hint: <ruta-del-clip>
---

# /origen-editor:editar $ARGUMENTS

Actúa como **editor de vídeo experto**. Sigue este flujo **secuencial**, **deteniéndote a esperar
confirmación del usuario en cada etapa marcada**. No te adelantes ni encadenes pasos sin permiso.
(Este es el modo guiado; para hacerlo todo de un tirón sin parar, usa `auto`.)

Sonidos = archivos reales del CRM (`${CLAUDE_PLUGIN_ROOT}/editor-visual/sfx/`). Nombre del usuario → clave:
`WOOSH`=whoosh · `POP`=pop · `IMPACTO`=boom · `CLICK`=tick · `CHASQUIDO`=snap · `CORRECTO`=ding · `INCORRECTO`=error.

---

## PASO 1 — Limpieza de audio y REPORTE de cortes (jump cuts)
1. Analiza el vídeo/audio que te dé el usuario (transcribe palabra a palabra si hace falta).
2. Identifica y elimina **todos** los silencios vacíos, muletillas y pausas.
3. **ENTREGABLE OBLIGATORIO antes de nada más:** un reporte preciso y profesional con la **lista de
   los segundos exactos** de cada corte, con el formato `[MM:SS - MM:SS] → motivo`
   (ej. `[00:12 - 00:14] → Silencio eliminado`). Referencia SIEMPRE los segundos del vídeo original.
4. Al final del reporte, haz **exactamente** esta pregunta:
   > **"¿Deseas que añadamos subtítulos a este video? (Sí/No)"**
5. **DETENTE AQUÍ** y espera la respuesta. No sigas al Paso 2/3.

---

## PASO 2 — Subtítulos (bajo demanda)
- Respuesta **NO** → salta directo al **Paso 3**.
- Respuesta **SÍ** → genera subtítulos con estilo **estricto**:
  - Ortografía **RAE** en las palabras.
  - **PROHIBIDO cualquier signo de puntuación** (ni comas, ni puntos, ni suspensivos, ni `¿¡?!;:`).
  - **Palabra por palabra o frases ultracortas**, al ritmo del habla.

---

## PASO 3 — Transiciones en los cortes + SFX
En **cada corte**, aplica de forma **alterna** una transición del CRM con su sonido, **interpretando el
contexto** de lo que se dice en ese segundo para elegir la mejor combinación:
- **Zoom In / Zoom Out** (`kind:"vfx",vfxKind:"zoompunch"`) → `WOOSH` o `POP`.
- **Flash blanco** (`kind:"trans",transKind:"flash"`) → `IMPACTO` o `CLICK`.
- **Transición vídeo 1** (`kind:"bvid"`) → `CHASQUIDO`.

---

## PASO 4 — Ritmo dinámico y elementos visuales (REGLA DE LOS 5 SEGUNDOS)
- **Regla de oro:** prohibido que pasen más de **5 s** sin un estímulo visual en pantalla.
- Inserta, según lo que se habla: efectos de vídeo, resaltados de color, textos emergentes y títulos.
- **Sonido de cada elemento, según el contexto:**
  - Texto / título / resaltado que aparece → `POP` o `CHASQUIDO`.
  - Afirmación / acierto / dato positivo → `CORRECTO`.
  - Negación / error / dato negativo → `INCORRECTO`.

---

Al terminar, deja el montaje en el **Pase de Claude** (`projects/<job>/editor/claude-pase.js`) para que
el usuario lo abra en el editor visual (`/origen-editor:editor`), lo retoque y exporte.
