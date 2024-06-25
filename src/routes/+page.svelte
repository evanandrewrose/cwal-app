<script lang="ts">
	import { invoke } from '@tauri-apps/api/tauri';
	import { listen } from '@tauri-apps/api/event';
	import { onDestroy } from 'svelte';
	import { SCApi, BroodWarConnection } from 'bw-web-api';

	let unlisten: () => void;

	(async () => {
		unlisten = await listen('scr-event', (event: any) => {
			console.log('click event', event.payload);

			if (event.payload.ProfileSelect) {
				ourAlias = event.payload.ProfileSelect.alias;
				ourGateway = event.payload.ProfileSelect.gateway;
			} else if (event.payload.MatchFound) {
				player1Alias = event.payload.MatchFound.player1.alias;
				player1Gateway = event.payload.MatchFound.player1.gateway;
				player2Alias = event.payload.MatchFound.player2.alias;
				player2Gateway = event.payload.MatchFound.player2.gateway;
				map = event.payload.MatchFound.map;
			} else if (event.payload.WebServerRunning) {
				port = event.payload.WebServerRunning.port;
			}
		});
	})();

	onDestroy(() => {
		if (unlisten) {
			unlisten();
		}
	});

	let ourAlias = $state(null);
	let ourGateway = $state(null);

	let player1Alias = $state(null);
	let player1Gateway = $state(null);

	let player2Alias = $state(null);
	let player2Gateway = $state(null);

	let map = $state(null);
	let port: number | null = $state(null);

	let scapi = $derived(port && new SCApi(new BroodWarConnection(`http://localhost:${port}`)));

	let searchValue = $state('');
	let searchResults = $state([]);

	$effect(async () => {
		if (searchValue) {
			try {
				const result = await scapi?.leaderboardNameSearch(12960, searchValue);
				searchResults = result;
			} catch (e) {
				console.error(e);
				searchResults = [];
			}
		} else {
			searchResults = [];
		}
	});

	invoke('init_process');
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>


<div class="dropdown">
	<input type="text" class="grow" placeholder="Search" bind:value={searchValue} />
	<ul class="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
		{#each searchResults as result}
			<li>{result.name}</li>
		{/each}
	</ul>
</div>


<section>
	<table border="1">
		<tbody>
			<tr>
				<td>Our Alias</td>
				<td>{ourAlias}</td>
			</tr>
			<tr>
				<td>Our Gateway</td>
				<td>{ourGateway}</td>
			</tr>
			<tr>
				<td>Port</td>
				<td>{port}</td>
			</tr>
		</tbody>
	</table>
</section>
<section>
	<table border="1">
		<tbody>
			<tr>
				<td>Player 1</td>
				<td>{player1Alias}</td>
				<td>{player1Gateway}</td>
			</tr>
			<tr>
				<td>Player 2</td>
				<td>{player2Alias}</td>
				<td>{player2Gateway}</td>
			</tr>
			<tr>
				<td>Map</td>
				<td>{map}</td>
			</tr>
		</tbody>
	</table>
</section>

<style>
</style>
