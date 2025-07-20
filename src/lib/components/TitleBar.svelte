<script>
  import { MinusIcon, SquareIcon, XIcon } from "@lucide/svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";

  import { Button } from "@/lib/components/ui/button";
  import * as Menubar from "@/lib/components/ui/menubar";

  const window = getCurrentWindow();
</script>

<div class="z-10">
  <Menubar.Root
    class="flex justify-end bg-clip-border rounded-b-none"
    data-tauri-drag-region
  >
    <Menubar.Menu>
      <Button
        onclick={() => window.minimize()}
        variant="ghost"
        size="icon"
        class="size-8"
      >
        <MinusIcon />
      </Button>
      <Button
        onclick={() => window.toggleMaximize()}
        variant="ghost"
        size="icon"
        class="size-8"
      >
        <SquareIcon />
      </Button>
      <Button
        onclick={() => window.close()}
        variant="ghost"
        size="icon"
        class="size-8"
      >
        <XIcon />
      </Button>
    </Menubar.Menu>
  </Menubar.Root>
</div>
