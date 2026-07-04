---
name: musica
description: Fase 6 del Editor Fantasma (opcional) — pista de fondo bajita con sidechain duck para que no tape la voz.
---

# Fase 6 — Música de fondo (opcional)

**Objetivo:** pista de fondo bajita que no tape la voz.

1. Copia la canción a `projects/<job>/music/`.
2. (Opcional) Detecta beats: `npx hyperframes beats "projects/<job>/music/<song>"` — útil si quieres sincronizar gráficos/cortes al ritmo.
3. Mezcla con ffmpeg: **sidechain duck** (la música baja cuando hablas) + re-normaliza. Volumen por defecto **-23 dB** (ajustable a gusto del usuario):
   ```powershell
   ffmpeg -i work.mp4 -i music\song.mp3 -filter_complex `
     "[1:a]volume=-23dB[m];[0:a][m]sidechaincompress=threshold=0.03:ratio=6[a]" `
     -map 0:v -map "[a]" -c:v copy work_music.mp4
   ```
   ```bash
   ffmpeg -i work.mp4 -i music/song.mp3 -filter_complex \
     "[1:a]volume=-23dB[m];[0:a][m]sidechaincompress=threshold=0.03:ratio=6[a]" \
     -map 0:v -map "[a]" -c:v copy work_music.mp4
   ```
4. Escucha y ajusta el dB si hace falta.

**Salida:** `work.mp4` (o `work_music.mp4`) con música.
