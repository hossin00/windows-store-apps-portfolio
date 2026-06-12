// QR Barcode Studio — Tauri backend
// Code generation runs in the frontend (qrcode + jsbarcode libs in WASM-free JS).
// Add Tauri commands here when wiring native file save dialogs.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
