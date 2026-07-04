# MAPEO-RENDER — del editor visual al render HyperFrames

> Fase 3/4 del pipeline. Entrada: `proyecto-editor-fantasma.json` + media exportados
> (`m*.png/.jpg`, `music-bg.mp3` → van a `comp/media/`). Salida: `comp/index.html` que
> renderiza EXACTAMENTE lo que Daniel ve en el editor.
> Plantillas fuente: `plantillas/comp/index.html` (cajas clásicas) y
> `plantillas/comp/escenas-ultra.html` (escenas full-screen, imagen ken-burns, typewriter).

## Regla general

Cada clip del JSON con `type:"ov"` → un `.card-host clip` (o `.scene-host`/`.img-host`) con
`data-start="{start}" data-duration="{dur}"`, posicionado en `left:{x}px;top:{y}px` (stage 1920×1080)
y animado en el timeline GSAP pausado (`window.__timelines`).

## Campos comunes (todos los kinds)

| Campo editor | En el render |
|---|---|
| `start` / `dur` | `data-start` / `data-duration` + tiempos del timeline GSAP |
| `x`,`y` (px stage) | `left/top` del host (las escenas y fullscreen ignoran x/y: cubren el stage) |
| `scale` | multiplicador del tamaño base de la tarjeta |
| `op` (opacidad final; el deslizador del editor es transparencia = 1−op) | multiplica la opacity máxima del host en TODAS las animaciones |
| `color` (acento; puede ser HEX libre) | acento del gradiente/glow de la tarjeta |
| `bg` / `fg` | background del panel / color del texto (vacío = cristal / automático) |
| `pillColor` | background de `.pillc`/botones internos |
| `hlColor` | color de la palabra destacada del karaoke (default `#FFD400`) |
| `font` (`sora|inter|gabarito|mono`) | `font-family` del panel (default: Gabarito display) |
| `fontMul` | multiplica el `font-size` del contenido |
| `radius` | `border-radius` del panel (px) |
| `glow` (0–2) | intensidad de la capa `0 0 34px var(--acc)` del box-shadow (0 = sin glow) |
| `motion` | movimiento sostenido: driftR/L/U/D, zoomIn/Out, float, pulse, shake, orbit, heartbeat → tween `ease:'none'` de x/y/scale durante todo el clip |
| `enter` / `exit` (`auto|slide|zoom|blur|flip|typewriter|none`) | animación de entrada/salida; `auto` = blur-in + back.out (la clásica de la plantilla) |
| `sfx` + `sfxVol` | evento de audio en el mix (fase 6/7): usar los MISMOS archivos `editor-visual/sfx/*.mp3` — pop/swoosh/click/correcto/impacto/chasquido/error; riser/shimmer se sintetizan o se omiten |

## Kinds clásicos (plantilla `index.html`)

lower→A · stat/counter/ring→B · hero→C · toast→D · resto (badge, chart, strip, list, vs,
stars, subscribe, keys, terminal, spotlight, arrow, marker, quote, handle, text, ztext):
misma receta glass + blur-in + sheen; el contenido sale de `eyebrow/title/sub/big/pill`.
Subtítulos (`kind:"caption"` con `words:[[palabra,t0,t1],…]`) → bloques CAPS-HTML/CAPS-JS
con los tiempos ABSOLUTOS del JSON. **Casing RAE ya viene aplicado en el editor: copiar el texto tal cual.**

## Kinds nuevos (plantilla `escenas-ultra.html`)

### `kind:"scene"` → bloque `#sc-{sceneKind}`

| Campo | En el render |
|---|---|
| `sceneKind` | `chapter` (título palabra a palabra) · `list` (ítems + check back.out) · `bigstat` (count-up con separador de miles) · `quote` (comillas + líneas) · `cta` (botón suscríbete con doble rebote) |
| `lines[]` | los hijos de `.scene-inner`, EN ORDEN (línea 0 = título/número/frase principal) |
| `stagger` | separación entre líneas en el helper `scene(host,start,dur,stagger)` |
| `bgMode` | `grad` → `.scene-bg.grad` · `color` → background = `bg` · `image` → `<img src="media/{mediaId}.png">` · `blurvideo` → clon del `<video>` con `blur(16px) brightness(.5)` |
| `mediaId` | archivo `comp/media/{mediaId}.png/.jpg` |

### `kind:"image"` → bloque `#img-kb`

| Campo | En el render |
|---|---|
| `mediaId` | `<img src="media/{mediaId}.png">` |
| `fullscreen` | true → host 1920×1080; false → host en x/y con w×h del clip |
| `imgMotion` | `kenburns` → `scale 1→1.08 + x −24, ease:'none'` · `driftL/R` → solo x ∓24 · `fade` → solo opacity · `none` → estática |

### `kind:"bvid"` — b-roll del kit (vídeo stock de `biblioteca/broll/`)

| Campo | En el render |
|---|---|
| `src` | ruta relativa dentro de `biblioteca/` (p. ej. `broll/291641_medium.mp4`) → copia el archivo a `comp/media/` y usa `<video muted loop>` |
| `fullscreen` | igual que en `kind:"image"` |
| tiempo | arranca en su `start` y va en bucle hasta su fin; mismo encuadre y esquinas redondeadas que una imagen |

En preview el editor lo sincroniza seek-safe; en render el `<video>` va con `data-start`/`data-duration` del clip.

### `enter:"typewriter"` (kinds text/ztext) → bloque `#type-a`

Tween de progreso 0→1 (~0.9s, `ease:'none'`) que recorta `title` por caracteres + cursor `▌`.

### `enter:"words"` (kinds text/ztext) — palabra a palabra

Como typewriter pero por PALABRAS: progreso 0→1 en ~0.9s revela `title.split(/\s+/)` acumulado (sin cursor). En GSAP: spans por palabra con stagger uniforme que cubra los 0.9s.

### `fx:"confetti"` — celebración (subscribe, escena cta, o cualquier caja que lo lleve)

Ráfaga de confeti DETERMINISTA sobre la caja: ~46 partículas, colores de marca (#3B6BFF/#3FE0F0/#FF7A1A/#8B5CFF/#2FD98A/#FFD400), lanzadas en los primeros 0.5s con vida 1.5–2.4s, gravedad parabólica, rotación y fade. En el render: réplica GSAP con seed fija (nunca `Math.random()` por frame). En escenas cubre todo el stage; en cajas, un área ~380×300 px centrada sobre la caja (subida un 8%).

### `kind:"marker"` — el subrayado se PINTA con el tiempo

En el editor `--mkp` = easeOutCubic((t−start−0.08)/0.55) como `scaleX` del subrayado (origen izquierda). En el render: tween `scaleX 0→1`, 0.55s, delay 0.08s, `power3.out`.

### Fondos de escena VIVOS + grano

Todo `.sbg` deriva durante el clip: `scale 1.06→1.11` + `x 0→−12px` + vaivén vertical suave (progreso del clip, seek-safe). Encima, capa de grano (`feTurbulence` SVG, opacidad .06, tile 160px). En el render: mismo tween + mismo data-URI de grano.

### Marcadores del director (`state.markers[]`)

`montaje.txt` incluye `NOTAS DEL DIRECTOR (marcadores del timeline)` con `mm:ss.s  nota`. NO se renderizan: son órdenes de Daniel para el paso 4 — leerlas SIEMPRE antes de construir gráficos y aplicarlas como correcciones.

### `kind:"vfx"` — efectos sobre la ESCENA PRINCIPAL

| `vfxKind` | En el render (sobre el plano del vídeo, no sobre una caja) |
|---|---|
| `zoompunch` | zoom del vídeo `scale 1→1+0.16·vfxAmt` con ataque 0.22s (`power3.out`), sujeción, y salida 0.32s; `transform-origin` = (x/1920·100)% (y/1080·100)% del clip — el punto donde Daniel dejó la mirilla |
| `shake` | jitter determinista `x=sin(p·57)·7·decay·vfxAmt`, `y=cos(p·49)·5·decay·vfxAmt` con decay lineal a 0 al final del clip |
| `flash` | capa blanca full-frame, opacidad `0.92·vfxAmt→0` en el 80% de la duración |
| `confetti` | drawConfetti a pantalla completa (misma función determinista del editor) |
| `fireworks` | 5 explosiones escalonadas ×26 chispas, colores de marca, gravedad, fade (seed = id del clip) |
| `sparkles` | 34 destellos de 4 puntas titilando (`sin(t·vel+fase)²`), blancos y cian |

`vfxAmt` (0.4–2) = intensidad. Todos son deterministas: nunca `Math.random()` por frame.

### Subtítulos: los 8 tipos (`capStyle`)

`classic` (palabra en `hlColor`) · `box` (caja `hlColor` detrás de la palabra) · `pop` (escala 1.18) · `thick` (borde 3.6px) · `grad` (degradado amarillo→naranja) · **`neon`** (sin caja, glow cian/azul; palabra activa brilla en `hlColor`) · **`clean`** (sin caja, solo contorno oscuro 2.2px) · **`shadow`** (sombra dura 3px 3px + suave). El editor puede propagar el estilo de un subtítulo a todos (botón "Aplicar a TODOS"); el render usa los valores por clip del JSON, que ya vienen igualados.

### `kind:"capmute"` — pausa de subtítulos

Clip en S1 que OCULTA los subtítulos mientras dura (para escenas grandes, gráficos full-screen…). En el render: **no quemar ningún subtítulo dentro de sus tramos** (recortar el subtítulo si solo solapa en parte). `montaje.txt` los lista en "PAUSAS DE SUBTÍTULOS".

### `trans` — transición al empezar un trozo de vídeo

Campo del CLIP DE VÍDEO (no de una caja). Se aplica 0.45s al ENTRAR el trozo (en el primer trozo no hace nada): `flash` (blanco 1→0) · `whip` (barrido: x 120→0 + blur 14→0) · `zoom` (scale 1.22→1) · `fade` (brightness 0.05→1). En el render, replicar sobre el plano de vídeo con `power3.out`; para un crossfade real entre ambos trozos, el render puede mejorarlo solapando 0.3s.

### SFX `rafaga` — ráfaga de fotos

`sfx/rafaga.mp3` (obturador de cámara). Disponible como sonido de entrada de cualquier caja; ideal con imágenes que aparecen o el efecto flash.

### `kf` — viaje de la caja (A→B)

Si el clip lleva `kf:{x,y,scale}`, la caja viaja de su `x/y/scale` inicial al destino `kf` durante TODO el clip con `power3.out` (easeOutCubic del progreso). En GSAP: tween de x/y/scale de A a B con `duration = dur` del clip.

### `aspect` — formato del proyecto

`state.aspect` = `"16:9"` (1920×1080, por defecto) o `"9:16"` (1080×1920, Shorts; el vídeo original se recorta con object-fit cover). El stage del render debe usar el mismo formato y las mismas coordenadas.

### `claudeNote` — órdenes por clip

Cualquier clip puede llevar `claudeNote` (texto): es una ORDEN de Daniel para el paso 4. En `montaje.txt` salen agrupadas en `ÓRDENES PARA CLAUDE`. Aplicarlas una a una antes de dar el render por bueno.

### `claude-pase.js` — el pase inverso (Claude → editor)

Claude escribe `projects/<job>/editor/claude-pase.js` con `window.EF_CLAUDE={ts,keepCaptions,clips:[…],markers:[…]}` usando los MISMOS campos del editor. El botón "Pase de Claude" lo importa (conserva vídeo/audio y subtítulos si `keepCaptions!==false`).

### `beats.js` (opcional, por proyecto)

`window.EF_BEATS=[segundos…]` (de `npx hyperframes beats` sobre la música) → el editor los usa de imán y los pinta en la regla. Si Daniel alineó clips a beats, el render conserva esos tiempos exactos.

## Música (global)

`music-bg.mp3` (export) → pista de fondo en la fase 6: volumen = slider del editor,
**ducking** −12 dB bajo la voz (sidechain), fade-in 0.8s y fade-out 1.5s al final del montaje
(los mismos que aplica el editor en preview).

**Música del kit** (`musicLib: true` en el JSON exportado, sin `music-bg` entre los media): la pista
es `biblioteca/musica/ultimo-bastion-en-auge.mp3` del plugin (44s → en bucle con crossfade si el
montaje es más largo). Mismo ducking y fades que arriba.

## Checklist de paridad antes de renderizar

1. Todos los `mediaId` del JSON existen en `comp/media/`.
2. `data-duration` del `#stage` = duración del montaje del JSON.
3. Ningún gráfico tapa la cara (regla fija de colocación).
4. `npx hyperframes lint` + `snapshot` antes del render completo; render con `-w 1`; remux de audio al exportar.
