// PDF OCR Desk — Tauri backend
// OCR processing runs in the frontend (Tesseract.js WASM or Windows OCR API via invoke).
// Add Tauri commands here when connecting a real OCR sidecar or plugin.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
