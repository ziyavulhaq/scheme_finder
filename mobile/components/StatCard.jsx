import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, TYPOGRAPHY, SHADOWS } from "../constants/theme";

export const StatCard = ({ icon, label, value, subtext, highlight }) => {
  return (
    <View
      style={[
        styles.card,
        highlight ? styles.highlightCard : styles.standardCard,
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconBox,
            highlight ? styles.highlightIconBox : styles.standardIconBox,
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={highlight ? COLORS.accentGold : COLORS.primaryNavy}
          />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text
        style={[
          styles.value,
          highlight ? styles.highlightValue : styles.standardValue,
        ]}
      >
        {value}
      </Text>

      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 88,
    ...SHADOWS.small,
  },
  standardCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  highlightCard: {
    backgroundColor: COLORS.primaryNavy,
    borderColor: COLORS.primaryNavyLight,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  standardIconBox: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  highlightIconBox: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    flexShrink: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },
  standardValue: {
    color: COLORS.primaryNavy,
  },
  highlightValue: {
    color: COLORS.accentGold,
  },
  subtext: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
