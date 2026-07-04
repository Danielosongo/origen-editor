# 🧭 GUÍA — Editor Fantasma paso a paso

La guía larga: de instalar el plugin a tener un MP4 publicable. Incluye el uso del **editor visual** y
los **fallos típicos** (y cómo resolverlos). Tiempo de puesta a punto: ~10-15 min la primera vez.

---

## 0. Instalar el plugin
En tu Claude Code:
```
/plugin marketplace add Danielosongo/origen-editor
/plugin install origen-editor@origen-editor
/origen-editor:setup
```
`/origen-editor:setup` comprueba/instala: Node + HyperFrames, ffmpeg/ffprobe, Chrome
(`HYPERFRAMES_BROWSER_PATH`) y Python + faster-whisper. Si algo falta, te dice el comando exacto.

> Comprobación manual rápida del entorno:
> ```
> node -v                         # 18+
> npx hyperframes --version        # 0.7.x
> ffmpeg -version                  # cualquiera reciente
> python -c "import faster_whisper; print('ok')"
> ```

---

## ⚡ El atajo: de 0 a 100 con un comando

```
/origen-editor:auto C:\ruta\a\tu\toma.mp4
```

Claude encadena **todas las fases sin parar**: corte de silencios → transiciones en cada corte →
gráficos premium → b-roll (kit + IA) → SFX → subtítulos (si el formato los lleva) → zooms de impacto →
música de marca con ducking → export con audio. Al acabar te enseña los recortes (segundos exactos),
lo que colocó en cada momento, y te deja el montaje cargado en el editor visual (**Pase de Claude**)
para que retoques lo que quieras. El paso a paso de abajo sigue disponible para dirigirlo tú fase a fase.

---

## Las 7 fases

### Fase 1 · Intake
```
/origen-editor:nuevo C:\ruta\a\tu\toma.mp4
```
Crea `projects/<job>/` en tu carpeta actual, copia el clip a `raw/` (el original no se toca) y te pregunta
el **formato**: `long-form` (def., YouTube 16:9) · `short-explainer` (9:16) · `tiktok-raw` (9:16).

### Fase 2 · Rough cut (el corte)
Claude transcribe con timestamps por palabra (faster-whisper, español), decide qué se queda (fuera
silencios largos, repeticiones, tomas falsas, "eeeh/mmm"), escribe `script.md` y monta `work.mp4`.
**Revisa el corte y dale OK.** Si quieres ajustes ("deja más aire aquí", "te dejaste una palabra"),
pídelos: edita `cuts.json` y rehace solo el corte. **El corte se cierra antes de tocar gráficos.**

### Fase 3 · Gráficos (primer pase)
```
/origen-editor:graficos
```
Un gráfico por segmento sobre el corte, con la **plantilla premium** (cristal líquido, blur-in, sheen,
punch-ins). Es el primer pase, "del montón". La calidad llega en la fase 4.

### Fase 4 · Segundo pase (MANUAL) — el 90% de la calidad
Aquí diriges tú, hablando:
- *"este gráfico bájalo, me tapa la cara"*
- *"ponme el logo aquí"* · *"esto hazlo un diagrama"* · *"empieza el zoom un poco antes"*

Claude edita **solo** la tarjeta afectada y **re-renderiza solo ese trozo** (no el vídeo entero).
Itera rápido: cambio → draft → cambio → draft.

```
/origen-editor:editor
```
Abre el **editor visual** local (un HTML, sin servidor):
- **Toggle Render ⇄ Editar.**
- **Timeline** con pistas (vídeo / gráficos / subtítulos / audio).
- Overlays **arrastrables y recortables**, inspector, preview en vivo, guardar/exportar.
- **Redimensionar como en CapCut:** selecciona un clip en el monitor y arrastra los tiradores de sus
  esquinas — imágenes y b-roll cambian su tamaño real; textos y gráficos, su escala.
- **Girar flechas 360°:** con la flecha seleccionada, arrastra el tirador naranja de arriba y apunta
  a donde quieras (Shift = de 15° en 15°).
- **Grupo Transiciones** en Recursos: Flash / Barrido / Zoom / Fundido y 4 transiciones de vídeo stock.
  Son **clips normales**: caen en el cursor, se mueven a cualquier pista y se quitan con Supr.
- **Recursos plegados:** los grupos del panel izquierdo van cerrados; clic en el título para abrir (se recuerda).
- **Modos de pantalla** (botones junto al contador de tiempo): **Teatro** (ancho, como YouTube — mismo
  botón para volver) y **Pantalla completa** (Esc o mismo botón para volver).
- **Subtítulos súper editables:** con un subtítulo seleccionado, en Contenido → "Subtítulo: palabras"
  cambias el texto (mismo nº de palabras = conserva los tiempos del karaoke); en Colores cambias fondo,
  color de letras y color de la palabra destacada.
- Grupo **Biblioteca** en Recursos: la música de marca y los b-roll stock del kit — doble clic o arrastra,
  como cualquier otro recurso (la música va al fondo con ducking automático).
- Reglas fijas de estilo: nunca un gráfico en el centro tapando la cara/ojos; van abajo, a los lados o
  esquinas de arriba, idealmente donde señala la mano.

### Fase 5 · Subtítulos (solo vertical/corto)
```
/origen-editor:subtitulos
```
Subtítulos **karaoke** palabra a palabra, reutilizando `transcript.json` (no se re-transcribe). En
`long-form` se omite (se usan los CC de YouTube). Posición: explainer = centro · tiktok-raw = bajo la cara.

### Fase 6 · Música (opcional)
Mete una pista de fondo bajita con **sidechain duck** (la música baja cuando hablas). Volumen por
defecto **-23 dB**, ajustable. Di: *"mete esta música C:\...\fondo.mp3 a -23 dB"*.

### Fase 7 · Export
```
/origen-editor:exportar
```
Hace el **remux de audio** (arregla el render mudo), deja `outputs/<job>.final.mp4` y una copia en tu
carpeta de Descargas, y conserva `projects/<job>/` intacto para reeditar.

---

## ⚠️ Los fallos típicos (y su solución)

**1) El render sale MUDO.** HyperFrames a veces saca el MP4 sin audio. Solución: pegar el audio del clip
de trabajo con ffmpeg (lo hace la fase 7 / `/origen-editor:exportar`):
```
ffmpeg -i work.mp4 -i raw\toma.mp4 -c:v copy -map 0:v:0 -map 1:a:0 -shortest outputs\job.final.mp4
```

**2) La transcripción quiere whisper-cpp.** No lo uses. Usa **faster-whisper** (más fácil en Windows):
`pip install faster-whisper`. El script `scripts/transcribe.py` ya lo usa.

**3) RAM justa → el render peta o se arrastra.** Renderiza de uno en uno: siempre **`-w 1`**.
```
npx hyperframes render projects\<job>\comp -o projects\<job>\work.mp4 -w 1
```

**4) No encuentra el navegador / faltan fuentes.** Apunta HyperFrames a tu Chrome:
```
# Windows (permanente)
setx HYPERFRAMES_BROWSER_PATH "C:\Program Files\Google\Chrome\Application\chrome.exe"
# mac/Linux (añádelo a ~/.zshrc o ~/.bashrc)
export HYPERFRAMES_BROWSER_PATH="/ruta/a/google-chrome"
```
Carga las fuentes web por CDN (jsDelivr) en el HTML — HyperFrames no las trae de serie. La plantilla
`plantillas/comp/index.html` ya lo hace.

---

## 🎚️ Formatos (resumen)
| Formato | Aspecto | Gráficos | Subtítulos | Uso |
|---|---|---|---|---|
| `long-form` (def.) | 16:9 | signature-style | YouTube CC (se omiten) | vídeos del canal |
| `short-explainer` | 9:16 | gráficos arriba / cara abajo | centrados | reels explicativos |
| `tiktok-raw` | 9:16 | tarjeta de hook → corte crudo | bajo la cara | TikTok/Shorts |

Solo cambian la fase 3 (gráficos) y la 5 (subtítulos). El resto es igual en todos.
