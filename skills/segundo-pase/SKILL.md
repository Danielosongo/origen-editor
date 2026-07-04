---
name: segundo-pase
description: Fase 4 del Editor Fantasma (MANUAL) — el usuario dirige gráfico a gráfico y tú re-renderizas SOLO lo que cambió. Aquí está el 90% de la calidad.
---

# Fase 4 — Segundo pase (MANUAL) · aquí está el 90% de la calidad

**Objetivo:** el usuario dirige gráfico a gráfico. Tú ejecutas y **re-renderizas solo lo que cambió**.

Esta fase es manual a propósito. Es lo que separa "IA cutre" de "profesional". No la automatices ni la saltes.

1. El usuario da órdenes en lenguaje natural: *"este gráfico bájalo, me tapa la cara"*, *"ponme el logo de Claude aquí"*, *"esto hazlo un diagrama"*, *"empieza el zoom un poco antes"*.
2. Edita **SOLO** la(s) tarjeta(s)/sub-composición afectada(s) en `projects/<job>/comp/`.
3. **Re-render incremental:** renderiza solo el segmento/sub-composición tocada, no el vídeo entero.
   - Estructura los gráficos como **sub-composiciones** para poder renderizar una sola.
   - Verifica con `npx hyperframes snapshot projects/<job>/comp` antes de un render completo.
   - Recuerda `-w 1` y el `HYPERFRAMES_BROWSER_PATH` (Chrome del sistema).
4. Enseña el resultado y repite hasta el OK. Itera rápido: cambio → draft → cambio → draft.

> Alternativa visual: el usuario puede abrir el **editor visual** (`/origen-editor:editor`) para mover, recortar y previsualizar los overlays tipo CapCut, y luego tú aplicas los cambios a la composición.

**Regla:** nunca re-renderices el vídeo completo por un cambio local. Eso ahorra el grueso del tiempo.

**Salida:** `work.mp4` aprobado por el usuario.
