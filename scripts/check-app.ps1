################################################################################
# check-app.ps1
# Validates that an app has all required files and structure
# Usage: .\scripts\check-app.ps1 -AppSlug "01-pdf-ocr-desk"
################################################################################
param(
    [Parameter(Mandatory=$true)] [string]$AppSlug
)
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root      = Split-Path -Parent $ScriptDir
$AppDir    = Join-Path $Root "apps\$AppSlug"

$PassCount = 0
$FailCount = 0
$WarnCount = 0

function Check-Exists {
    param([string]$RelPath, [string]$Label, [bool]$Required = $true)
    $full = Join-Path $AppDir $RelPath
    if (Test-Path $full) {
        Write-Host "  [PASS] $Label" -ForegroundColor Green
        $script:PassCount++
    } elseif ($Required) {
        Write-Host "  [FAIL] $Label  (missing: $RelPath)" -ForegroundColor Red
        $script:FailCount++
    } else {
        Write-Host "  [WARN] $Label  (missing: $RelPath)" -ForegroundColor Yellow
        $script:WarnCount++
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Checking: $AppSlug" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

if (-not (Test-Path $AppDir)) {
    Write-Host "[ERROR] App folder not found: $AppDir" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "── Core Files ───────────────────────────────────" -ForegroundColor Gray
Check-Exists "package.json"                    "package.json"
Check-Exists "tsconfig.json"                   "tsconfig.json"
Check-Exists "vite.config.ts"                  "vite.config.ts"
Check-Exists "index.html"                      "index.html"
Check-Exists ".gitignore"                      ".gitignore"
Check-Exists "README.md"                       "README.md"
Check-Exists "CHECKLIST.md"                    "CHECKLIST.md"

Write-Host ""
Write-Host "── Source Tree ──────────────────────────────────" -ForegroundColor Gray
Check-Exists "src"                             "src/ folder"
Check-Exists "src\main.tsx"                    "src/main.tsx"
Check-Exists "src\App.tsx"                     "src/App.tsx"
Check-Exists "src\index.css"                   "src/index.css"
Check-Exists "src\types"                       "src/types/ folder"
Check-Exists "src\services"                    "src/services/ folder"
Check-Exists "src\pages"                       "src/pages/ folder"
Check-Exists "src\components"                  "src/components/ folder"
Check-Exists "src\context"                     "src/context/ folder"

Write-Host ""
Write-Host "── Key Services ─────────────────────────────────" -ForegroundColor Gray
Check-Exists "src\services\localStorageService.ts" "localStorageService.ts"
Check-Exists "src\services\exportService.ts"       "exportService.ts"
Check-Exists "src\services\ocrService.ts"          "ocrService.ts"

Write-Host ""
Write-Host "── Pages ────────────────────────────────────────" -ForegroundColor Gray
Check-Exists "src\pages\Dashboard.tsx"         "Dashboard page"
Check-Exists "src\pages\Workspace.tsx"         "Workspace page"
Check-Exists "src\pages\BatchQueue.tsx"        "BatchQueue page"
Check-Exists "src\pages\History.tsx"           "History page"
Check-Exists "src\pages\ExportCenter.tsx"      "ExportCenter page"
Check-Exists "src\pages\Settings.tsx"          "Settings page"
Check-Exists "src\pages\Privacy.tsx"           "Privacy page"
Check-Exists "src\pages\About.tsx"             "About page"
Check-Exists "src\pages\Help.tsx"              "Help page"

Write-Host ""
Write-Host "── Tauri Scaffold ───────────────────────────────" -ForegroundColor Gray
Check-Exists "src-tauri\tauri.conf.json"       "tauri.conf.json"
Check-Exists "src-tauri\Cargo.toml"            "Cargo.toml"
Check-Exists "src-tauri\src\main.rs"           "main.rs"
Check-Exists "src-tauri\src\lib.rs"            "lib.rs"
Check-Exists "src-tauri\build.rs"              "build.rs"

Write-Host ""
Write-Host "── Metadata ─────────────────────────────────────" -ForegroundColor Gray
Check-Exists "metadata\microsoft_store_metadata.md"  "Microsoft Store metadata"
Check-Exists "metadata\privacy_policy.md"            "Privacy policy"
Check-Exists "metadata\terms_of_use.md"              "Terms of use"
Check-Exists "metadata\icon_prompt.md"               "Icon prompt"
Check-Exists "metadata\screenshots_prompt.md"        "Screenshots prompt"
Check-Exists "metadata\feature_graphic_prompt.md"    "Feature graphic prompt"
Check-Exists "metadata\product_concept.md"           "Product concept"
Check-Exists "metadata\paid_value_notes.md"          "Paid value notes"

Write-Host ""
Write-Host "── node_modules ─────────────────────────────────" -ForegroundColor Gray
$nmPath = Join-Path $AppDir "node_modules"
if (Test-Path $nmPath) {
    Write-Host "  [PASS] node_modules/ installed" -ForegroundColor Green
    $PassCount++
} else {
    Write-Host "  [WARN] node_modules/ not installed  (run install-app.ps1)" -ForegroundColor Yellow
    $WarnCount++
}

# ── Check package.json scripts ────────────────────────────────────────────────
Write-Host ""
Write-Host "── package.json Scripts ─────────────────────────" -ForegroundColor Gray
$pkgPath = Join-Path $AppDir "package.json"
if (Test-Path $pkgPath) {
    $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
    foreach ($script in @("dev", "build", "tauri:dev", "tauri:build")) {
        if ($pkg.scripts.$script) {
            Write-Host "  [PASS] script: $script" -ForegroundColor Green
            $PassCount++
        } else {
            Write-Host "  [FAIL] script: $script  (missing from package.json)" -ForegroundColor Red
            $FailCount++
        }
    }
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  PASSED : $PassCount" -ForegroundColor Green
Write-Host "  WARNED : $WarnCount" -ForegroundColor Yellow
Write-Host "  FAILED : $FailCount" -ForegroundColor $(if ($FailCount -gt 0) { "Red" } else { "Gray" })
Write-Host "==================================================" -ForegroundColor Cyan

if ($FailCount -gt 0) {
    Write-Host ""
    Write-Host "[!] App has $FailCount missing required file(s). Fix before submitting to Store." -ForegroundColor Red
    exit 1
} else {
    Write-Host ""
    Write-Host "[OK] App structure check passed." -ForegroundColor Green
}
