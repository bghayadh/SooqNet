import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18next from "./Services/i18next";
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
        if (language) await i18next.changeLanguage(language);
        if (loginDetails) {
          const userData = JSON.parse(loginDetails);
          if (Object.prototype.hasOwnProperty.call(userData, "password")) {
            delete userData.password;
            await AsyncStorage.setItem(
              "loginDetails",
              JSON.stringify(userData),
            );
          }
        }
      } catch (error) {
        console.warn("Unable to restore app preferences:", error);
      } finally {
        setLanguageReady(true);
      }
    };
    restoreAppPreferences();
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
