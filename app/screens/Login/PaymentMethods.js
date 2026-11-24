import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import apiClient, { isAuthError } from "../../Services/apiClient";
import Navbar from "../../Navigations/Navbar";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Manage the signed-in customer's saved payment cards.
 *
 * Cards are display metadata only (brand, cardholder, last four, expiry); the
 * full number and CVV are never collected here. This mirrors the web
 * My Account → Payment Cards screen and feeds the checkout card picker.
 */
const PaymentMethods = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const isRTL = i18next.language === "ar";

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [editorVisible, setEditorVisible] = useState(false);
  const [cardId, setCardId] = useState("");
  const [brand, setBrand] = useState("VISA");
  const [cardholderName, setCardholderName] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [expiry, setExpiry] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCards = async () => {
    try {
      const response = await apiClient.get("/GetSooqNetClientCards");
      setCards(Array.isArray(response?.data?.cards) ? response.data.cards : []);
    } catch (error) {
      if (!isAuthError(error)) {
        console.error("Error loading cards:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const resetForm = () => {
    setCardId("");
    setBrand("VISA");
    setCardholderName("");
    setLastFour("");
    setExpiry("");
  };

  const openAdd = () => {
    resetForm();
    setEditorVisible(true);
  };

  const openEdit = (card) => {
    setCardId(card.id);
    setBrand(card.brand || "VISA");
    setCardholderName(card.cardholderName || "");
    setLastFour(card.lastFour || "");
    const mm = card.expiryMonth ? String(card.expiryMonth).padStart(2, "0") : "";
    const yy = card.expiryYear ? String(card.expiryYear).slice(-2) : "";
    setExpiry(mm && yy ? mm + "/" + yy : "");
    setEditorVisible(true);
  };

  const handleExpiryChange = (text) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    setExpiry(digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits);
  };

  const saveCard = async () => {
    const parts = expiry.split("/");
    const mm = parseInt(parts[0], 10);
    const yy = parseInt(parts[1], 10);
    const expiryYear = yy < 100 ? 2000 + yy : yy;
    if (!cardholderName.trim() || !lastFour || parts.length < 2 || !mm || !yy) {
      Alert.alert(t("error"), t("pleaseCheckCardDetails"));
      return;
    }
    setSaving(true);
    try {
      const response = await apiClient.post(
        "/SaveSooqNetClientCard",
        new URLSearchParams({
          id: cardId || "",
          brand,
          cardholderName: cardholderName.trim(),
          lastFour,
          expiryMonth: String(mm),
          expiryYear: String(expiryYear),
        })
      );
      if (response?.data?.Status === "Success") {
        setEditorVisible(false);
        resetForm();
        await loadCards();
      } else {
        Alert.alert(t("error"), response?.data?.message || t("unableToSaveCard"));
      }
    } catch (error) {
      if (!isAuthError(error)) {
        Alert.alert(t("error"), t("unableToSaveCard"));
      }
    } finally {
      setSaving(false);
    }
  };

  const removeCard = (card) => {
    Alert.alert(t("removeCardTitle"), t("confirmRemoveCard"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("remove"),
        style: "destructive",
        onPress: async () => {
          try {
            const response = await apiClient.post(
              "/DeleteSooqNetClientCard",
              new URLSearchParams({ id: card.id })
            );
            if (response?.data?.Status === "Success") {
              await loadCards();
            } else {
              Alert.alert(t("error"), response?.data?.message || t("unableToRemoveCard"));
            }
          } catch (error) {
            if (!isAuthError(error)) {
              Alert.alert(t("error"), t("unableToRemoveCard"));
            }
          }
        },
      },
    ]);
  };

  const renderCard = (card) => {
    const mm = card.expiryMonth ? String(card.expiryMonth).padStart(2, "0") : "";
    const yy = card.expiryYear ? String(card.expiryYear).slice(-2) : "";
    return (
      <View key={card.id} style={styles.cardTile}>
        <View style={[styles.cardTop, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={[styles.cardMark, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Ionicons name="card-outline" size={20} color="#1266a8" />
            <Text style={styles.cardBrand}>{card.brand}</Text>
          </View>
          <Text style={styles.cardLastFour}>•••• {card.lastFour}</Text>
        </View>
        <Text style={styles.cardHolder}>{card.cardholderName}</Text>
        <Text style={styles.cardExpiry}>
          {t("expires")} {mm}/{yy}
        </Text>
        <View style={[styles.cardActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(card)}>
            <Text style={styles.editBtnText}>{t("edit")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn} onPress={() => removeCard(card)}>
            <Text style={styles.removeBtnText}>{t("remove")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      >
        <View style={[styles.headerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Text style={styles.header}>{t("paymentMethods")}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>{t("addCard")}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>{t("savedCardsHint")}</Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 30 }} />
        ) : cards.length === 0 ? (
          <Text style={styles.empty}>{t("noSavedCards")}</Text>
        ) : (
          cards.map(renderCard)
        )}

        {editorVisible && (
          <View style={styles.editor}>
            <Text style={styles.editorTitle}>{cardId ? t("editCard") : t("addCard")}</Text>

            <Text style={styles.label}>{t("cardBrand")}</Text>
            <View style={[styles.brandRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              {["VISA", "MASTERCARD"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.brandOption, brand === option && styles.brandOptionActive]}
                  onPress={() => setBrand(option)}
                >
                  <Text style={[styles.brandOptionText, brand === option && styles.brandOptionTextActive]}>
                    {option === "VISA" ? "Visa" : "Mastercard"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t("cardholderName")}</Text>
            <TextInput
              style={styles.input}
              value={cardholderName}
              onChangeText={setCardholderName}
              placeholder={t("cardholderName")}
              maxLength={200}
            />

            <Text style={styles.label}>{t("lastFourDigits")}</Text>
            <TextInput
              style={styles.input}
              value={lastFour}
              onChangeText={(text) => setLastFour(text.replace(/\D/g, "").slice(0, 4))}
              placeholder="1234"
              keyboardType="number-pad"
              maxLength={4}
            />

            <Text style={styles.label}>{t("expiryDate")}</Text>
            <TextInput
              style={styles.input}
              value={expiry}
              onChangeText={handleExpiryChange}
              placeholder="MM/YY"
              keyboardType="number-pad"
              maxLength={5}
            />

            <View style={[styles.editorActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <TouchableOpacity style={styles.saveBtn} onPress={saveCard} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{t("saveCard")}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditorVisible(false)}>
                <Text style={styles.cancelBtnText}>{t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      <Navbar activetab="myaccount" />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  headerRow: {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 6,
  },
  hint: {
    fontSize: 14,
    color: "#777",
    marginBottom: 16,
  },
  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
    fontSize: 15,
  },
  cardTile: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e4e8ee",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  cardTop: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardMark: {
    alignItems: "center",
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1266a8",
    marginLeft: 6,
  },
  cardLastFour: {
    fontSize: 16,
    color: "#333",
    letterSpacing: 1,
  },
  cardHolder: {
    fontSize: 16,
    color: "#333",
    marginTop: 12,
  },
  cardExpiry: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  cardActions: {
    marginTop: 14,
  },
  editBtn: {
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  editBtnText: {
    color: "#007bff",
    fontSize: 14,
  },
  removeBtn: {
    borderWidth: 1,
    borderColor: "#d9534f",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  removeBtnText: {
    color: "#d9534f",
    fontSize: 14,
  },
  editor: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e4e8ee",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  brandRow: {
    marginBottom: 4,
  },
  brandOption: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
  },
  brandOptionActive: {
    borderColor: "#007bff",
    backgroundColor: "#e7f1ff",
  },
  brandOptionText: {
    fontSize: 15,
    color: "#555",
  },
  brandOptionTextActive: {
    color: "#007bff",
    fontWeight: "bold",
  },
  editorActions: {
    marginTop: 18,
  },
  saveBtn: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginRight: 10,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  cancelBtnText: {
    color: "#555",
    fontSize: 16,
  },
});

export default PaymentMethods;