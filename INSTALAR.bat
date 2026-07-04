@echo off
REM ============================================================
REM  Origen Editor — instalador de UN CLIC (Windows)
REM  Sirve igual desde el Explorador, VS Code o una terminal:
REM  instala Node, ffmpeg, Chrome (si falta), Python y
REM  faster-whisper, y deja HyperFrames listo via npx.
REM ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup.ps1"
echo.
pause
