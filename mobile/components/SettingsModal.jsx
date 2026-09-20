import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, TYPOGRAPHY, SHADOWS } from "../constants/theme";

export const SettingsModal = ({ visible, onClose }) => {
  const [selectedLang, setSelectedLang] = useState("en");

  const languages = [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi", native: "हिन्दी" },
    { code: "ta", label: "Tamil", native: "தமிழ்" },
    { code: "te", label: "Telugu", native: "తెలుగు" },
    { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
    { code: "ml", label: "Malayalam", native: "മലയാളം" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="settings" size={20} color={COLORS.primaryNavy} />
              <Text style={styles.modalTitle}>Settings & Profile</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Citizen Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>R</Text>
                </View>
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>Ramesh Kumar</Text>
                  <Text style={styles.profileMeta}>📱 9876543210 • Scheduled Caste (SC)</Text>
                  <Text style={styles.profileLocation}>📍 Tamil Nadu, India</Text>
                </View>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                <Text style={styles.verifiedText}>Aadhaar & Caste Verified Beneficiary</Text>
              </View>
            </View>

            {/* Language Selector */}
            <Text style={styles.sectionHeading}>App & Audio Language</Text>
            <View style={styles.langGrid}>
              {languages.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    activeOpacity={0.7}
                    onPress={() => setSelectedLang(lang.code)}
                    style={[
                      styles.langCard,
                      isSelected ? styles.langCardSelected : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.langLabel,
                        isSelected ? styles.langLabelSelected : null,
                      ]}
                    >
                      {lang.native}
                    </Text>
                    <Text
                      style={[
                        styles.langSub,
                        isSelected ? styles.langSubSelected : null,
                      ]}
                    >
                      {lang.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkIcon}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.accentGold} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Helpline Information */}
            <View style={styles.helplineBox}>
              <Ionicons name="headset" size={22} color={COLORS.primaryNavy} />
              <View style={{ flex: 1 }}>
                <Text style={styles.helplineTitle}>National Social Justice Helpline</Text>
                <Text style={styles.helplinePhone}>Toll-Free: 14566 (MoSJE Assistance)</Text>
                <Text style={styles.helplineSub}>Monday – Saturday, 9:30 AM to 6:00 PM</Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Close Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={styles.doneBtn}
          >
            <Text style={styles.doneBtnText}>Save & Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: {
    marginVertical: 14,
  },
  profileCard: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primaryNavy,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.accentGold,
  },
  avatarLetter: {
    color: COLORS.accentGold,
    fontSize: 20,
    fontWeight: "800",
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
  profileMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profileLocation: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.success,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primaryNavy,
    marginBottom: 10,
  },
  langGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  langCard: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    position: "relative",
  },
  langCardSelected: {
    backgroundColor: COLORS.primaryNavy,
    borderColor: COLORS.primaryNavy,
  },
  langLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primaryNavy,
  },
  langLabelSelected: {
    color: COLORS.surface,
  },
  langSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  langSubSelected: {
    color: "rgba(241, 236, 224, 0.8)",
  },
  checkIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  helplineBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.accentGoldLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  helplineTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
  helplinePhone: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primaryNavy,
    marginTop: 1,
  },
  helplineSub: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  doneBtn: {
    backgroundColor: COLORS.primaryNavy,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
    ...SHADOWS.small,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.surface,
  },
});
