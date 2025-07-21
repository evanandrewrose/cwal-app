<script lang="ts">
  import { onMount, tick } from "svelte";

  import type { Ranking } from "gravatic-booster";

  import PlayerSearch from "@/lib/components/PlayerSearch.svelte";
  import Race from "@/lib/components/icons/race.svelte";
  import Rank from "@/lib/components/icons/rank.svelte";
  import * as Table from "@/lib/components/ui/table";
  import { getGb } from "@/lib/scApi.svelte";
  import { avatarOrDefault, debounce } from "@/lib/utils";

  const gb = getGb();

  const PAGE_SIZE = 100;

  let rankings: Array<Ranking> = $state([]);
  let fetching = $state(false);
  let rankingsGenerator: AsyncGenerator<Ranking, void, unknown> | null = null;
  let scrollableDiv: HTMLDivElement;
  let selectedPlayerMode = $state(false); // after searching for someone
  let currentPlayerRank = $state<number | null>(null);
  let loadedRangeStart = $state<number | null>(null); // context range start
  let loadedRangeEnd = $state<number | null>(null); // context range end

  const handlePlayerSelect = async (name: string, gateway: string) => {
    try {
      fetching = true;
      const _gb = await gb;

      // Get the player's ranking to find their position
      const accountRankings = await _gb.accountRankingsByToon(
        name,
        { gateway: parseInt(gateway) },
        {},
      );

      const playerRanking = accountRankings.requestedRanking;

      if (playerRanking && playerRanking.rank) {
        await loadPlayersAroundRank(playerRanking.rank);
        selectedPlayerMode = true;
        currentPlayerRank = playerRanking.rank;
      }
    } finally {
      fetching = false;
    }
  };

  const resetLadderData = () => {
    selectedPlayerMode = false;
    currentPlayerRank = null;
    loadedRangeStart = null;
    loadedRangeEnd = null;
    rankings = [];
    rankingsGenerator = null;
    fetchMoreRankings();
  };

  const loadRankingsInRange = async (
    startRank: number,
    endRank: number,
  ): Promise<Ranking[]> => {
    const _gb = await gb;
    const rankingsGenerator = _gb.rankings(
      {},
      startRank - 1, // api is 0-indexed
      endRank - startRank + 1, // num to request
    );
    const newRankings: Ranking[] = [];

    for await (const ranking of rankingsGenerator) {
      newRankings.push(ranking);
    }

    return newRankings;
  };

  const loadPlayersAroundRank = async (targetRank: number) => {
    try {
      const startRank = Math.max(1, targetRank - PAGE_SIZE);
      const endRank = targetRank + PAGE_SIZE;

      const newRankings = await loadRankingsInRange(startRank, endRank);

      rankings = newRankings;
      loadedRangeStart = startRank;
      loadedRangeEnd = startRank + newRankings.length;

      await tick(); // ensure dom updates before we scroll to expected element

      const playerRow = document.querySelector(`[data-rank="${targetRank}"]`);
      if (playerRow) {
        playerRow.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (error) {
      console.error("Error loading players around rank:", error);
    }
  };

  const loadPreviousPage = async () => {
    if (loadedRangeStart === null) {
      return;
    }

    try {
      fetching = true;
      const newStartRank = Math.max(1, loadedRangeStart - PAGE_SIZE);
      const newEndRank = loadedRangeStart - 1;

      const newRankings = await loadRankingsInRange(newStartRank, newEndRank);

      if (newRankings.length > 0) {
        rankings = [...newRankings, ...rankings];
        loadedRangeStart = newStartRank;
      }
    } catch (error) {
      console.error("Error loading previous page:", error);
    } finally {
      fetching = false;
    }
  };

  const loadNextPage = async () => {
    if (!selectedPlayerMode || loadedRangeEnd === null || fetching) return;

    try {
      fetching = true;
      const newStartRank = loadedRangeEnd + 1;
      const newEndRank = loadedRangeEnd + PAGE_SIZE;

      const newRankings = await loadRankingsInRange(newStartRank, newEndRank);

      if (newRankings.length > 0) {
        rankings = [...rankings, ...newRankings];
        loadedRangeEnd = newStartRank + newRankings.length - 1;
      }
    } catch (error) {
      console.error("Error loading next page:", error);
    } finally {
      fetching = false;
    }
  };

  onMount(() => {
    fetchMoreRankings();
  });

  const onScroll = () => {
    if (fetching) {
      return;
    }

    const { scrollHeight, scrollTop, clientHeight } = scrollableDiv;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom > 200) {
      return;
    }

    if (selectedPlayerMode) {
      loadNextPage();
    } else {
      fetchMoreRankings();
    }
  };

  const fetchMoreRankings = debounce(async () => {
    const _gb = await gb;
    fetching = true;
    try {
      if (!rankingsGenerator) {
        rankingsGenerator = _gb.rankings({});
      }

      for (let i = 0; i < PAGE_SIZE; ++i) {
        const next = await rankingsGenerator.next();
        if (next.done) {
          break;
        }

        rankings.push(next.value!);
      }
    } finally {
      fetching = false;
    }
  }, 250);
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<div
  class="p-2 w-full h-full overflow-y-scroll unanchored"
  onscroll={onScroll}
  bind:this={scrollableDiv}
>
  <PlayerSearch onPlayerSelect={handlePlayerSelect} />

  {#if selectedPlayerMode && currentPlayerRank && loadedRangeStart && loadedRangeStart > 1}
    <div class="mb-4 p-3 bg-muted/20 rounded-lg border">
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted-foreground">
          Showing players around rank #{currentPlayerRank}
        </span>
        <div class="flex items-center gap-4">
          {#if loadedRangeStart && loadedRangeStart > 1}
            <button
              class="text-xs text-primary hover:text-primary/80 underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onclick={loadPreviousPage}
              disabled={fetching}
            >
              {#if fetching}
                Loading...
              {:else}
                Load more above
              {/if}
            </button>
          {/if}
          <button
            class="text-xs text-primary hover:text-primary/80 underline cursor-pointer"
            onclick={resetLadderData}
          >
            Show full ladder
          </button>
        </div>
      </div>
    </div>
  {/if}

  <Table.Root>
    <Table.Caption>
      StarCraft: Remastered Ladder
      {#if fetching}
        <span class="text-xs text-muted-foreground ml-2">(Loading...)</span>
      {/if}
    </Table.Caption>
    <Table.Header>
      <Table.Row>
        <Table.Head></Table.Head>
        <Table.Head>Player</Table.Head>
        <Table.Head>MMR</Table.Head>
        <Table.Head>Rank</Table.Head>
        <Table.Head>Wins</Table.Head>
        <Table.Head>Losses</Table.Head>
        <Table.Head>Disconnects</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each rankings as ranking}
        <Table.Row
          data-rank={ranking.rank}
          class={ranking.rank === currentPlayerRank
            ? "bg-primary/20 ring-1 ring-primary/50"
            : ""}
        >
          <Table.Cell>{ranking.rank}</Table.Cell>
          <Table.Cell class="min-w-max">
            <a
              class="min-w-max"
              href="/player/{ranking.gatewayId}/{ranking.toon}"
            >
              <div class="flex items-center space-x-3 min-w-max">
                <img
                  src={avatarOrDefault(ranking.avatar)}
                  alt="avatar"
                  class="w-12 h-12"
                />
                <div>
                  <div class="font-bold">{ranking.toon}</div>
                  <Race race={ranking.featureRace} />
                </div>
              </div>
            </a>
          </Table.Cell>
          <Table.Cell>{ranking.rating}</Table.Cell>
          <Table.Cell>
            <Rank rank={ranking.tier} />
          </Table.Cell>
          <Table.Cell>{ranking.wins}</Table.Cell>
          <Table.Cell>{ranking.losses}</Table.Cell>
          <Table.Cell>{ranking.disconnects}</Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>

<style>
  .unanchored {
    overflow-anchor: none;
  }
</style>
