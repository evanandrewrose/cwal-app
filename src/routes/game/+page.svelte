<script lang="ts">
	import { scrState } from '$lib/scrState.svelte';
</script>

<div class="w-full h-full flex items-center justify-center">
{#if !scrState.gameRunning}
	<div class="flex flex-col items-center justify-center w-full">
		<span class="loading loading-infinity loading-lg" />
		<h2>StarCraft does not appear to be running.</h2>
	</div>
{:else}
	<div class="flex flex-col items-center justify-center w-full">
		<span class="loading loading-infinity loading-lg" />
		<h2>Waiting for a game to be found.</h2>
	</div>
{/if}
</div>
