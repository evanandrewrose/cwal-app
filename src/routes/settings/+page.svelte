<script lang="ts">
  import { onMount } from "svelte";

  import { FolderOpen, RotateCcw } from "@lucide/svelte";
  import { open } from "@tauri-apps/plugin-dialog";

  import { Button } from "@/lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/lib/components/ui/card";
  import { Input } from "@/lib/components/ui/input";
  import {
    type AppSettings,
    SettingsStore,
    getSettingsStore,
  } from "@/lib/settingsStore.svelte";
  import { debounce } from "@/lib/utils";

  const settingsStorePromise = getSettingsStore();

  let replayPath = $state("");
  let mapPath = $state("");

  let resolvedDefaults = $state<AppSettings | null>(null);

  onMount(async () => {
    const { settings } = await settingsStorePromise;
    replayPath = settings.replayDownloadPath;
    mapPath = settings.mapDownloadPath;
    resolvedDefaults = await SettingsStore.getDefaultSettings();
  });

  const setReplayDownloadPath = debounce(async (path: string) => {
    const settingsStore = await settingsStorePromise;
    if (path !== settingsStore.settings.replayDownloadPath) {
      settingsStore.updateReplayPath(path);
    }
  }, 1000);

  $effect(() => {
    setReplayDownloadPath(replayPath);
  });

  const setMapDownloadPath = debounce(async (path: string) => {
    const settingsStore = await settingsStorePromise;
    if (path !== settingsStore.settings.mapDownloadPath) {
      settingsStore.updateMapPath(path);
    }
  }, 1000);

  $effect(() => {
    setMapDownloadPath(mapPath);
  });

  const resetToDefaults = async () => {
    const store = await settingsStorePromise;
    await store.resetToDefaults();
    replayPath = store.settings.replayDownloadPath;
    mapPath = store.settings.mapDownloadPath;
  };

  const resetReplayPath = async () => {
    if (resolvedDefaults) {
      replayPath = resolvedDefaults.replayDownloadPath;
    }
  };

  const resetMapPath = async () => {
    if (resolvedDefaults) {
      mapPath = resolvedDefaults.mapDownloadPath;
    }
  };

  const selectReplayFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        defaultPath: replayPath || undefined,
      });

      if (selected && typeof selected === "string") {
        replayPath = selected;
      }
    } catch (error) {
      console.error("Failed to open folder picker:", error);
    }
  };

  const selectMapFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        defaultPath: mapPath || undefined,
      });

      if (selected && typeof selected === "string") {
        mapPath = selected;
      }
    } catch (error) {
      console.error("Failed to open folder picker:", error);
    }
  };
</script>

<div class="w-full h-[100vh] overflow-y-scroll scroll-smooth pb-8">
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Settings</h1>
      <p class="text-muted-foreground">
        Configure your download locations and preferences.
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Download Locations</CardTitle>
        <CardDescription>
          Set where replays and maps should be downloaded to.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium" for="replay-path">
              Replay Download Path
            </label>
            <div class="flex items-center gap-2">
              <Button
                onclick={resetReplayPath}
                variant="ghost"
                size="sm"
                disabled={!resolvedDefaults ||
                  replayPath === resolvedDefaults.replayDownloadPath}
                class="h-6 px-2 text-xs cursor-pointer"
              >
                <RotateCcw class="size-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>
          <div class="flex gap-2">
            <Input
              id="replay-path"
              bind:value={replayPath}
              placeholder="C:\Users\YourName\Documents\StarCraft\Maps\Replays\CWAL"
              class="flex-1"
            />
            <Button
              onclick={selectReplayFolder}
              variant="outline"
              size="sm"
              class="px-3"
              title="Browse for folder"
            >
              <FolderOpen class="size-4" />
            </Button>
          </div>
          <p class="text-xs text-muted-foreground">
            {#if resolvedDefaults}
              Default: {resolvedDefaults.replayDownloadPath}
            {:else}
              Default: Loading...
            {/if}
          </p>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium" for="map-path">
              Map Download Path
            </label>
            <div class="flex items-center gap-2">
              <Button
                onclick={resetMapPath}
                variant="ghost"
                size="sm"
                disabled={!resolvedDefaults ||
                  mapPath === resolvedDefaults.mapDownloadPath}
                class="h-6 px-2 text-xs cursor-pointer"
              >
                <RotateCcw class="size-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>
          <div class="flex gap-2">
            <Input
              id="map-path"
              bind:value={mapPath}
              placeholder="C:\Users\YourName\Documents\StarCraft\Maps\CWAL"
              class="flex-1"
            />
            <Button
              onclick={selectMapFolder}
              variant="outline"
              size="sm"
              class="px-3"
              title="Browse for folder"
            >
              <FolderOpen class="size-4" />
            </Button>
          </div>
          <p class="text-xs text-muted-foreground">
            {#if resolvedDefaults}
              Default: {resolvedDefaults.mapDownloadPath}
            {:else}
              Default: Loading...
            {/if}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</div>
