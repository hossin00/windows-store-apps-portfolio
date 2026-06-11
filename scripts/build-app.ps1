################################################################################
# build-app.ps1
# Builds the frontend and optionally the Tauri bundle
# Usage: .\scripts\build-app.ps1 -AppSlug "01-pdf-ocr-desk"
# Use -Tauri to build full .msi installer (requires Rust)
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
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Building: $AppSlug" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

if (-not (Test-Path $AppDir)) {
    Write-Host "[ERROR] App folder not found: $AppDir" -ForegroundColor Red
    exit 1
}

$nmDir = Join-Path $AppDir "node_modules"
if (-not (Test-Path $nmDir)) {
    Write-Host "node_modules not found. Running npm install..." -ForegroundColor Yellow
    Set-Location $AppDir
    & npm install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Set-Location $AppDir

if ($Tauri) {
    Write-Host "Build mode: Tauri .msi bundle (requires Rust + cargo)" -ForegroundColor Cyan
    & npm run tauri:build
} else {
    Write-Host "Build mode: Frontend only (Vite)" -ForegroundColor Cyan
    & npm run build
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Build failed with code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Report output
if ($Tauri) {
    $bundleDir = Join-Path $AppDir "src-tauri\target\release\bundle"
    Write-Host ""
    Write-Host "[OK] Tauri bundle output:" -ForegroundColor Green
    if (Test-Path $bundleDir) {
        Get-ChildItem $bundleDir -Recurse -Include "*.msi","*.exe" | ForEach-Object {
            Write-Host "     $($_.FullName)" -ForegroundColor White
        }
    }
} else {
    $distDir = Join-Path $AppDir "dist"
    Write-Host ""
    Write-Host "[OK] Frontend build output: $distDir" -ForegroundColor Green
    if (Test-Path $distDir) {
        $files = Get-ChildItem $distDir -Recurse -File
        Write-Host "     $($files.Count) files built" -ForegroundColor Gray
        $sizeKB = [Math]::Round(($files | Measure-Object Length -Sum).Sum / 1KB)
        Write-Host "     Total size: ~$sizeKB KB" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Build complete." -ForegroundColor Green
