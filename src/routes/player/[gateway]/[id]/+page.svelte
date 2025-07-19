<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import type { GravaticBooster, Match, Ranking } from "gravatic-booster";

  import * as Avatar from "@/lib/components/ui/avatar";
  import * as Card from "@/lib/components/ui/card";
  import * as Table from "@/lib/components/ui/table";
  import { getGb } from "@/lib/scApi.svelte";
  import { avatarOrDefault } from "@/lib/utils";

  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  let id: string = $derived(data.id);
  let gateway: string = $derived(data.gateway);

  const MATCH_FETCH_NUM = 15;

  const gb = getGb();

  let profile: Awaited<
    ReturnType<
      typeof GravaticBooster.prototype.minimalAccountWithGamesPlayedLastWeek
    >
  > | null = $state(null);
  let ranking: Ranking | null = $state(null);
  let avatar = $derived.by(() => avatarOrDefault(ranking?.avatar));
  let matchesGenerator: AsyncGenerator<Match, void, void> | null = null;
  let matches: Match[] = $state([]);
  let scrollableDiv: HTMLDivElement | null = $state(null);

  const fetchMoreMatches = async () => {
    if (!matchesGenerator) {
      return;
    }
    for (let i = 0; i < MATCH_FETCH_NUM; ++i) {
      const next = await matchesGenerator.next();
      if (next.done) {
        break;
      }

      matches.push(next.value!);
    }
  };

  const onScroll = () => {
    if (!scrollableDiv) {
      return;
    }

    const { scrollHeight, scrollTop, clientHeight } = scrollableDiv;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom <= 200) {
      fetchMoreMatches();
    }
  };

  afterNavigate(async () => {
    matches = [];
    const _gb = await gb;
    profile = await _gb.minimalAccountWithGamesPlayedLastWeek(id, {
      gateway: Number.parseInt(gateway),
    });
    const leaderboard = await _gb.leaderboard({
      seasonId: profile.currentSeason,
    });
    ranking = (await profile.requestedProfile?.ranking(leaderboard.id)) ?? null;
    matchesGenerator = (await profile.requestedProfile?.ladderGames()) ?? null;
    await fetchMoreMatches();
  });
</script>

<svelte:head>
  <title>Player - {id} @ {gateway}</title>
  <meta name="description" content="Player details page" />
</svelte:head>

{#key id + gateway}
  <div
    class="block p-2 w-full h-[100vh] overflow-y-scroll scroll-smooth unanchored"
    onscroll={onScroll}
    bind:this={scrollableDiv}
  >
    <div class="flex flex-col gap-2">
      <Card.Root>
        <Card.Header>
          <div class="flex items-center space-x-4">
            <Avatar.Root>
              <Avatar.Image src={avatar} alt="Player Avatar" />
              <Avatar.Fallback>{id}</Avatar.Fallback>
            </Avatar.Root>
            <div>
              <h1 class="text-xl font-bold">{id}</h1>
              <p class="text-sm text-gray-500">Gateway: {gateway}</p>
            </div>
          </div>
        </Card.Header>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <h2 class="text-lg font-semibold">Matches</h2>
        </Card.Header>
        <Card.Content>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Timestamp</Table.Head>
                <Table.Head>Map</Table.Head>
                <Table.Head>Opponent</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each matches as match}
                <Table.Row>
                  <Table.Cell>{match.timestamp?.toLocaleString()}</Table.Cell>
                  <Table.Cell>{match.map.displayName}</Table.Cell>
                  <Table.Cell
                    ><a
                      href="/player/{match.opponent?.profileInfo
                        ?.gatewayId}/{match.opponent?.toon}"
                      >{match.opponent?.toon}</a
                    ></Table.Cell
                  >
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
{/key}
