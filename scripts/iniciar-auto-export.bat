@echo off
REM Arranca el vigilante de export automático del Origen Editor (se registra para iniciarse con la sesión).
node "%~dp0auto-export.mjs" >> "%USERPROFILE%\origen-auto-export.log" 2>&1
