<script lang="ts">
  import { Circle, Wifi, WifiOff } from "@lucide/svelte";

  import { GameServerState, getScrState } from "@/lib/scrState.svelte";

  const scrState = getScrState();

  const getStatusConfig = (state: GameServerState, port: number | null) => {
    switch (state) {
      case GameServerState.Running:
        return {
          text: "StarCraft Connected",
          subtext: `API Port: ${port}`,
          icon: Wifi,
          bgColor: "bg-green-500",
          textColor: "text-green-100",
          iconColor: "text-green-200",
          pulseColor: "bg-green-400",
        };
      case GameServerState.NotRunning:
        return {
          text: "StarCraft Offline",
          subtext: "Launch StarCraft...",
          icon: WifiOff,
          bgColor: "bg-red-500",
          textColor: "text-red-100",
          iconColor: "text-red-200",
          pulseColor: "bg-red-400",
        };
      case GameServerState.Indeterminate:
      default:
        return {
          text: "Checking Status",
          subtext: "Detecting game...",
          icon: Circle,
          bgColor: "bg-yellow-500",
          textColor: "text-yellow-100",
          iconColor: "text-yellow-200",
          pulseColor: "bg-yellow-400",
        };
    }
  };

  let statusConfig = $derived(
    getStatusConfig(scrState.gameServerState, scrState.port),
  );
</script>

<div class="relative overflow-hidden rounded-lg p-4 {statusConfig.bgColor}">
  <div class="absolute inset-0 opacity-30">
    <div class="h-full w-full {statusConfig.pulseColor} animate-pulse"></div>
  </div>

  <div class="relative flex items-center gap-3">
    <div class="flex-shrink-0">
      <statusConfig.icon class="size-5 {statusConfig.iconColor}" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium {statusConfig.textColor} truncate">
        {statusConfig.text}
      </p>
      <p class="text-xs {statusConfig.textColor} opacity-90 truncate">
        {statusConfig.subtext}
      </p>
    </div>
  </div>
</div>
