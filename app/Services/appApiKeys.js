import apiClient from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Loads the API keys this app is allowed to receive from the server, instead
 * of keeping them in app.json or the native manifest.
 *
 * <p>The server endpoint {@code /GetSooqNetAppApiKeys} is public (maps are
 * needed before login, for example on the guest checkout address screen) and
 * returns only the key types that must exist on the device. Protection for
 * these keys comes from the Google Cloud console restrictions (package name
 * plus SHA-1 fingerprint for Android), not from hiding them.</p>
 *
 * <p>Never import a real key through {@code @env}: Babel inlines it into the
 * JS bundle at build time, which is exactly what we are avoiding here. The
 * only exception is the native Android Maps SDK key, which Android loads from
 * the manifest at build time ({@code GOOGLE_MAPS_ANDROID_KEY} in the local
 * env file, consumed by app.config.js during Expo prebuild).</p>
 */

const STORAGE_KEY = "appApiKeys";

/** Application name registered in the API KEYS tab of the server (System Settings). */
const APPLICATION_NAME = "SooqNet";

let cachedKeys = null;

/**
 * Fetches the keys from the server and caches them on the device. When the
 * server cannot be reached the last cached copy (from AsyncStorage) is used,
 * so maps keep working offline after the first successful load.
 */
export async function fetchAppApiKeys(force = false) {
  if (cachedKeys && !force) {
    return cachedKeys;
  }
  const response = await apiClient.get("/GetSooqNetAppApiKeys", {
    params: { applicationName: APPLICATION_NAME },
  });
  cachedKeys = response.data && typeof response.data === "object" ? response.data : {};
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cachedKeys));
  } catch (storageError) {
    // Caching is best effort: the in-memory copy is still valid.
  }
  return cachedKeys;
}

/**
 * @returns {Promise<string>} the Google Maps key for this application, or "".
 */
export async function getGoogleMapsApiKey() {
  try {
    return await fetchAppApiKeys();
  } catch (error) {
    // Server unreachable: fall back to the last cached keys.
  }
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedKeys = JSON.parse(stored);
      return cachedKeys.googleMapsApiKey || "";
    }
  } catch (storageError) {
    // nothing cached
  }
  return "";
}
