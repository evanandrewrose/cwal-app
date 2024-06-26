import { BroodWarConnection, SCApi } from 'bw-web-api';
import { scrState } from './scrState.svelte';

const scapiFromPort = (port: number | null) =>
    port != null ? new SCApi(new BroodWarConnection(`http://localhost:${port}`)) : null;

const scapi = $derived(scapiFromPort(scrState.port));

/**
 * Call this to get the SCApi object, which is used to interact with the SC:R api.
 * 
 * @returns The SCApi object, or null if the port is not open.
 */
export const getSCApi = () => scapi;