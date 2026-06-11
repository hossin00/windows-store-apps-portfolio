################################################################################
# install-app.ps1
# Installs npm dependencies for a selected app
# Usage: .\scripts\install-app.ps1 -AppSlug "01-pdf-ocr-desk"
################################################################################
param(
    [Parameter(Mandatory=$true)] [string]$AppSlug
)
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root      = Split-Path -Parent $ScriptDir
$AppDir    = Join-Path $Root "apps\$AppSlug"

Write-Host ""
Write-Host "Installing dependencies for: $AppSlug" -ForegroundColor Cyan

if (-not (Test-Path $AppDir)) {
    Write-Host "[ERROR] App folder not found: $AppDir" -ForegroundColor Red
    exit 1
}

$pkgJson = Join-Path $AppDir "package.json"
if (-not (Test-Path $pkgJson)) {
    Write-Host "[ERROR] package.json not found in $AppDir" -ForegroundColor Red
    exit 1
}

Set-Location $AppDir
Write-Host "Running: npm install" -ForegroundColor Gray
& npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] npm install failed with code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "[OK] Dependencies installed for $AppSlug" -ForegroundColor Green
