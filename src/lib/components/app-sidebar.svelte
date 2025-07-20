<script lang="ts">
  import MapIcon from "@lucide/svelte/icons/map";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import LadderIcon from "@lucide/svelte/icons/waves-ladder";

  import * as Sidebar from "@/lib/components/ui/sidebar";

  const items = [
    {
      title: "Ladder",
      url: "/ladder",
      icon: LadderIcon,
    },
    {
      title: "Maps",
      url: "/maps",
      icon: MapIcon,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
  ];
</script>

<Sidebar.Root>
  <div class="flex flex-col" style="height: 100%;">
    <div class="flex-1">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {#each items as item (item.title)}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton>
                  {#snippet child({ props })}
                    <a href={item.url} {...props}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  {/snippet}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            {/each}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </div>
    <div class="flex-shrink-0 p-3 bg-blue-500 text-white rounded m-2">
      <p class="text-sm font-bold">Test content</p>
    </div>
  </div>
</Sidebar.Root>
