---
name: graficos
description: Fase 3 del Editor Fantasma (format-specific) — primer pase de gráficos premium (un overlay por segmento) sobre el rough cut, con la composición HyperFrames.
---

# Fase 3 — Gráficos (primer pase) · *format-specific*

**Objetivo:** un gráfico por segmento del vídeo sobre el rough cut. Usa la skill **graphic-overlays** (HyperFrames).

1. Carga el **preset de gráficos** del formato (en `${CLAUDE_PLUGIN_ROOT}/plantillas/presets/`):
   - long-form → `signature-style.json`
   - short-explainer → `short-explainer-style.json`
   - tiktok-raw → `tiktok-raw-style.json`
2. Parte de la **plantilla premium** `${CLAUDE_PLUGIN_ROOT}/plantillas/comp/index.html` (cristal líquido, blur-in, sheen, punch-ins, subtítulos karaoke). Cópiala a `projects/<job>/comp/index.html` y rellena textos/tiempos a partir de `script.md`. NO uses los textos/tiempos de ejemplo de la plantilla.
   - **ULTRA PRO:** para escenas a pantalla completa (título de capítulo, lista, dato gigante, cita, cierre/CTA), imágenes ken-burns y texto máquina-de-escribir, copia los bloques de `${CLAUDE_PLUGIN_ROOT}/plantillas/comp/escenas-ultra.html`. Úsalas por defecto para abrir secciones y cerrar el vídeo — es el nivel de la casa.
   - **Si Daniel editó en el editor visual** (exportó `proyecto-editor-fantasma.json` + media): la fuente de verdad es ese JSON. Tradúcelo campo a campo con `${CLAUDE_PLUGIN_ROOT}/MAPEO-RENDER.md` (media exportados → `comp/media/`). El render debe salir IGUAL que su preview.
3. **Planifica beats:** recorre `script.md` y marca dónde va cada gráfico (título de sección, lower-third con nombre/idea, callout de dato, b-roll/zoom, número grande). **Una idea por gráfico.**
4. **Construye la composición** HyperFrames en `projects/<job>/comp/` con el rough cut (`work.mp4`) como pista base (`<video src="input-video.mp4">`) y las tarjetas sincronizadas por timestamp. Respeta paleta, fuentes y motion del preset. Carga las fuentes web por CDN (p. ej. jsDelivr) — HyperFrames no las trae de serie.
5. **Render de trabajo** (un worker, RAM justa). Apunta HyperFrames a tu Chrome del sistema:
   ```powershell
   $env:HYPERFRAMES_BROWSER_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
   npx hyperframes lint projects\<job>\comp
   npx hyperframes render projects\<job>\comp -o projects\<job>\work.mp4 -w 1
   ```
   ```bash
   export HYPERFRAMES_BROWSER_PATH="/usr/bin/google-chrome"   # o la ruta de tu Chrome
   npx hyperframes lint projects/<job>/comp
   npx hyperframes render projects/<job>/comp -o projects/<job>/work.mp4 -w 1
   ```
   > El render puede salir **mudo**: se arregla con remux de audio en la fase 7 (export).
6. Antes de re-renderizar entero, verifica layout con `npx hyperframes snapshot projects/<job>/comp`.

**Colocación (regla fija):** nunca pongas un gráfico en el centro tapando la cara/los ojos. Va abajo, a los lados o en las esquinas de arriba, idealmente donde señala la mano.

**Honestidad:** este primer pase es "del montón". La calidad llega en la fase 4 (manual). No lo vendas como final.

**Salida:** `comp/` + `work.mp4` con gráficos (primer pase).

## Método de edición del canal (reglas FIJAS — ver CLAUDE.md)

Aplica SIEMPRE el método del canal. Sonidos (clave real del CRM entre paréntesis): `WOOSH`(whoosh) · `POP`(pop) · `IMPACTO`(boom) · `CLICK`(tick) · `CHASQUIDO`(snap) · `CORRECTO`(ding) · `INCORRECTO`(error).

**A. Transiciones en CADA corte + su SFX (alternando, según el tono de lo que se dice en ese segundo):**
- **Zoom In/Out** (`kind:"vfx",vfxKind:"zoompunch"`) → `sfx:"whoosh"` o `"pop"`.
- **Flash blanco** (`kind:"trans",transKind:"flash"`) → `sfx:"boom"` o `"tick"`.
- **Transición vídeo 1** (`kind:"bvid"`, clip del CRM) → `sfx:"snap"`.

**B. REGLA DE LOS 5 SEGUNDOS:** prohibido pasar más de 5 s sin estímulo visual. Mete efectos, resaltados de color, textos emergentes, títulos, stickers/emojis según el contexto. Sonido de cada elemento:
- Texto / título / resaltado que aparece → `sfx:"pop"` o `"snap"`.
- Afirmación / dato positivo / acierto → `sfx:"ding"` (CORRECTO).
- Negación / error / dato negativo → `sfx:"error"` (INCORRECTO).

**C. Subtítulos:** SOLO si el usuario los pide; RAE y **sin ningún signo de puntuación** (ver skill `subtitulos`).

## Detalles del primer pase (nivel de la casa)

1. **Zoom-punch en golpes de frase:** en palabras con énfasis (números, exclamaciones, "mira/ojo/brutal/gratis/clave/error/secreto…") coloca `kind:"vfx", vfxKind:"zoompunch"` (dur ~1.1s), mínimo 4s entre zooms. Mismo motor que el botón **Ritmo** del editor.
2. **Colocación consciente de la cara:** detecta en qué lado sale Daniel y coloca los gráficos en el lado libre (nunca tapando cara/ojos). En el editor, Ajustes ⚙ → "¿Dónde sales tú?".
3. **B-roll en tramos largos:** si un tramo pasa de ~12-15s sin gráfico, mete b-roll (clips del kit `kind:"bvid"` o imagen IA `kind:"image"` ken-burns).
4. **Pausa de subtítulos con cada escena:** toda escena full-screen lleva su `kind:"capmute"` con el mismo start/dur.
5. **On-beat si hay música:** `beats.js` (`npx hyperframes beats`) y cuadra las entradas a los golpes.

## El PASE DE CLAUDE (Claude monta dentro del editor de Daniel)

Al terminar el primer pase, ADEMÁS de la composición, escribe `projects/<job>/editor/claude-pase.js`:

```js
window.EF_CLAUDE={
  ts:"<fecha ISO>",
  keepCaptions:true,               // conservar los subtítulos que ya tenga Daniel
  clips:[ /* overlays type:"ov" con los MISMOS campos del editor (kind,track,start,dur,x,y,color,title,sfx,vfxKind,kf,…) */ ],
  markers:[ /* opcional: {t,txt} con sugerencias */ ]
};
```

Daniel abre su editor, pulsa **"Pase de Claude"** y aparece todo tu montaje editable en su timeline. Sus retoques vuelven por el export normal. Al leer `montaje-*.txt` respeta SIEMPRE: `NOTAS DEL DIRECTOR`, `PAUSAS DE SUBTÍTULOS` y `ÓRDENES PARA CLAUDE` (aplicarlas una a una).
