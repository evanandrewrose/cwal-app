<script lang="ts">
  import { configureReceiveTauriEvents } from "@/lib/scrState.svelte";
  import { ModeWatcher } from "mode-watcher";
  let { children } = $props();

  $effect.pre(() => {
    const unlisten = configureReceiveTauriEvents();
    return async () => {
      (await unlisten)();
    };
  });
</script>

<ModeWatcher />

{@render children?.()}
