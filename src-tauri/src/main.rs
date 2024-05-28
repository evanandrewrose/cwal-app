// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod scr_events;
mod star_cache;

use tauri::Window;

use crate::scr_events::ScrEventsReceiver;

// init a background process on the command, and emit periodic events only to the window that used the command
#[tauri::command]
fn init_process(window: Window) {
    std::thread::spawn(move || {
        let mut _listen = ScrEventsReceiver::listen(|entry| {
            window.emit("scr-event", entry).unwrap();
        });
    });
}

fn main() {
    tauri::Builder::default()
        .setup(|_app| Ok(()))
        .invoke_handler(tauri::generate_handler![init_process])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
