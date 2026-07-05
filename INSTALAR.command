#!/usr/bin/env bash
# ============================================================
#  Origen Editor — instalador de UN CLIC (Mac)
#  Doble clic sobre este archivo para montar todo el entorno:
#  Node, ffmpeg, Chrome, Python + faster-whisper y HyperFrames.
#
#  Si Mac lo bloquea ("no se puede abrir porque es de un
#  desarrollador no identificado"): clic derecho -> Abrir.
# ============================================================
cd "$(dirname "$0")" || exit 1
bash scripts/setup.sh
echo ""
read -r -p "Instalacion terminada. Pulsa Enter para cerrar esta ventana..."
