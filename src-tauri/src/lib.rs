#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Emitter;
mod scr_events;
mod scr_process;

use std::sync::{atomic::AtomicBool, Arc, Mutex};

use scr_events::ScrProcessEventProvider;
use tauri::Window;

// Esnure that the background process is only initialized once.
static INITIALIZED: AtomicBool = AtomicBool::new(false);

// Initialize the background processes that notify the frontend about SC:R events.
#[tauri::command]
fn init_process(window: Window) {
    if INITIALIZED.load(std::sync::atomic::Ordering::Relaxed) {
        return;
    }

    INITIALIZED.store(true, std::sync::atomic::Ordering::Relaxed);

    std::thread::spawn(move || {
        let window = Mutex::new(Arc::new(window));
        let mut _listen = ScrProcessEventProvider::new(Arc::new(Mutex::new(move |event| {
            println!("event: {:?}", event);
            let window = window.lock().unwrap();
            window.emit("scr-event", event).unwrap();
        })));
    });
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .setup(|_app| Ok(()))
        .invoke_handler(tauri::generate_handler![init_process])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
