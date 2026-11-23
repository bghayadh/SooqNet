import apiClient from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Checkout settings the app must share with the server, loaded from
 * {@code /GetSooqNetAppSettings} instead of being hardcoded in the bundle.
 *
 * <p>Today that is the flat delivery charge and the currency label. The charge
 * is a server setting: {@code /placeOrder} recomputes the order from the same
 * SYSTEM_SETTINGS column, so an old build or a modified request can never change
 * what the customer is actually charged.</p>
 *
 * <p>The last successful response is cached on the device so the checkout screen
 * still shows a total when the server is briefly unreachable. When nothing has
 * ever been cached, {@link #getAppSettings} returns {@code null} and the caller
 * must refuse to place the order rather than guess an amount.</p>
 */

const STORAGE_KEY = "appSettings";

let cachedSettings = null;

function normalize(data) {
  return {
    flatRateDelivery: Number(data && data.flatRateDelivery) || 0,
    currency: String((data && data.currency) || "").trim(),
    clickAndCollectEnabled: Boolean(data && data.clickAndCollectEnabled),
    collectionStores: Array.isArray(data && data.collectionStores) ? data.collectionStores : [],
    creditCardEnabled: Boolean(data && data.creditCardEnabled),
    cashOnDeliveryEnabled: data && data.cashOnDeliveryEnabled === undefined
      ? true
      : Boolean(data.cashOnDeliveryEnabled),
    savedCards: Array.isArray(data && data.savedCards) ? data.savedCards : [],
  };
}

/**
 * Fetches the settings from the server and caches them on the device.
 * @param {boolean} force ignore the in-memory copy (used when the checkout opens).
 */
export async function fetchAppSettings(force = false) {
  if (cachedSettings && !force) {
    return cachedSettings;
  }
  const response = await apiClient.get("/GetSooqNetAppSettings");
  cachedSettings = normalize(response.data);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cachedSettings));
  } catch (storageError) {
    // Caching is best effort: the in-memory copy is still valid.
  }
  return cachedSettings;
}

/**
 * @returns {Promise<{flatRateDelivery: number, currency: string}|null>} the
 * server settings, the last cached copy when the server is unreachable, or
 * {@code null} when nothing is known yet.
 */
export async function getAppSettings() {
  try {
    return await fetchAppSettings(true);
  } catch (error) {
    // Server unreachable: fall back to the last copy stored on the device.
  }
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedSettings = normalize(JSON.parse(stored));
      return cachedSettings;
    }
  } catch (storageError) {
    // nothing cached
  }
  return null;
}

/** Formats an amount with the configured currency, for example "USD 12.50". */
export function formatMoney(amount, currency) {
  const value = Number(amount) || 0;
  return currency ? `${currency} ${value.toFixed(2)}` : value.toFixed(2);
}
