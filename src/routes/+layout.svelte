<script>
	import './styles.css';
	import Menu from '$lib/components/menu.svelte';
	import { configureReceiveTauriEvents } from '$lib/scrState.svelte';

	$effect.pre(() => {
		configureReceiveTauriEvents();
	})
</script>

<div class="app flex-row flex h-full">
	<Menu />
	<main class="w-full h-full">
		<slot />
	</main>
</div>

<style>
</style>