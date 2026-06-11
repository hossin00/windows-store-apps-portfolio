// File Rename Factory — Tauri backend
// Actual disk renames will be wired through Tauri commands that use std::fs::rename.
// See src/services/renameService.ts for the integration point.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
