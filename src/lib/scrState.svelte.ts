import { listen } from "@tauri-apps/api/event"
import type { Event } from "@tauri-apps/api/helpers/event"
import type { ScrEvent } from "./tauri"
import { invoke } from "@tauri-apps/api"

export type ScrState = {
    gameRunning: boolean,
    port: number | null,
    user: {
        alias: string,
        gateway: number
    } | null,
    opponent: {
        alias: string,
        gateway: number
    } | null,
    map: string | null
}

export const scrState: ScrState = $state({
    gameRunning: false,
    opponent: null,
    port: null,
    user: null,
    map: null
})

// This function is used to convert the Rust event to a TypeScript event. The events are modeled
// in rust as an enum with a payload but idiomatic TypeScript would use a union type.
// For example, the Rust events:
//
// Event {
//     WebServerDown,
//     WebServerRunning { port: u16 },
// }
//
// should tranform into:
//
// type ScrEvent = {
//     name: 'WebServerDown',
// } | {
//     name: 'WebServerRunning',
//     payload: { port: number }
// }
const convertRustEvent = (ev: Event<object>): ScrEvent => {
    const name = typeof ev.payload === 'string' ? ev.payload : Object.keys(ev.payload)[0];
    const payload = typeof ev.payload === 'string' ? null : Object.values(ev.payload)[0]

    return {
        name,
        payload,
    } as ScrEvent;
}

export const configureReceiveTauriEvents = async () => {
    // Inform the rust backend to start generating events.
    await invoke('init_process');

    await listen('scr-event', (ev: Event<object>) => {
        const event = convertRustEvent(ev);

        if ('WebServerDown' === event.name) {
            scrState.port = null;
            scrState.gameRunning = false;
        } else if ('ProfileSelect' === event.name) {
            scrState.user = {
                alias: event.payload.alias,
                gateway: event.payload.gateway
            }
        } else if ('MatchFound' === event.name) {
            const opponent = event.payload.player1.alias === scrState.user?.alias
                && event.payload.player1.gateway === scrState.user?.gateway ?
                event.payload.player2 : event.payload.player1;

            scrState.opponent = {
                alias: opponent.alias,
                gateway: opponent.gateway
            }
            scrState.map = event.payload.map;
        } else if ('WebServerRunning' === event.name) {
            scrState.port = event.payload.port;
            scrState.gameRunning = true;
        } else if ('GameEnded' === event.name) {
            scrState.opponent = null;
            scrState.map = null;
        }
    });
};