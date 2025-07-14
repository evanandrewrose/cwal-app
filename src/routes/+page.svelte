<script lang="ts">
  import { type UnlistenFn } from "@tauri-apps/api/event";
  import { onDestroy } from "svelte";
  import { getGb } from "$lib/scApi.svelte";
  import { configureReceiveTauriEvents } from "$lib/scrState.svelte";
  import type { GravaticBooster, PlayerSearchResult } from "gravatic-booster";

  let port: number | null = $state(null);
  let unlisten: Promise<UnlistenFn> | null = null;
  let gb: Promise<GravaticBooster>;

  $effect.pre(() => {
    unlisten = configureReceiveTauriEvents();
    gb = getGb();
  });

  onDestroy(async () => {
    if (unlisten) {
      (await unlisten)();
    }
  });

  let searchResults: PlayerSearchResult[] = $state([]);
  let searchValue: string = $state("");

  const playerSearch = async (searchValue: string) => {
    const _gb = await gb;
    console.log(searchValue);
    const current = await _gb.currentSeason();
    console.log(current);
    try {
      searchResults = await _gb.playerSearch(searchValue);
    } catch (e) {
      searchResults = [];
      console.error(e);
    }
  };
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="dropdown">
  <input
    type="text"
    class="grow"
    placeholder="Search"
    bind:value={searchValue}
    oninput={() => playerSearch(searchValue)}
  />
  <ul
    class="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
  >
    {#each searchResults as searchResult}
      <li>{searchResult.name}</li>
    {/each}
  </ul>
</div>

<section>
  <table border="1">
    <tbody>
      <tr>
        <td>Port</td>
        <td>{port}</td>
      </tr>
    </tbody>
  </table>
</section>

<style>
</style>
