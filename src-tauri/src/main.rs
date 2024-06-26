// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod scr_events;
mod scr_process;
mod star_cache;

use std::sync::{atomic::AtomicBool, Arc, Mutex};

use tauri::Window;

use crate::scr_events::AggregateScrEventsProvider;

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
        let mut _listen = AggregateScrEventsProvider::new(Arc::new(Mutex::new(move |event| {
            println!("event: {:?}", event);
            let window = window.lock().unwrap();
            window.emit("scr-event", event).unwrap();
        })));
    });
}

fn main() {
    tauri::Builder::default()
        .setup(|_app| Ok(()))
        .invoke_handler(tauri::generate_handler![init_process])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
