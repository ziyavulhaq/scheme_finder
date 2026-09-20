import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, TYPOGRAPHY, SHADOWS } from "../constants/theme";
import { formatINR, formatLakhs } from "../utils/financialMath";

export const SchemeCard = ({
  scheme,
  enteredCost,
  eligibleLoan,
  marginMoney,
  isCapped,
  onPressCalculate,
  onPressDocuments,
}) => {
  if (!scheme) return null;

  return (
    <View style={styles.card}>
      {/* Top Header Badge */}
      <View style={styles.headerRow}>
        <View style={styles.badgeContainer}>
          <Text style={styles.codeText}>{scheme.code}</Text>
          <View style={styles.verifiedPill}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
            <Text style={styles.verifiedText}>NSFDC Verified</Text>
          </View>
        </View>

        <View style={styles.rateBadge}>
          <Text style={styles.rateValue}>{scheme.rate}%</Text>
          <Text style={styles.rateUnit}>p.a.</Text>
        </View>
      </View>

      {/* Scheme Title & Description */}
      <Text style={styles.schemeName}>{scheme.name}</Text>
      <Text style={styles.schemeDesc}>{scheme.description}</Text>

      {/* Statutory 90% Loan vs 10% Margin Money Box */}
      <View style={styles.breakdownBox}>
        <Text style={styles.breakdownTitle}>Statutory Cost Breakdown (Up to 90% Loan)</Text>

        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownCol}>
            <Text style={styles.colLabel}>Eligible Govt Loan</Text>
            <Text style={styles.loanAmountText}>{formatINR(eligibleLoan)}</Text>
            <Text style={styles.colSubtext}>90% concessional credit</Text>
          </View>

          <View style={styles.dividerVertical} />

          <View style={styles.breakdownCol}>
            <Text style={styles.colLabel}>Borrower Margin</Text>
            <Text style={styles.marginAmountText}>{formatINR(marginMoney)}</Text>
            <Text style={styles.colSubtext}>10% self contribution</Text>
          </View>
        </View>

        {isCapped && (
          <View style={styles.cappedNotice}>
            <Ionicons name="information-circle" size={14} color={COLORS.warning} />
            <Text style={styles.cappedText}>
              Project cost exceeds scheme ceiling of {formatLakhs(scheme.maxCost)}. Loan is capped at maximum entitlement.
            </Text>
          </View>
        )}
      </View>

      {/* Key Metric Highlights */}
      <View style={styles.highlightsRow}>
        <View style={styles.highlightItem}>
          <Ionicons name="time-outline" size={14} color={COLORS.primaryNavy} />
          <Text style={styles.highlightText}>
            Max Tenure: {Math.round(scheme.maxTenureMonths / 12)} Yrs ({scheme.maxTenureMonths} Mo)
          </Text>
        </View>
        <View style={styles.highlightItem}>
          <Ionicons name="gift-outline" size={14} color={COLORS.primaryNavy} />
          <Text style={styles.highlightText}>
            Grace Period: {scheme.moratorium} Months Moratorium
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressCalculate}
          style={styles.primaryActionButton}
        >
          <Ionicons name="calculator-outline" size={18} color={COLORS.surface} />
          <Text style={styles.primaryActionText}>Calculate EMI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressDocuments}
          style={styles.secondaryActionButton}
        >
          <Ionicons name="document-text-outline" size={18} color={COLORS.primaryNavy} />
          <Text style={styles.secondaryActionText}>Verify Docs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginVertical: 10,
    ...SHADOWS.medium,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  codeText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primaryNavy,
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.success,
  },
  rateBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: COLORS.accentGoldLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  rateValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
  rateUnit: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  schemeName: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.primaryNavy,
    marginTop: 4,
    lineHeight: 24,
  },
  schemeDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  breakdownBox: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primaryNavy,
    marginBottom: 8,
  },
  breakdownGrid: {
    flexDirection: "row",
    alignItems: "center",
  },
  breakdownCol: {
    flex: 1,
    alignItems: "center",
  },
  dividerVertical: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.borderDark,
    marginHorizontal: 8,
  },
  colLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  loanAmountText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.success,
    marginTop: 2,
  },
  marginAmountText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primaryNavy,
    marginTop: 2,
  },
  colSubtext: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  cappedNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    backgroundColor: COLORS.warningLight,
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  cappedText: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: "600",
    flex: 1,
    lineHeight: 15,
  },
  highlightsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  highlightText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  primaryActionButton: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primaryNavy,
    paddingVertical: 12,
    borderRadius: 10,
    minHeight: 46,
  },
  primaryActionText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.accentGoldLight,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
    paddingVertical: 12,
    borderRadius: 10,
    minHeight: 46,
  },
  secondaryActionText: {
    color: COLORS.primaryNavy,
    fontSize: 14,
    fontWeight: "700",
  },
});
