import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { LANGUAGE_OPTIONS } from "../Services/appLanguage";

/**
 * Language chooser shared by the login screen and MyAccount, so both places
 * show the same two options and behave the same way.
 */
const LanguagePickerModal = ({ visible, selected, onClose, onSelect }) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t("close")}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View style={styles.card}>
          <Text style={styles.title}>{t("language")}</Text>
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
          >
            {LANGUAGE_OPTIONS.map(({ code, name }) => {
              const isSelected = selected === code;
              return (
                <TouchableOpacity
                  key={code}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onSelect(code)}
                  style={[styles.option, isSelected && styles.optionSelected]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  option: {
    width: "100%",
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: "#00757c",
  },
  optionText: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  optionTextSelected: {
    color: "#fff",
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "75%",
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#fff",
    elevation: 8,
  },
  title: {
    marginBottom: 12,
    color: "#1f2937",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  list: {
    width: "100%",
  },
  listContent: {
    alignItems: "center",
    gap: 8,
  },
});

export default LanguagePickerModal;
