import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, TYPOGRAPHY, SHADOWS } from "../constants/theme";

export const BigOptionButton = ({
  icon,
  title,
  subtitle,
  selected,
  onPress,
  badgeText
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.button,
        selected ? styles.selectedButton : styles.unselectedButton,
      ]}
    >
      <View style={styles.leftContent}>
        <View
          style={[
            styles.iconContainer,
            selected ? styles.selectedIconContainer : styles.unselectedIconContainer,
          ]}
        >
          <Ionicons
            name={icon}
            size={22}
            color={selected ? COLORS.surface : COLORS.primaryNavy}
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                selected ? styles.selectedTitle : styles.unselectedTitle,
              ]}
            >
              {title}
            </Text>
            {badgeText ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeText}</Text>
              </View>
            ) : null}
          </View>
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                selected ? styles.selectedSubtitle : styles.unselectedSubtitle,
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.radioCircle,
          selected ? styles.selectedRadio : styles.unselectedRadio,
        ]}
      >
        {selected ? (
          <Ionicons name="checkmark" size={14} color={COLORS.surface} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginVertical: 5,
    minHeight: 64,
    borderWidth: 1.5,
  },
  unselectedButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  selectedButton: {
    backgroundColor: COLORS.accentGoldLight,
    borderColor: COLORS.accentGold,
    ...SHADOWS.medium,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unselectedIconContainer: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  selectedIconContainer: {
    backgroundColor: COLORS.primaryNavy,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  unselectedTitle: {
    color: COLORS.textPrimary,
  },
  selectedTitle: {
    color: COLORS.primaryNavy,
  },
  subtitle: {
    fontSize: 12.5,
    marginTop: 2,
    lineHeight: 17,
  },
  unselectedSubtitle: {
    color: COLORS.textSecondary,
  },
  selectedSubtitle: {
    color: COLORS.textSecondary,
  },
  badge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.success,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  unselectedRadio: {
    borderColor: COLORS.borderDark,
    backgroundColor: "transparent",
  },
  selectedRadio: {
    borderColor: COLORS.primaryNavy,
    backgroundColor: COLORS.primaryNavy,
  },
});
