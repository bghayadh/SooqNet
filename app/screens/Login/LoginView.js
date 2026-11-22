import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { ipAddress, port, webAppPath, url } from "@env";
import apiClient from "../../Services/apiClient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navbar from "../../Navigations/Navbar";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useKeyboardVisible } from "../../Components/KeyboardScreen"; // adjust the path
import LanguagePickerModal from "../../Components/LanguagePickerModal";
import {
  applyAppLanguage,
  languageName,
  normalizeLanguage,
  rememberProfileLanguage,
} from "../../Services/appLanguage";

const LoginScreen = () => {
  const keyboardVisible = useKeyboardVisible();
  const insets = useSafeAreaInsets();
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [languagePickerVisible, setLanguagePickerVisible] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation(); // useTranslation hook to handle transla

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedLoginDetails = await AsyncStorage.getItem("loginDetails");

        if (storedLoginDetails) {
          const userData = JSON.parse(storedLoginDetails);
          // Remove credentials left by older app versions that persisted passwords in AsyncStorage.
          if (Object.prototype.hasOwnProperty.call(userData, "password")) {
            delete userData.password;
            await AsyncStorage.setItem(
              "loginDetails",
              JSON.stringify(userData),
            );
          }
          if (userData.isLoggedIn === "true") {
            router.replace({
              pathname: "/screens/Login/MyAccount",
              params: {
                loggedClientFullName: userData.clientName,
                loginIdentifier: userData.loginIdentifier,
              },
            });
          }
        }
      } catch (error) {
        console.error("Error reading login data:", error);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>; // Show a loading indicator while checking login status
  }

  const handleLogin = async () => {
    if (!loginIdentifier || !password) {
      Alert.alert("", t("Email/userandPasswordStat"));
      return;
    }
    try {
      const response = await apiClient.post(
        "/cltLoginAuthentication",
        new URLSearchParams({ loginIdentifier, password }),
      );

      if (response.data.Message === "Success") {
        // The language saved in the customer profile wins over whatever this
        // device used before, and is remembered for the next start.
        const preferredLanguage = await rememberProfileLanguage(
          response.data.preferredLanguage,
        );
        await AsyncStorage.setItem(
          "loginDetails",
          JSON.stringify({
            loginIdentifier: loginIdentifier,
            clientName: response.data.clientName,
            isLoggedIn: "true",
            preferredLanguage: preferredLanguage,
          }),
        );

        await applyAppLanguage(preferredLanguage);

        router.push({
          pathname: "/screens/Login/MyAccount",
          params: {
            loggedClientFullName: response.data.clientName,
            loginIdentifier: loginIdentifier,
          },
        });
      } else {
        Alert.alert(
          "Login Failed",
          response.data.Message || "Invalid credentials",
        );
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleLanguageChange = async (lang) => {
    setLanguagePickerVisible(false);
    await applyAppLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        bottomOffset={60}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: keyboardVisible ? 0 : 1,
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: keyboardVisible ? 24 : 72 + insets.bottom,
        }}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{t("Login")}</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("emailUserName")}
            placeholderTextColor="#ccc"
            value={loginIdentifier}
            onChangeText={setLoginIdentifier}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder={t("password")}
            placeholderTextColor="#ccc"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title={t("login")} onPress={handleLogin} />
        </View>

        <Text style={styles.footerText}>
          {t("noAccountStat")}{" "}
          <Text
            style={styles.link}
            onPress={() =>
              router.push({ pathname: "/screens/Login/CreateAccount" })
            }
          >
            {t("sighnUpHere")}
          </Text>
        </Text>

        <View
          style={[
            styles.languageContainer,
            {
              flexDirection: i18next.language === "ar" ? "row-reverse" : "row",
            },
          ]}
        >
          <Text style={styles.languageLabel}>{t("language")}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("language")}
            onPress={() => setLanguagePickerVisible(true)}
            style={styles.languagePickerButton}
          >
            <Text style={styles.languagePickerButtonText}>
              {languageName(i18next.language)}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      <LanguagePickerModal
        visible={languagePickerVisible}
        selected={normalizeLanguage(i18next.language)}
        onClose={() => setLanguagePickerVisible(false)}
        onSelect={handleLanguageChange}
      />

      {!keyboardVisible && <Navbar activetab="" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
  },
  link: {
    color: "#007bff",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  languageContainer: {
    marginTop: 20,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    direction: "ltr",
  },
  languageLabel: {
    marginHorizontal: 10,
    fontWeight: "bold",
    fontSize: 16,
  },

  languagePickerButton: {
    minWidth: 150,
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  languagePickerButtonText: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default LoginScreen;
