// For defining the api exposed by tauri bindings.
export type ScrEvent = {
    name: 'WebServerRunning';
    payload: {
        port: number;
    };
} | {
    name: 'WebServerDown';
}