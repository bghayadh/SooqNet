import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18next from "i18next";
import * as Expo from "expo";

import apiClient from "./apiClient";

/**
 * The two interface languages supported by the app.
 *
 * The codes are the same values stored in CLIENTS.PREFERRED_LANGUAGE, so the
 * language chosen here, in MyAccount, or in the SooqWeb customer form all
 * travel as "en" / "ar".
 */
export const LANGUAGE_OPTIONS = [
  { code: "en", name: "English" },
  { code: "ar", name: "عربي" },
];

/** Anything that is not Arabic is treated as English, matching the server. */
export const normalizeLanguage = (code) => (code === "ar" ? "ar" : "en");

export const languageName = (code) =>
  LANGUAGE_OPTIONS.find((option) => option.code === normalizeLanguage(code))
    ?.name || code;

/**
 * Makes the language current on this device: translations, native layout
 * direction and the value restored at the next start.
 *
 * A change of direction needs a fresh root view, so the app reloads itself.
 * Everything that must survive the reload (AsyncStorage, the server call) has
 * to be written before awaiting this helper.
 */
export async function applyAppLanguage(lang, { reload = true } = {}) {
  const language = normalizeLanguage(lang);
  await i18next.changeLanguage(language);
  const shouldUseRTL = language === "ar";
  I18nManager.allowRTL(shouldUseRTL);
  I18nManager.forceRTL(shouldUseRTL);
  await AsyncStorage.setItem("appLanguage", language);
  if (reload && I18nManager.isRTL !== shouldUseRTL) {
    await Expo.reloadAppAsync("Applying the selected interface direction");
  }
}

/**
 * Language to use after a login.
 *
 * A customer who already has a language in the profile keeps it. Customers
 * created before the column existed have none, so they inherit the language
 * this device is already showing and that value is stored in the profile, so
 * it follows them to every other device from then on.
 */
export async function rememberProfileLanguage(profileLanguage) {
  if (profileLanguage === "en" || profileLanguage === "ar") {
    return profileLanguage;
  }
  const deviceLanguage = normalizeLanguage(i18next.language);
  try {
    await apiClient.post(
      "/SaveSooqNetClientLanguage",
      new URLSearchParams({ preferredLanguage: deviceLanguage }),
    );
  } catch (error) {
    // A failed adoption must never block the login itself.
    console.log("Unable to store the initial language:", error?.message);
  }
  return deviceLanguage;
}
