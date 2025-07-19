<script lang="ts">
  import { appDataDir } from "@tauri-apps/api/path";

  import { Input } from "@/lib/components/ui/input";

  (async () => {
    const appDataPath = await appDataDir();
    console.log(appDataPath);
    // Example output:
    // On Windows: C:\Users\<current_user>\AppData\Roaming\<package_name>
    // On macOS: /Users/<current_user>/Library/Application Support/<package_name>
  })();
</script>

<Input type="email" placeholder="email" class="max-w-xs" />
