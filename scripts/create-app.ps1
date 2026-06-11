################################################################################
# create-app.ps1
# Scaffolds a new app from the shared template
# Usage: .\scripts\create-app.ps1 -AppNumber "01" -AppSlug "pdf-ocr-desk" `
#                                  -AppName "PDF OCR Desk" `
#                                  -PackageName "com.kartdev.pdfocrdesk"
################################################################################
param(
    [Parameter(Mandatory=$true)]  [string]$AppNumber,
    [Parameter(Mandatory=$true)]  [string]$AppSlug,
    [Parameter(Mandatory=$true)]  [string]$AppName,
    [Parameter(Mandatory=$true)]  [string]$PackageName
)
$ErrorActionPreference = "Stop"

$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root        = Split-Path -Parent $ScriptDir
$TemplateDir = Join-Path $Root "shared\template"
$AppDir      = Join-Path $Root "apps\$AppNumber-$AppSlug"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Scaffolding App: $AppName" -ForegroundColor Cyan
Write-Host "  Folder : apps\$AppNumber-$AppSlug\" -ForegroundColor Cyan
Write-Host "  Package: $PackageName" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# ── Guard: template must exist ────────────────────────────────────────────────
if (-not (Test-Path $TemplateDir)) {
    Write-Host "[ERROR] Template not found at: $TemplateDir" -ForegroundColor Red
    Write-Host "        Run .\scripts\create-template.ps1 first." -ForegroundColor Red
    exit 1
}

# ── Guard: app folder must not already exist ──────────────────────────────────
if (Test-Path $AppDir) {
    Write-Host "[WARN] App folder already exists: $AppDir" -ForegroundColor Yellow
    Write-Host "       Use -Force to overwrite, or delete the folder first." -ForegroundColor Yellow
    exit 0
}

# ── Copy template ─────────────────────────────────────────────────────────────
Write-Host "[1/4] Copying template to $AppDir ..." -ForegroundColor Cyan
Copy-Item -Path $TemplateDir -Destination $AppDir -Recurse

# ── Replace placeholders in key files ────────────────────────────────────────
Write-Host "[2/4] Replacing name/package placeholders..." -ForegroundColor Cyan

$filesToPatch = @(
    "index.html",
    "package.json",
    "src-tauri\tauri.conf.json",
    "src-tauri\Cargo.toml"
)

foreach ($relPath in $filesToPatch) {
    $fullPath = Join-Path $AppDir $relPath
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        $content = $content -replace "APP_NAME_PLACEHOLDER",     $AppName
        $content = $content -replace "PACKAGE_NAME_PLACEHOLDER", $PackageName
        $content = $content -replace "app-template",             ($AppSlug -replace "-", "_")
        Set-Content -Path $fullPath -Value $content -Encoding UTF8
        Write-Host "   Patched: $relPath" -ForegroundColor Gray
    }
}

# ── Create app-specific README ────────────────────────────────────────────────
Write-Host "[3/4] Creating app README.md..." -ForegroundColor Cyan
$readme = @"
# $AppName

> App $AppNumber in the KART L Windows Store Apps Portfolio

## Setup

``````powershell
# From the portfolio root:
.\scripts\install-app.ps1 -AppSlug "$AppNumber-$AppSlug"
``````

## Development

``````powershell
.\scripts\run-app.ps1 -AppSlug "$AppNumber-$AppSlug"
``````

## Build

``````powershell
.\scripts\build-app.ps1 -AppSlug "$AppNumber-$AppSlug"
``````

## Check

``````powershell
.\scripts\check-app.ps1 -AppSlug "$AppNumber-$AppSlug"
``````

## Package details

| Key         | Value                   |
|-------------|-------------------------|
| App Number  | $AppNumber              |
| App Slug    | $AppSlug                |
| Package     | $PackageName            |
| Platform    | Windows (Tauri + React) |
| Store       | Microsoft Store         |

## Privacy

This app is local-first. No ads. No tracking. No account required.
See ``metadata/privacy_policy.md`` for full details.
"@
Set-Content -Path (Join-Path $AppDir "README.md") -Value $readme -Encoding UTF8

# ── Create CHECKLIST.md ───────────────────────────────────────────────────────
Write-Host "[4/4] Creating CHECKLIST.md..." -ForegroundColor Cyan
$checklist = @"
# $AppName — Store Readiness Checklist

## Build Status
- [ ] npm install passes
- [ ] npm run build passes
- [ ] tauri build passes (requires Rust)

## UI Status
- [ ] All pages open without errors
- [ ] Sidebar navigation works
- [ ] Dark/light theme toggle works
- [ ] Settings save to localStorage
- [ ] Export buttons produce files
- [ ] Empty states display correctly
- [ ] Loading states display correctly
- [ ] Error states display correctly

## Metadata Status
- [ ] microsoft_store_metadata.md complete
- [ ] privacy_policy.md complete
- [ ] terms_of_use.md complete
- [ ] icon_prompt.md complete
- [ ] screenshots_prompt.md complete
- [ ] feature_graphic_prompt.md complete
- [ ] product_concept.md complete
- [ ] paid_value_notes.md complete

## Privacy Status
- [ ] No ads in the app
- [ ] No tracking by default
- [ ] No account required
- [ ] User can clear all local data
- [ ] Privacy page exists and is accurate

## Store Readiness
- [ ] App title is Microsoft Store safe
- [ ] Description has no fake claims
- [ ] No copyright violations
- [ ] No "best", "#1", "top" claims
- [ ] Screenshots prepared (6 minimum)
- [ ] App icon prepared (300x300 PNG)
- [ ] Age rating determined

## Notes
_Add build notes, known issues, and integration status here._

### OCR Engine Status
- [ ] Mock OCR engine working in dev
- [ ] Real OCR engine (Tesseract.js / Windows OCR API) integrated
"@
Set-Content -Path (Join-Path $AppDir "CHECKLIST.md") -Value $checklist -Encoding UTF8

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  App scaffolded: apps\$AppNumber-$AppSlug\" -ForegroundColor Green
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Green
Write-Host "    1. .\scripts\install-app.ps1 -AppSlug `"$AppNumber-$AppSlug`"" -ForegroundColor White
Write-Host "    2. .\scripts\run-app.ps1     -AppSlug `"$AppNumber-$AppSlug`"" -ForegroundColor White
Write-Host "    3. .\scripts\build-app.ps1   -AppSlug `"$AppNumber-$AppSlug`"" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Green
