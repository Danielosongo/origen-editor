# 🎬 Mi sistema de edición con Claude Code — qué es cada cosa

> Esto **no es un programa**. Es una carpeta: **el manual + las herramientas** que le das a Claude para que edite tus vídeos como tú. Claude es el editor; esta carpeta es su mesa de trabajo.

```
📂 origen-editor  (mi sistema de edición con Claude Code)
│
├── 🧠 CLAUDE.md ............... EL MANUAL — cómo edito yo (método, cortes, sonidos, estilo)
├── 🎓 skills/ ................. LAS HABILIDADES de Claude, una por paso:
│      ├── rough-cut/ ......... cortar silencios y muletillas
│      ├── subtitulos/ ........ subtítulos karaoke
│      ├── graficos/ .......... gráficos y animaciones
│      ├── segundo-pase/ ...... afinar la edición
│      ├── musica/ ............ música de fondo
│      └── export/ ............ generar el vídeo final
│
├── ⌨️  commands/ ............... LOS COMANDOS que escribes tú (/auto, /editar, /graficos…)
│
├── 🎨 editor-visual/ .......... EL CRM — tu editor visual tipo CapCut (index.html)
│      ├── sfx/ ............... los sonidos
│      └── claude-pase.js ..... tu montaje "Guardado" por defecto
│
├── ⚙️  render/ ................. EL MOTOR — convierte tu montaje en el MP4 final
│      (color neutro + animaciones + sonidos, con 1 clic)
│
├── 🧩 plantillas/ ............. plantillas de gráficos
├── 🎵 biblioteca/ ............. kit: música de marca + b-roll
│
├── 📦 INSTALAR.bat ............ DOBLE CLIC = instala todo (ffmpeg, motor, Chrome…)
├── 🔧 scripts/ ................ el instalador + el vigilante de export
└── 📖 README.md / GUIA.md ..... guía y los 2 comandos de instalación
```

## Cómo se instala (2 clics)
**Opción A — en Claude Code:**
```
/plugin marketplace add Danielosongo/origen-editor
/plugin install origen-editor@origen-editor
```
**Opción B — a mano:** descarga la carpeta y ábrela en VS Code o Claude Code de escritorio (arrástrala).

Luego: **doble clic en `INSTALAR.bat`** → monta ffmpeg, el motor y Chrome solo. Cuando ponga *"Todo listo ✅"*, a editar con `/origen-editor:auto <tu-vídeo>`.

## El flujo (de vídeo crudo a publicado)
```
🎥 tu clip  →  ✂️ Claude corta  →  💬 subtítulos  →  ✨ gráficos + sonidos
        →  🎨 se abre en el CRM (retocas a tu gusto)  →  ⬇️ Exportar = MP4 final
```
