<script lang="ts">
  import { onMount } from "svelte";

  import { goto } from "$app/navigation";

  onMount(() => {
    goto("/search", { replaceState: true });
  });
</script>

<svelte:head>
  <title>CWAL</title>
  <meta name="description" content="StarCraft Remastered player statistics" />
</svelte:head>

<!-- This page redirects to /search -->
