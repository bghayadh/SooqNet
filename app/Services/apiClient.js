import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { url } from "@env";

/**
 * One shared HTTP client for the whole app.
 *
 * - `withCredentials` makes the native HTTP stack keep and send the server
 *   JSESSIONID cookie, so the session created by the login call is reused by
 *   every account and order call.
 * - A 401 response (the server sends "NotLoggedIn") sends the user back to the
 *   login screen.
 *
 * No password is ever written to AsyncStorage.
 */
const apiClient = axios.create({
  baseURL: url,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error && error.response && error.response.status === 401) {
      // Flag the error so callers can stay silent: the session is gone, the
      // stored login flag is cleared below and the user is sent to the login
      // screen. A 401 here is an expected "please log in again", not a failure
      // the screens should log or show an alert for.
      error.isAuthError = true;
      try {
        const stored = await AsyncStorage.getItem("loginDetails");
        if (stored) {
          const details = JSON.parse(stored);
          delete details.password;
          details.isLoggedIn = "false";
          await AsyncStorage.setItem("loginDetails", JSON.stringify(details));
        }
      } catch (storageError) {
        // Ignore: the navigation below still takes the user to the login page.
      }
      router.replace("/screens/Login/LoginView");
    }
    return Promise.reject(error);
  },
);

/**
 * True when the request failed because the session expired / the user is not
 * logged in (HTTP 401). Screens should skip their own error log / alert for
 * these: {@link apiClient} already redirects to the login screen.
 */
export function isAuthError(error) {
  return Boolean(error && error.isAuthError);
}

export default apiClient;
