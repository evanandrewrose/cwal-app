import { invoke } from "@tauri-apps/api/core";
import { appDataDir } from "@tauri-apps/api/path";
import { type GatewayId } from "gravatic-booster";
import { toast } from "svelte-sonner";

export interface SavedProfile {
  toon: string;
  gateway: GatewayId;
  lastViewed?: number; // timestamp
  race?: string;
  avatarUrl?: string;
}

export interface SavedPlayer {
  auroraId: number;
  alias: string;
  profiles: SavedProfile[];
  createdAt: number;
}

export class SavedPlayersStore {
  public players = $state<SavedPlayer[]>([]);

  private constructor(initialPlayers: SavedPlayer[]) {
    this.players = initialPlayers;
  }

  static create = async () => {
    const players = await SavedPlayersStore.loadPlayers();
    return new SavedPlayersStore(players);
  };

  static async getFilePath(): Promise<string> {
    const dataDir = await appDataDir();
    return `${dataDir}\\saved_players.json`;
  }

  private static loadPlayers = async (): Promise<SavedPlayer[]> => {
    try {
      const content = await invoke<string>("read_settings_file", {
        path: await this.getFilePath(),
      });

      if (content) {
        return JSON.parse(content) as SavedPlayer[];
      }
    } catch (error) {
      console.error("Failed to load saved players:", error);
    }
    return [];
  };

  private save = async () => {
    try {
      // Proxy objects from $state need to be snapshotted or stringified directly (JSON.stringify handles proxies usually)
      const content = JSON.stringify(this.players, null, 2);
      await invoke("write_settings_file", {
        path: await SavedPlayersStore.getFilePath(),
        content,
      });
    } catch (error) {
      console.error("Failed to save players:", error);
      toast.error("Failed to save player data");
    }
  };

  savePlayer = async (
    auroraId: number,
    alias: string,
    initialProfile?: SavedProfile,
  ) => {
    const existing = this.players.find((p) => p.auroraId === auroraId);
    if (existing) {
      existing.alias = alias;
      if (
        initialProfile &&
        !existing.profiles.some(
          (p) =>
            p.toon === initialProfile.toon &&
            p.gateway === initialProfile.gateway,
        )
      ) {
        existing.profiles.push(initialProfile);
      }
      toast.success(`Updated saved player: ${alias}`);
    } else {
      this.players.push({
        auroraId,
        alias,
        profiles: initialProfile ? [initialProfile] : [],
        createdAt: Date.now(),
      });
      toast.success(`Saved player: ${alias}`);
    }
    await this.save();
  };

  removePlayer = async (auroraId: number) => {
    const index = this.players.findIndex((p) => p.auroraId === auroraId);
    if (index !== -1) {
      const [removed] = this.players.splice(index, 1);
      await this.save();
      toast.success(`Removed saved player: ${removed.alias}`);
    }
  };

  addProfile = async (auroraId: number, profile: SavedProfile) => {
    await this.addProfiles(auroraId, [profile]);
  };

  setProfiles = async (auroraId: number, profiles: SavedProfile[]) => {
    const player = this.players.find((p) => p.auroraId === auroraId);
    if (player) {
      // Check if profiles have actually changed (ignoring lastSeen)
      // This prevents infinite loops in $effect blocks that call this method
      const simplify = (p: SavedProfile) =>
        `${p.gateway}:${p.toon}:${p.race ?? ""}:${p.avatarUrl ?? ""}`;
      const currentSet = new Set(player.profiles.map(simplify));
      const newSet = new Set(profiles.map(simplify));

      let hasChanges = currentSet.size !== newSet.size;
      if (!hasChanges) {
        for (const s of newSet) {
          if (!currentSet.has(s)) {
            hasChanges = true;
            break;
          }
        }
      }

      if (hasChanges) {
        player.profiles = profiles;
        await this.save();
      }
    }
  };

  addProfiles = async (auroraId: number, profiles: SavedProfile[]) => {
    const player = this.players.find((p) => p.auroraId === auroraId);
    if (player) {
      let changed = false;
      for (const profile of profiles) {
        const exists = player.profiles.some(
          (p) => p.toon === profile.toon && p.gateway === profile.gateway,
        );
        if (!exists) {
          player.profiles.push(profile);
          changed = true;
        }
      }
      if (changed) {
        await this.save();
      }
    }
  };

  renamePlayer = async (auroraId: number, newAlias: string) => {
    const player = this.players.find((p) => p.auroraId === auroraId);
    if (player) {
      player.alias = newAlias;
      await this.save();
      toast.success("Updated alias");
    }
  };

  isSaved(auroraId: number): boolean {
    return this.players.some((p) => p.auroraId === auroraId);
  }

  getPlayer(auroraId: number): SavedPlayer | undefined {
    return this.players.find((p) => p.auroraId === auroraId);
  }
}

let savedPlayersStore: SavedPlayersStore;

export const getSavedPlayersStore = async (): Promise<SavedPlayersStore> => {
  if (!savedPlayersStore) {
    savedPlayersStore = await SavedPlayersStore.create();
  }
  return savedPlayersStore;
};
