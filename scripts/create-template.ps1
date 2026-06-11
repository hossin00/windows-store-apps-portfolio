################################################################################
# create-template.ps1
# Creates the reusable premium Windows desktop app template
# Usage: .\scripts\create-template.ps1
################################################################################
$ErrorActionPreference = "Stop"

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root       = Split-Path -Parent $ScriptDir
$TemplateDir = Join-Path $Root "shared\template"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Creating Windows Premium Tools Template" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# ── Verify Node is available ──────────────────────────────────────────────────
try {
    $nodeVersion = & node -v 2>&1
    Write-Host "[OK] Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found. Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

try {
    $npmVersion = & npm -v 2>&1
    Write-Host "[OK] npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm not found." -ForegroundColor Red
    exit 1
}

# ── Verify Rust/Cargo is available ────────────────────────────────────────────
try {
    $cargoVersion = & cargo --version 2>&1
    Write-Host "[OK] Cargo: $cargoVersion" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Cargo/Rust not found. Tauri builds will require Rust." -ForegroundColor Yellow
    Write-Host "       Install from: https://rustup.rs" -ForegroundColor Yellow
    Write-Host "       Continuing with frontend template creation..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Template directory: $TemplateDir" -ForegroundColor Gray

# ── package.json ──────────────────────────────────────────────────────────────
Write-Host "[1/8] Creating package.json..." -ForegroundColor Cyan
$packageJson = @'
{
  "name": "windows-premium-tools-template",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.27.0",
    "react-dropzone": "^14.3.5",
    "lucide-react": "^0.460.0",
    "date-fns": "^4.1.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.1.0",
    "@tauri-apps/api": "^2.1.1",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/uuid": "^10.0.0",
    "@vitejs/plugin-react": "^4.3.3",
    "typescript": "^5.6.3",
    "vite": "^6.0.1",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
'@
Set-Content -Path (Join-Path $TemplateDir "package.json") -Value $packageJson -Encoding UTF8
Write-Host "   package.json created" -ForegroundColor Gray

# ── vite.config.ts ────────────────────────────────────────────────────────────
Write-Host "[2/8] Creating vite.config.ts..." -ForegroundColor Cyan
$viteConfig = @'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: process.env.TAURI_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
'@
Set-Content -Path (Join-Path $TemplateDir "vite.config.ts") -Value $viteConfig -Encoding UTF8

# ── tsconfig.json ─────────────────────────────────────────────────────────────
$tsconfig = @'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
'@
Set-Content -Path (Join-Path $TemplateDir "tsconfig.json") -Value $tsconfig -Encoding UTF8

$tsconfigNode = @'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
'@
Set-Content -Path (Join-Path $TemplateDir "tsconfig.node.json") -Value $tsconfigNode -Encoding UTF8

# ── index.html ────────────────────────────────────────────────────────────────
Write-Host "[3/8] Creating index.html..." -ForegroundColor Cyan
$indexHtml = @'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>APP_NAME_PLACEHOLDER</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@
Set-Content -Path (Join-Path $TemplateDir "index.html") -Value $indexHtml -Encoding UTF8

# ── src/main.tsx ──────────────────────────────────────────────────────────────
Write-Host "[4/8] Creating src/main.tsx..." -ForegroundColor Cyan
$mainTsx = @'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
'@
Set-Content -Path (Join-Path $TemplateDir "src\main.tsx") -Value $mainTsx -Encoding UTF8

# ── src/index.css ─────────────────────────────────────────────────────────────
$indexCss = @'
@import "tailwindcss";

* { box-sizing: border-box; }

body {
  font-family: "Inter", system-ui, sans-serif;
  background-color: #0f1117;
  color: #f1f5f9;
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100vh;
  -webkit-font-smoothing: antialiased;
}

html.light body {
  background-color: #f8fafc;
  color: #0f172a;
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #252d3d; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #2d3748; }

@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

.animate-fade-in  { animation: fade-in 0.2s ease; }
.animate-slide-in { animation: slide-in 0.25s ease; }
.animate-spin     { animation: spin 0.8s linear infinite; }
.pulse-dot        { animation: pulse-dot 1.2s ease-in-out infinite; }
'@
Set-Content -Path (Join-Path $TemplateDir "src\index.css") -Value $indexCss -Encoding UTF8

# ── src-tauri scaffold ────────────────────────────────────────────────────────
Write-Host "[5/8] Creating src-tauri scaffold..." -ForegroundColor Cyan

$tauriConf = @'
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "APP_NAME_PLACEHOLDER",
  "version": "1.0.0",
  "identifier": "PACKAGE_NAME_PLACEHOLDER",
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist"
  },
  "app": {
    "withGlobalTauri": false,
    "windows": [
      {
        "title": "APP_NAME_PLACEHOLDER",
        "width": 1280,
        "height": 800,
        "minWidth": 900,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "center": true,
        "decorations": true,
        "transparent": false
      }
    ]
  },
  "bundle": {
    "active": true,
    "targets": "msi",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    }
  }
}
'@
Set-Content -Path (Join-Path $TemplateDir "src-tauri\tauri.conf.json") -Value $tauriConf -Encoding UTF8

$cargoToml = @'
[package]
name = "app-template"
version = "1.0.0"
description = "Windows Premium Tools Template"
authors = ["KART L"]
edition = "2021"

[lib]
name = "app_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
'@
Set-Content -Path (Join-Path $TemplateDir "src-tauri\Cargo.toml") -Value $cargoToml -Encoding UTF8

$mainRs = @'
// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    app_lib::run();
}
'@
Set-Content -Path (Join-Path $TemplateDir "src-tauri\src\main.rs") -Value $mainRs -Encoding UTF8

$libRs = @'
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
'@
Set-Content -Path (Join-Path $TemplateDir "src-tauri\src\lib.rs") -Value $libRs -Encoding UTF8

$buildRs = @'
fn main() {
    tauri_build::build()
}
'@
Set-Content -Path (Join-Path $TemplateDir "src-tauri\build.rs") -Value $buildRs -Encoding UTF8

# ── .gitignore ────────────────────────────────────────────────────────────────
$gitignore = @'
node_modules/
dist/
dist-ssr/
*.local
src-tauri/target/
src-tauri/WixTools/
.env
.env.local
*.pem
'@
Set-Content -Path (Join-Path $TemplateDir ".gitignore") -Value $gitignore -Encoding UTF8

Write-Host "[6/8] Creating shared context files..." -ForegroundColor Cyan
# ── Context files are written by the App.tsx / context creation step ──────────
# (They are injected at create-app time from the shared template source)

Write-Host "[7/8] Creating metadata placeholder files..." -ForegroundColor Cyan
$metaFiles = @(
    "microsoft_store_metadata.md",
    "privacy_policy.md",
    "terms_of_use.md",
    "icon_prompt.md",
    "screenshots_prompt.md",
    "feature_graphic_prompt.md",
    "product_concept.md",
    "paid_value_notes.md"
)
foreach ($f in $metaFiles) {
    $metaPath = Join-Path $TemplateDir "metadata\$f"
    if (-not (Test-Path $metaPath)) {
        Set-Content -Path $metaPath -Value "# $f`n`n_To be filled when scaffolding a specific app._`n" -Encoding UTF8
    }
}

Write-Host "[8/8] Template scaffold complete." -ForegroundColor Cyan
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Template created at: shared\template\" -ForegroundColor Green
Write-Host "  Next: run create-app.ps1 to scaffold App 01" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
