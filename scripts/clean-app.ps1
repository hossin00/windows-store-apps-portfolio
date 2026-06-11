################################################################################
# clean-app.ps1
# Safely cleans build output for a selected app
# Usage: .\scripts\clean-app.ps1 -AppSlug "01-pdf-ocr-desk"
# Use -IncludeNodeModules to also remove node_modules (full clean)
################################################################################
param(
    [Parameter(Mandatory=$true)] [string]$AppSlug,
    [switch]$IncludeNodeModules
)
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root      = Split-Path -Parent $ScriptDir
$AppDir    = Join-Path $Root "apps\$AppSlug"

Write-Host ""
Write-Host "Cleaning: $AppSlug" -ForegroundColor Cyan

if (-not (Test-Path $AppDir)) {
    Write-Host "[ERROR] App folder not found: $AppDir" -ForegroundColor Red
    exit 1
}

# Safe list of known build/cache directories to clean
$cleanTargets = @(
    "dist",
    "dist-ssr",
    ".vite",
    "src-tauri\target"
)

if ($IncludeNodeModules) {
    $cleanTargets += "node_modules"
    Write-Host "[WARN] Removing node_modules — run install-app.ps1 afterward." -ForegroundColor Yellow
}

foreach ($rel in $cleanTargets) {
    $full = Join-Path $AppDir $rel
    if (Test-Path $full) {
        Write-Host "  Removing: $rel" -ForegroundColor Gray
        Remove-Item -Path $full -Recurse -Force
        Write-Host "  [OK] Removed: $rel" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] Not found: $rel" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "[OK] Clean complete for $AppSlug" -ForegroundColor Green
