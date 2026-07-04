<#  Origen Editor (Editor Fantasma) — publica los cambios del plugin en GitHub.

    El plugin vive DENTRO del monorepo ("Mi Proyecto"). Este script empuja SOLO la carpeta
    editor-de-video/editor-fantasma al repo público con git subtree — sin anidar otro .git.

    Requisitos (ya hechos en este PC el 2026-07-02):
      - gh auth login (cuenta Danielosongo, token en el keyring)
      - gh auth setup-git (git usa gh como credencial para github.com, permanente)

    Uso:  1) commitea tus cambios en el monorepo (git add editor-de-video/ && git commit ...)
          2) .\scripts\push-a-github.ps1                                                     #>

param(
  [string]$User   = "Danielosongo",
  [string]$Repo   = "origen-editor",
  [string]$Branch = "main",
  [string]$Prefix = "editor-de-video/editor-fantasma"
)
$ErrorActionPreference = "Stop"

$plugin   = Split-Path $PSScriptRoot -Parent
$monorepo = git -C $plugin rev-parse --show-toplevel
Set-Location $monorepo

git subtree push --prefix=$Prefix "https://github.com/$User/$Repo.git" $Branch

Write-Host ""
Write-Host "✅ Publicado en https://github.com/$User/$Repo" -ForegroundColor Green
Write-Host "   Instalación para tus seguidores:"
Write-Host "     /plugin marketplace add $User/$Repo"
Write-Host "     /plugin install origen-editor@origen-editor"
Write-Host "     /origen-editor:setup"
