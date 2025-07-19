<script lang="ts">
  import { ModeWatcher } from "mode-watcher";

  import TitleBar from "@/lib/components/TitleBar.svelte";
  import AppSidebar from "@/lib/components/app-sidebar.svelte";
  import * as Sidebar from "@/lib/components/ui/sidebar";
  import { configureReceiveTauriEvents } from "@/lib/scrState.svelte";

  let { children } = $props();

  $effect.pre(() => {
    const unlisten = configureReceiveTauriEvents();
    return async () => {
      (await unlisten)();
    };
  });
</script>

<ModeWatcher />

<svelte:head>
  <title>CWAL Desktop App</title>
  <meta name="description" content="CWAL Desktop App" />
</svelte:head>

<div class="flex flex-col-reverse w-full h-[100vh] overflow-hidden">
  <div class="flex min-h-0">
    <Sidebar.Provider>
      <AppSidebar />
      <main class="w-full">
        {@render children?.()}
      </main>
    </Sidebar.Provider>
  </div>
  <TitleBar />
</div>
