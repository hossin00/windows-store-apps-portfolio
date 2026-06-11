// PDF Master Kit — Tauri backend
// PDF processing runs in the frontend (pdf-lib WASM).
// Add Tauri commands here when adding native file dialogs or sidecar tooling.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
