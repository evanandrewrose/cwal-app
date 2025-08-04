import { invoke } from '@tauri-apps/api/core';
import { appDataDir, homeDir } from '@tauri-apps/api/path';
import { toast } from 'svelte-sonner';

export interface AppSettings {
    replayDownloadPath: string;
    mapDownloadPath: string;
    hideShortReplays: boolean;
}

class SettingsStore {
    private _settings = $state<AppSettings>({
        replayDownloadPath: '',
        mapDownloadPath: '',
        hideShortReplays: true
    });

    private _initialized = $state(false);
    private settingsFilePath: string = '';

    constructor() {
        this.initialize();
    }

    get settings(): AppSettings {
        return this._settings;
    }

    get initialized(): boolean {
        return this._initialized;
    }

    private initialize = async () => {
        try {
            const appData = await appDataDir();
            this.settingsFilePath = `${appData}settings.json`;

            await this.loadSettings();
            this._initialized = true;
        } catch (error) {
            console.error('Failed to initialize settings store:', error);
            await this.setDefaults();
            this._initialized = true;
        }
    }

    private loadSettings = async () => {
        try {
            const content = await invoke<string>('read_settings_file', {
                path: this.settingsFilePath
            });

            if (content) {
                const savedSettings = JSON.parse(content) as Partial<AppSettings>;

                const defaults = await this.getDefaultSettings();
                this._settings = { ...defaults, ...savedSettings };
            } else {
                await this.setDefaults();
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            await this.setDefaults();
        }
    }

    private setDefaults = async () => {
        this._settings = await this.getDefaultSettings();
        await this.saveSettings();
    }

    private getDefaultSettings = async (): Promise<AppSettings> => {
        try {
            const home = await homeDir();
            return {
                replayDownloadPath: `${home}\\Documents\\StarCraft\\Maps\\Replays\\CWAL`,
                mapDownloadPath: `${home}\\Documents\\StarCraft\\Maps\\CWAL`,
                hideShortReplays: true
            };
        } catch (error) {
            console.error('Failed to get home directory:', error);
            return {
                replayDownloadPath: 'C:\\Users\\Documents\\StarCraft\\Maps\\Replays\\CWAL',
                mapDownloadPath: 'C:\\Users\\Documents\\StarCraft\\Maps\\CWAL',
                hideShortReplays: true
            };
        }
    }

    updateReplayPath = async (path: string) => {
        try {
            this._settings.replayDownloadPath = path;
            await this.saveSettings();
            toast.success('Replay download path updated');
        } catch (error) {
            console.error('Failed to update replay path:', error);
            toast.error('Failed to update replay download path');
        }
    }

    updateMapPath = async (path: string) => {
        try {
            this._settings.mapDownloadPath = path;
            await this.saveSettings();
            toast.success('Map download path updated');
        } catch (error) {
            console.error('Failed to update map path:', error);
            toast.error('Failed to update map download path');
        }
    }

    updateHideShortReplays = async (hideShortReplays: boolean) => {
        try {
            this._settings.hideShortReplays = hideShortReplays;
            await this.saveSettings();
            toast.success('Replay preferences updated');
        } catch (error) {
            console.error('Failed to update replay preferences:', error);
            toast.error('Failed to update replay preferences');
        }
    }

    updateSettings = async (newSettings: Partial<AppSettings>) => {
        this._settings = { ...this._settings, ...newSettings };
        await this.saveSettings();
    }

    private saveSettings = async () => {
        try {
            const content = JSON.stringify(this._settings, null, 2);
            await invoke('write_settings_file', {
                path: this.settingsFilePath,
                content
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    resetToDefaults = async () => {
        try {
            await this.setDefaults();
            toast.success('Settings reset to defaults');
        } catch (error) {
            console.error('Failed to reset settings:', error);
            toast.error('Failed to reset settings');
        }
    }

    getResolvedDefaults = async (): Promise<AppSettings> => {
        return await this.getDefaultSettings();
    }
}

let settingsStore: SettingsStore;

export const getSettingsStore = (): SettingsStore => {
    if (!settingsStore) {
        settingsStore = new SettingsStore();
    }
    return settingsStore;
}
