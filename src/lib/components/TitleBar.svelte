<script>
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import * as Menubar from "@/lib/components/ui/menubar";

  const window = getCurrentWindow();
</script>

<div class="z-10">
  <Menubar.Root
    class="flex justify-end bg-clip-border bg-[#000]"
    data-tauri-drag-region
  >
    <Menubar.Menu class="test">
      <button
        id="titlebar-minimize"
        title="minimize"
        onclick={() => window.minimize()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="M19 13H5v-2h14z" /><path> </path></svg
        >
      </button>
      <button
        id="titlebar-maximize"
        title="maximize"
        onclick={() => window.toggleMaximize()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="M4 4h16v16H4zm2 4v10h12V8z" />
        </svg>
      </button>
      <button id="titlebar-close" title="close" onclick={() => window.close()}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M13.46 12L19 17.54V19h-1.46L12 13.46L6.46 19H5v-1.46L10.54 12L5 6.46V5h1.46L12 10.54L17.54 5H19v1.46z"
          />
        </svg>
      </button>
    </Menubar.Menu>
  </Menubar.Root>
</div>
