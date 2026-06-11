################################################################################
# package-app.ps1
# Prepares release output folder for a built app
# Usage: .\scripts\package-app.ps1 -AppSlug "01-pdf-ocr-desk"
################################################################################
param(
    [Parameter(Mandatory=$true)] [string]$AppSlug
)
$ErrorActionPreference = "Stop"

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root       = Split-Path -Parent $ScriptDir
$AppDir     = Join-Path $Root "apps\$AppSlug"
$DistDir    = Join-Path $AppDir "dist"
$ReleaseDir = Join-Path $Root "release\$AppSlug"

Write-Host ""
Write-Host "Packaging: $AppSlug" -ForegroundColor Cyan

if (-not (Test-Path $DistDir)) {
    Write-Host "[ERROR] dist/ folder not found. Run build-app.ps1 first." -ForegroundColor Red
    exit 1
}

if (Test-Path $ReleaseDir) {
    Remove-Item -Path $ReleaseDir -Recurse -Force
}
New-Item -ItemType Directory -Path $ReleaseDir | Out-Null

# Copy dist output
Copy-Item -Path "$DistDir\*" -Destination $ReleaseDir -Recurse

# Copy metadata
$metaDir = Join-Path $AppDir "metadata"
if (Test-Path $metaDir) {
    $releaseMetaDir = Join-Path $ReleaseDir "metadata"
    New-Item -ItemType Directory -Path $releaseMetaDir | Out-Null
    Copy-Item -Path "$metaDir\*" -Destination $releaseMetaDir -Recurse
}

# Copy README and CHECKLIST
foreach ($doc in @("README.md", "CHECKLIST.md")) {
    $docPath = Join-Path $AppDir $doc
    if (Test-Path $docPath) {
        Copy-Item -Path $docPath -Destination $ReleaseDir
    }
}

Write-Host ""
Write-Host "[OK] Release package at: release\$AppSlug\" -ForegroundColor Green
