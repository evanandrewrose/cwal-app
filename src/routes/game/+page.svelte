<script lang="ts">
	import { scrState } from '$lib/scrState.svelte';
	import { getSCApi } from '$lib/scApi.svelte';

	let opponentStats = $derived.by(() => {
		if (scrState.opponent?.alias && scrState.opponent?.gateway) {
			return getSCApi()?.mapStatsByToon(scrState.opponent.alias, scrState.opponent.gateway);
		}
	});
</script>

<div class="w-full h-full flex items-center justify-center">
{#if !scrState.gameRunning}
	<div class="flex flex-col items-center justify-center w-full">
		<span class="loading loading-infinity loading-lg" />
		<h2>StarCraft does not appear to be running.</h2>
	</div>
{:else if scrState.opponent && scrState.user}
	<div class="flex flex-col items-center justify-center w-full">
		<h2>Game Found!</h2>
		<h3>Playing against {scrState.opponent.alias} on {scrState.opponent.gateway}</h3>
		<div class="flex flex-col items-center justify-center w-full">
			<h4>Opponent Stats</h4>
			<div>
					{#await opponentStats}
						<span class="loading loading-infinity loading-lg" />
					{:then opponentStats}
				<pre>
					{JSON.stringify(opponentStats?.map_stat)}
				</pre>
					{:catch error}
						<p>{error.message}</p>
					{/await}
			</div>
		</div>
	</div>
{:else}
	<div class="flex flex-col items-center justify-center w-full">
		<span class="loading loading-infinity loading-lg" />
		<h2>Waiting for a game to be found.</h2>
	</div>
{/if}
</div>
