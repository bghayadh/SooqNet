import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Imported for its side effect: it registers the translation resources
// before any screen calls i18next.changeLanguage.
import "./Services/i18next";
import { applyAppLanguage } from "./Services/appLanguage";
import { fetchAppApiKeys } from "./Services/appApiKeys";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function Layout() {
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    const restoreAppPreferences = async () => {
      try {
        const [language, loginDetails] = await Promise.all([
          AsyncStorage.getItem("appLanguage"),
          AsyncStorage.getItem("loginDetails"),
        ]);
        let restoreLanguage = language;
        if (loginDetails) {
          const userData = JSON.parse(loginDetails);
          if (Object.prototype.hasOwnProperty.call(userData, "password")) {
            delete userData.password;
            await AsyncStorage.setItem(
              "loginDetails",
              JSON.stringify(userData),
            );
          }
          // A logged-in customer's profile language wins over the device value.
          if (userData.isLoggedIn === "true" && userData.preferredLanguage) {
            restoreLanguage = userData.preferredLanguage;
          }
        }
        if (restoreLanguage) {
          // Only the translations are restored here: the native direction was
          // already applied by forceRTL when the language was last chosen, so a
          // reload at start-up would only risk a reload loop on devices where
          // that native setting did not stick.
          await applyAppLanguage(restoreLanguage, { reload: false });
        }
      } catch (error) {
        console.warn("Unable to restore app preferences:", error);
      } finally {
        setLanguageReady(true);
      }
    };
    restoreAppPreferences();

    // Refresh the API keys from the server in the background (never blocks
    // the UI; the app keys service falls back to the last cached copy).
    fetchAppApiKeys().catch((error) =>
      console.warn("Unable to load app API keys:", error),
    );
  }, []);

  if (!languageReady) return null;

  return (
    <KeyboardProvider>
      <Stack
        screenOptions={{
          headerShown: false, // This hides the header
          animation: "slide_from_right", // Shein-like animation on both platforms
        }}
      />
    </KeyboardProvider>
  );
}
