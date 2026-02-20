const MASTER_REPO_URL =
    "https://raw.githubusercontent.com/send2cloud/blueprint/main/package.json";

// In the browser, the package.json version is generally not exposed unless imported
// directly or via Vite env vars. Assuming the user imports from their package.json or we hardcode.
// A simpler robust way for Vite is using import.meta.env.VITE_APP_VERSION (if defined) or 
// importing the package.json version.
import pkg from '../../package.json';

export function getCurrentVersion(): string {
    return pkg.version || "0.0.0";
}

export async function getLatestVersion(): Promise<string> {
    const res = await fetch(MASTER_REPO_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch blueprint package.json");
    const data = await res.json();
    return data.version || "0.0.0";
}

export function isNewerVersion(current: string, latest: string) {
    const currParts = current.replace(/[^0-9.]/g, "").split(".").map(Number);
    const latestParts = latest.replace(/[^0-9.]/g, "").split(".").map(Number);

    for (let i = 0; i < Math.max(currParts.length, latestParts.length); i++) {
        const curr = currParts[i] || 0;
        const lat = latestParts[i] || 0;
        if (lat > curr) return true;
        if (lat < curr) return false;
    }
    return false;
}

export async function checkBlueprintUpdates() {
    try {
        const currentVersion = getCurrentVersion();
        const latestVersion = await getLatestVersion();

        if (isNewerVersion(currentVersion, latestVersion)) {
            return {
                hasUpdate: true,
                current: currentVersion,
                latest: latestVersion,
            };
        }
        return { hasUpdate: false, current: currentVersion, latest: latestVersion };
    } catch (error) {
        console.error("Failed to check for Blueprint updates:", error);
        return { hasUpdate: false, current: getCurrentVersion(), latest: "0.0.0", error };
    }
}
