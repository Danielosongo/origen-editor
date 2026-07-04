# 🎬 Origen Editor — el Editor Fantasma

Un editor de vídeo con IA que vive en tu **Claude Code**. Sueltas una toma cruda y Claude la convierte
en un vídeo publicable —corte, gráficos premium, subtítulos karaoke, música y export— dirigido por ti,
sin tocar ningún programa de edición. El motor es [HyperFrames](https://www.npmjs.com/package/hyperframes)
(HTML → MP4), **gratis y de código abierto**.

> Un plugin del canal **"IA con Daniel García"**. Esto es lo que otros venden en su comunidad de pago. Aquí va abierto.

## 🚀 Instalación (pega esto en Claude Code)

```
/plugin marketplace add Danielosongo/origen-editor
/plugin install origen-editor@origen-editor
/origen-editor:setup
```

> Ya configurado para el repo **`Danielosongo/origen-editor`**. Solo falta crear el repo vacío en
> GitHub y hacer push (`scripts/push-a-github.ps1 -User Danielosongo`).

Las dos primeras líneas instalan el plugin (skills, comandos, plantillas) en segundos.
`/origen-editor:setup` **instala él solo** todo el motor: Node, HyperFrames, ffmpeg, Chrome si falta,
Python y faster-whisper (el modelo de voz se descarga solo la primera vez que transcribes).

## 🖱️ Instalación SIN Claude Code (VS Code o carpeta)

1. Descarga el repo (Code → Download ZIP, o `git clone https://github.com/Danielosongo/origen-editor`).
2. Doble clic en **`INSTALAR.bat`** (Windows) o `bash scripts/setup.sh` (mac/Linux) — instala todo el motor.
3. Abre la carpeta en VS Code (o donde quieras): el editor visual es `editor-visual/index.html`
   (doble clic y se abre en el navegador, sin servidor).

> ¿Por qué no vienen ffmpeg/Python/modelos DENTRO del repo? GitHub limita los archivos a 100 MB y el
> motor completo pesa varios GB. El instalador de un clic los trae él solo — mismo resultado.

## ⚡ De 0 a 100 con un comando
```
/origen-editor:auto C:\ruta\a\tu\toma.mp4
```
Claude encadena TODO sin parar: corte de silencios → transiciones → gráficos premium → b-roll →
SFX → subtítulos → zooms → música de marca con ducking → export. Y te deja el montaje cargado en el
editor visual (**Pase de Claude**) para que retoques lo que quieras.

## ⚡ O paso a paso, dirigido por ti
```
/origen-editor:nuevo C:\ruta\a\tu\toma.mp4    # crea el proyecto + hace el corte
# revisa el corte, y luego:
/origen-editor:graficos                        # gráficos premium (primer pase)
/origen-editor:editor                          # editor visual local (mover overlays, recortar, subtítulos)
# corrige hablando: "este bájalo, que me tapa la cara"
/origen-editor:subtitulos                       # (solo vertical/corto) subtítulos karaoke
/origen-editor:exportar                         # mp4 final en outputs/ y en Descargas
```

## 🧩 Las 7 fases
Intake → Rough cut → **Gráficos** → Segundo pase (manual) → **Subtítulos** → Música → Export.
Solo cambian la 3 y la 5 según el formato (`short-explainer` / `tiktok-raw` / `long-form`). Detalle en `GUIA.md` y `CLAUDE.md`.

## ✅ Requisitos
`/origen-editor:setup` los comprueba e instala/avisa por ti:
- **Node 18+** y `npx hyperframes` (el motor de render).
- **ffmpeg** y **ffprobe** en el PATH.
- **Google Chrome** del sistema → variable `HYPERFRAMES_BROWSER_PATH`.
- **Python 3.10+** y **faster-whisper** (transcripción; whisper-cpp NO hace falta).

## 🙏 Honestidad (léelo)
No es magia ni "100% IA": el corte y los subtítulos son casi automáticos; **los gráficos los diriges tú**
(fase 4, manual) y ahí está el 90% de la calidad. Eso no es un defecto: es el sistema.

## 📦 Estructura del repo
- `.claude-plugin/` — `marketplace.json` + `plugin.json` (lo que lee Claude Code al instalar).
- `skills/` — las 7 fases como skills (intake, rough-cut, graficos, segundo-pase, subtitulos, musica, export).
- `commands/` — los slash-commands (`setup`, `auto`, `nuevo`, `editor`, `graficos`, `subtitulos`, `exportar`).
- `plantillas/comp/` — composición HyperFrames premium de ejemplo (clip-agnóstica).
- `plantillas/presets/` — estilos bloqueados por formato.
- `biblioteca/` — el kit: música de marca (`musica/`) + b-roll stock (`broll/`). Los SFX van en `editor-visual/sfx/`.
- `scripts/` — `transcribe.py`, `setup.ps1` / `setup.sh`, `push-a-github.ps1`.
- `editor-visual/` — el editor visual local (un único `index.html`).
- `GUIA.md` — la guía paso a paso. `CLAUDE.md` — el manual que opera Claude.

## 📄 Licencia
MIT · 2026 · Daniel García.
