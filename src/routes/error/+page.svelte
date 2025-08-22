<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  import { Button } from "@/lib/components/ui/button";
  import * as Card from "@/lib/components/ui/card";

  const goBack = () => {
    const fromParam = page.url.searchParams.get("from");
    if (fromParam) {
      // If we have a from parameter, try to go back to a safe page
      goto("/search");
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      goto("/search");
    }
  };

  const goHome = () => {
    goto("/search");
  };

  const retryPage = () => {
    const fromParam = page.url.searchParams.get("from");
    if (fromParam) {
      goto(fromParam);
    } else {
      window.location.reload();
    }
  };
</script>

<svelte:head>
  <title>Something went wrong - CWAL App</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-6">
  <Card.Root class="w-full max-w-md">
    <Card.Header class="text-center">
      <Card.Title class="text-2xl font-bold text-destructive">
        Something went wrong
      </Card.Title>
      <Card.Description>
        We encountered an unexpected error while loading this page.
      </Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div class="text-center space-y-2">
        <p class="text-sm text-muted-foreground">
          This usually happens when there's an issue with the game data or
          StarCraft API.
        </p>
        <p class="text-xs text-muted-foreground">
          The player might not exist or there could be a temporary server issue.
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <Button onclick={retryPage} class="w-full">Try Again</Button>
        <div class="flex gap-2">
          <Button onclick={goBack} variant="outline" class="flex-1">
            Go Back
          </Button>
          <Button onclick={goHome} variant="outline" class="flex-1">
            Search
          </Button>
        </div>
      </div>
    </Card.Content>
  </Card.Root>
</div>
