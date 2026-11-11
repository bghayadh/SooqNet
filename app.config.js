/**
 * Expo app config.
 *
 * app.config.js takes precedence over app.json in Expo, so when this file
 * exists the android maps key has to be provided here as well. It is read
 * from the local, git-ignored environment file instead of being committed:
 *
 *   - Local development:    .env.local (or .env) in the project root
 *   - EAS builds:           add GOOGLE_MAPS_ANDROID_KEY as a secret:
 *                           eas secret:create --name GOOGLE_MAPS_ANDROID_KEY --value <key>
 *
 *   GOOGLE_MAPS_ANDROID_KEY=<key>
 *
 * Google restricts this key with the Android package name and the SHA-1
 * fingerprint, never by secrecy: the key ships inside the installed app
 * anyway. After changing it run a clean prebuild so the native manifest is
 * regenerated: npx expo prebuild --clean
 */
const baseConfig = require("./app.json").expo;

module.exports = () => ({
  ...baseConfig,
  android: {
    ...baseConfig.android,
    config: {
      googleMaps: {
        // Kept empty when the local env file has no key; the app then relies
        // on the last key fetched at runtime from /GetSooqNetAppApiKeys.
        apiKey: process.env.GOOGLE_MAPS_ANDROID_KEY || "",
      },
    },
  },
});
