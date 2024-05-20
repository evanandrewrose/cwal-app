// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod scr_events;
mod star_cache;

use std::sync::{Arc, Mutex};

use tauri::Window;

use crate::scr_events::{ScrEvent, ScrEventsReceiver};

// the payload type must implement `Serialize` and `Clone`.
#[derive(Clone, serde::Serialize)]
struct AppEvent {
    message: String,
}

// init a background process on the command, and emit periodic events only to the window that used the command
#[tauri::command]
fn init_process(window: Window) {
    std::thread::spawn(move || {
        let mut _listen = ScrEventsReceiver::listen(|entry| {
            window
                .emit(
                    "scr-event",
                    entry
                )
                .unwrap();
        });
    });
}

fn main() {
    println!("Building tauri app");

    tauri::Builder::default()
        .setup(|_app| Ok(()))
        .invoke_handler(tauri::generate_handler![init_process])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    // detect close
    //app.handle_event(move |event| {
    //    if let CloseRequested { label, api, .. } = event {
    //        event_generator.stop();
    //    }
    //});

    println!("Tauri app built");
}
