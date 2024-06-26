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

export const configureReceiveTauriEvents = async () => {
    await invoke('init_process');

    await listen('scr-event', (ev: Event<object>) => {
        console.log(ev);
        // get only key on the paylaod
        const eventName = typeof ev.payload === 'string' ? ev.payload : Object.keys(ev.payload)[0];

        // convert from rust serialized event to typescript union type
        const event = {
            name: eventName,
            payload: typeof ev.payload === 'string' ? null : ev.payload
        } as ScrEvent;

        if ('WebServerRunning' !== event.name) {
            // (too noisy otherwise)
            console.log(event);
        }

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
        }
    });
    console.log('listener done');
};