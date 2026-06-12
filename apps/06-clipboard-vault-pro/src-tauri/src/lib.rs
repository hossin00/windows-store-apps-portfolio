// Clipboard Vault Pro — Tauri backend
// Snippet storage lives in the frontend (browser localStorage). Wire the
// Tauri clipboard-manager plugin here when adding auto-capture from the OS.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
