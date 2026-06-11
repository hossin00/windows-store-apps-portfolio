################################################################################
# run-app.ps1
# Runs the selected app in dev mode
# Usage: .\scripts\run-app.ps1 -AppSlug "01-pdf-ocr-desk"
# Use -Tauri to run full Tauri desktop mode (requires Rust)
################################################################################
param(
    [Parameter(Mandatory=$true)] [string]$AppSlug,
    [switch]$Tauri
)
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root      = Split-Path -Parent $ScriptDir
$AppDir    = Join-Path $Root "apps\$AppSlug"

Write-Host ""
Write-Host "Starting dev server for: $AppSlug" -ForegroundColor Cyan

if (-not (Test-Path $AppDir)) {
    Write-Host "[ERROR] App folder not found: $AppDir" -ForegroundColor Red
    exit 1
}

$nmDir = Join-Path $AppDir "node_modules"
if (-not (Test-Path $nmDir)) {
    Write-Host "[WARN] node_modules not found. Running npm install first..." -ForegroundColor Yellow
    Set-Location $AppDir
    & npm install
}

Set-Location $AppDir

if ($Tauri) {
    Write-Host "Mode: Tauri desktop (cargo tauri dev)" -ForegroundColor Cyan
    Write-Host "      Requires Rust — install from https://rustup.rs" -ForegroundColor Gray
    & npm run tauri:dev
} else {
    Write-Host "Mode: Browser dev (Vite on http://localhost:1420)" -ForegroundColor Cyan
    & npm run dev
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Dev server exited with code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
