import { SCApi, type BroodWarApiPath, type IBroodWarConnection } from 'bw-web-api';
import { getScrState } from '@/lib/scrState.svelte';
import { GravaticBooster, SCApiWithCaching } from 'gravatic-booster';
import {
    fetch as tauriFetch
} from '@tauri-apps/plugin-http';
import { LRUCache } from 'lru-cache';
import { getLimitsStore } from '@/lib/limits.svelte';

let limits = getLimitsStore();

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class TauriConnection implements IBroodWarConnection {
    constructor(private server: string) { }

    async fetch(path: BroodWarApiPath): Promise<string> {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        const shouldCache = !NO_CACHE_PREFIXES.some((p) => normalizedPath.startsWith(p));
        const key = `${this.server}${normalizedPath}`;
        if (shouldCache) {
            const cached = fetchCache.get(key);
            if (cached) {
                return cached;
            }
        }

        const maxAttempts = 10;
        let timeout = 1000;
        let response: Response | null = null;

        for (let i = 0; i < maxAttempts; i++) {
            await sleep(timeout * i);
            try {
                limits.numApiRequests++;
                response = await tauriFetch(key, {
                    headers: {
                        Accept: "application/json",
                    },
                    connectTimeout: timeout * (i + 1)
                });
            } catch (error) {
                if (error instanceof DOMException && error.name === "TimeoutError") {
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
                console.error("server error, retrying");
                continue; // these are retriable
            }

            // On success, cache if allowed (no TTL; evicts by LRU max)
            if (shouldCache) {
                fetchCache.set(key, text);
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

const NO_CACHE_PREFIXES = [
    '/web-api/v2/aurora-profile-by-toon',
    '/web-api/v1/leaderboard',
    '/web-api/v1/matchmaker-gameinfo-by-toon',
    '/web-api/v1/matchmaker-player-stat-by-toon',
];

const fetchCache = new LRUCache<string, string>({ max: 200 });

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