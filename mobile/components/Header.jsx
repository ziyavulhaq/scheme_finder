import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, TYPOGRAPHY, SHADOWS } from "../constants/theme";
import { SettingsModal } from "./SettingsModal";

export const Header = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.topRow}>
          {/* Brand Logo & Name */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBox}>
              <Image
                source={require("../assets/logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.appName}>FINORA</Text>
                <View style={styles.govPill}>
                  <Text style={styles.govText}>GOVT OF INDIA</Text>
                </View>
              </View>
              <Text style={styles.tagline}>Citizen Loan & Scheme Guide</Text>
            </View>
          </View>

          {/* Citizen Avatar & Settings */}
          <View style={styles.rightButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowSettings(true)}
              style={styles.userBadge}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>R</Text>
              </View>
              <Text style={styles.userName}>Ramesh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowSettings(true)}
              style={styles.settingsIconBtn}
            >
              <Ionicons name="settings-outline" size={20} color={COLORS.primaryNavy} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logoBox: {
    height: 38,
    width: 46,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
    ...SHADOWS.small,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  appName: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.primaryNavy,
    letterSpacing: -0.5,
  },
  govPill: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  govText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  rightButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primaryNavy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: "800",
  },
  userName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primaryNavy,
  },
  settingsIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
