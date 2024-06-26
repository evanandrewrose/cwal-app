// For defining the api exposed by tauri bindings.
export interface Player {
    alias: string;
    gateway: number;
}

export type ScrEvent = {
    name: 'ProfileSelect';
    payload: Player;
} | {
    name: 'MatchFound';
    payload: {
        player1: Player;
        player2: Player;
        map: string;
    };
} | {
    name: 'GameEnded';
} | {
    name: 'WebServerRunning';
    payload: {
        port: number;
    };
} | {
    name: 'WebServerDown';
}