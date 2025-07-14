import { SCApi, type BroodWarApiPath, type IBroodWarConnection } from 'bw-web-api';
import { getScrState } from '@/lib/scrState.svelte';
import { GravaticBooster, SCApiWithCaching } from 'gravatic-booster';
import {
    fetch as tauriFetch
} from '@tauri-apps/plugin-http';

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class TauriConnection implements IBroodWarConnection {
    constructor(private server: string) { }

    async fetch(path: BroodWarApiPath): Promise<string> {
        const max_attempts = 10;
        let timeout = 1000;
        let response: Response | null = null;

        for (let i = 0; i < max_attempts; i++) {
            await sleep(timeout * i);
            try {
                console.log(`Request: ${this.server}/${path}`);
                response = await tauriFetch(`${this.server}/${path}`, {
                    headers: {
                        Accept: "application/json",
                    },
                    connectTimeout: timeout * (i + 1)
                });
            } catch (error) {
                if (error instanceof DOMException && error.name === "TimeoutError") {
                    console.log("timeout error, retrying");
                    continue; // these are retriable
                }
                throw error;
            }

            const text = await response.text();
            const textLower = text.toLowerCase();

            if (textLower.startsWith("<!doctype") ||
                textLower.startsWith("internal error") ||
                textLower.startsWith("internal server error")
            ) {
                console.log("server error, retrying");
                continue; // these are retriable
            }

            return text;
        }

        if (response) {
            throw Error(`Exceeded max retry attempt, status code: ${response.status} ${response.statusText}`);
        } else {
            throw Error("Exceeded max retry attempt, no response object.");
        }
    }
}

const createGB = async (port: number): Promise<GravaticBooster> =>
    await GravaticBooster.create(
        new SCApiWithCaching(
            new SCApi(
                new TauriConnection(`http://localhost:${port}`))));

const scrState = getScrState();

// Resolves when scrState.port is available
export const getGb = (): Promise<GravaticBooster> => {
    return new Promise((resolve) => {
        $effect(() => {
            if (scrState.port) {
                resolve(createGB(scrState.port));
            }
        });
    });
}