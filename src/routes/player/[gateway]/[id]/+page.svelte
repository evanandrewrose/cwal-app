<script lang="ts">
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const { id, gateway } = data;
</script>

<svelte:head>
  <title>Player - {id} @ {gateway}</title>
  <meta name="description" content="Player details page" />
</svelte:head>

<div class="container mx-auto p-6">
  <div class="mb-6">
    <a href="/" class="text-blue-500 hover:text-blue-700 underline">
      ← Back to Search
    </a>
  </div>

  <div class="bg-gray-800 rounded-lg border p-6">
    <h1 class="text-2xl font-bold text-white mb-4">Player Details</h1>

    <div class="space-y-3">
      <div>
        <span class="text-gray-400">Player Name:</span>
        <span class="text-white ml-2 font-semibold">{id}</span>
      </div>

      <div>
        <span class="text-gray-400">Player ID:</span>
        <span class="text-white ml-2">{id}</span>
      </div>
    </div>

    <div class="mt-6 p-4 bg-gray-700 rounded border-l-4 border-blue-500">
      <p class="text-gray-300">
        Player details and statistics will be implemented here.
      </p>
    </div>
  </div>
</div>

<style>
</style>
