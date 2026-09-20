import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components/Header";
import { COLORS, TYPOGRAPHY, SHADOWS } from "../../constants/theme";
import { SCHEMES } from "../../constants/schemes";
import {
  formatINR,
  calculateMarginBreakdown,
  calculateLoanSummary,
} from "../../utils/financialMath";

export default function CalculatorScreen() {
  const router = useRouter();

  // State
  const [selectedSchemeId, setSelectedSchemeId] = useState("micro");
  const [costInput, setCostInput] = useState("140000");
  const [tenureMonths, setTenureMonths] = useState(36);

  const currentScheme = SCHEMES.find((s) => s.id === selectedSchemeId) || SCHEMES[0];
  const enteredCost = Math.max(0, Number(costInput) || 0);

  // Statutory 90% breakdown
  const marginBreakdown = calculateMarginBreakdown(enteredCost, currentScheme.maxCost);

  // Loan Repayment Summary
  const summary = calculateLoanSummary(
    marginBreakdown.eligibleLoanAmount,
    currentScheme.rate,
    tenureMonths,
    currentScheme.moratorium
  );

  const handleSelectScheme = (scheme) => {
    setSelectedSchemeId(scheme.id);
    if (scheme.id === "micro") setCostInput("140000");
    if (scheme.id === "term") setCostInput("500000");
    if (scheme.id === "education") setCostInput("800000");
    if (scheme.id === "aajeevika") setCostInput("100000");
    setTenureMonths(Math.min(36, scheme.maxTenureMonths));
  };

  const adjustCost = (delta) => {
    const updated = Math.max(5000, enteredCost + delta);
    setCostInput(String(updated));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <Header />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          style={styles.flexOne}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Title Box */}
          <View style={styles.titleBox}>
            <Text style={styles.screenHeading}>Dynamic Concessional EMI Calculator</Text>
            <Text style={styles.screenSubheading}>
              Check your exact monthly instalment, moratorium grace savings, and compare against 14% commercial rates.
            </Text>
          </View>

          {/* Scheme Selector Horizontal Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.schemePillsScroll}
          >
            {SCHEMES.map((scheme) => {
              const isSelected = scheme.id === selectedSchemeId;
              return (
                <TouchableOpacity
                  key={scheme.id}
                  activeOpacity={0.7}
                  onPress={() => handleSelectScheme(scheme)}
                  style={[
                    styles.schemePill,
                    isSelected ? styles.schemePillActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.schemePillName,
                      isSelected ? styles.schemePillNameActive : null,
                    ]}
                  >
                    {scheme.name}
                  </Text>
                  <View
                    style={[
                      styles.schemePillRateBox,
                      isSelected ? styles.schemePillRateBoxActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.schemePillRateText,
                        isSelected ? styles.schemePillRateTextActive : null,
                      ]}
                    >
                      {scheme.rate}% p.a.
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Project Cost Card */}
          <View style={styles.cardSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.inputSectionLabel}>Project / Course Cost</Text>
              <Text style={styles.schemeMaxLabel}>Max: {formatINR(currentScheme.maxCost)}</Text>
            </View>

            <View style={styles.costInputRow}>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={costInput}
                  onChangeText={setCostInput}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <TouchableOpacity
                onPress={() => adjustCost(-25000)}
                style={styles.adjustButton}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={18} color={COLORS.primaryNavy} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => adjustCost(25000)}
                style={styles.adjustButton}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={COLORS.primaryNavy} />
              </TouchableOpacity>
            </View>

            {/* Quick Increment Chips */}
            <View style={styles.quickAddRow}>
              {[10000, 25000, 50000, 100000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => adjustCost(amt)}
                  style={styles.quickAddChip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAddText}>+{formatINR(amt)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Statutory Margin Breakdown Box */}
            <View style={styles.marginNoticeBox}>
              <View style={styles.marginNoticeCol}>
                <Text style={styles.marginNoticeLabel}>Eligible 90% Govt Loan</Text>
                <Text style={styles.loanVal}>
                  {formatINR(marginBreakdown.eligibleLoanAmount)}
                </Text>
              </View>
              <View style={styles.marginDivider} />
              <View style={styles.marginNoticeCol}>
                <Text style={styles.marginNoticeLabel}>Your 10% Contribution</Text>
                <Text style={styles.marginVal}>
                  {formatINR(marginBreakdown.marginMoney)}
                </Text>
              </View>
            </View>
          </View>

          {/* Repayment Duration Selector */}
          <View style={styles.cardSection}>
            <Text style={styles.inputSectionLabel}>
              Repayment Duration: {tenureMonths} Months ({Math.round(tenureMonths / 12)} Years)
            </Text>

            <View style={styles.tenurePillsRow}>
              {[12, 24, 36, 48, 60, 84].map((mo) => {
                if (mo > currentScheme.maxTenureMonths) return null;
                const isSelected = tenureMonths === mo;
                return (
                  <TouchableOpacity
                    key={mo}
                    activeOpacity={0.7}
                    onPress={() => setTenureMonths(mo)}
                    style={[
                      styles.tenurePill,
                      isSelected ? styles.tenurePillActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tenurePillText,
                        isSelected ? styles.tenurePillTextActive : null,
                      ]}
                    >
                      {mo} Mo
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Large EMI Highlight Card (Navy & Gold) */}
          <View style={styles.emiHighlightCard}>
            <View style={styles.emiTopRow}>
              <View>
                <Text style={styles.emiLabel}>ESTIMATED MONTHLY INSTALMENT</Text>
                <Text style={styles.emiAmount}>{formatINR(summary.monthlyEMI)}</Text>
              </View>
              <View style={styles.ratePill}>
                <Text style={styles.ratePillText}>{currentScheme.rate}% p.a.</Text>
              </View>
            </View>

            {/* Moratorium Grace Note */}
            <View style={styles.moratoriumNotice}>
              <Ionicons name="time" size={16} color={COLORS.accentGold} />
              <Text style={styles.moratoriumText}>
                Includes {currentScheme.moratorium}-month moratorium. Principal payments commence after Month {currentScheme.moratorium}.
              </Text>
            </View>

            {/* Repayment Breakdown Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statItemLabel}>Sanctioned Principal</Text>
                <Text style={styles.statItemVal}>
                  {formatINR(marginBreakdown.eligibleLoanAmount)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statItemLabel}>Subsidized Interest</Text>
                <Text style={styles.statItemVal}>{formatINR(summary.totalInterest)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statItemLabel}>Estimated Savings</Text>
                <Text style={[styles.statItemVal, { color: COLORS.success }]}>
                  {formatINR(summary.totalSavings)}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/documents")}
              style={styles.actionBtnPrimary}
            >
              <Ionicons name="document-text" size={18} color={COLORS.primaryNavy} />
              <Text style={styles.actionBtnPrimaryText}>Verify Required Docs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/locator")}
              style={styles.actionBtnSecondary}
            >
              <Ionicons name="location-outline" size={18} color={COLORS.surface} />
              <Text style={styles.actionBtnSecondaryText}>Find Partner Bank</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Generous padding to clear fixed bottom nav
  },
  titleBox: {
    marginBottom: 14,
  },
  screenHeading: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
  screenSubheading: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  schemePillsScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  schemePill: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    minWidth: 120,
    ...SHADOWS.small,
  },
  schemePillActive: {
    backgroundColor: COLORS.accentGoldLight,
    borderColor: COLORS.accentGold,
  },
  schemePillName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  schemePillNameActive: {
    color: COLORS.primaryNavy,
  },
  schemePillRateBox: {
    marginTop: 4,
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  schemePillRateBoxActive: {
    backgroundColor: COLORS.primaryNavy,
  },
  schemePillRateText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  schemePillRateTextActive: {
    color: COLORS.accentGold,
  },
  cardSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  inputSectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryNavy,
  },
  schemeMaxLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  costInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
    paddingHorizontal: 12,
    height: 50,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryNavy,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  adjustButton: {
    width: 44,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  quickAddRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  quickAddChip: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAddText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primaryNavy,
  },
  marginNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  marginNoticeCol: {
    flex: 1,
    alignItems: "center",
  },
  marginDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.borderDark,
  },
  marginNoticeLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  loanVal: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.success,
    marginTop: 2,
  },
  marginVal: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primaryNavy,
    marginTop: 2,
  },
  tenurePillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tenurePill: {
    flex: 1,
    minWidth: 50,
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  tenurePillActive: {
    backgroundColor: COLORS.primaryNavy,
    borderColor: COLORS.primaryNavy,
  },
  tenurePillText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  tenurePillTextActive: {
    color: COLORS.surface,
    fontWeight: "700",
  },
  emiHighlightCard: {
    backgroundColor: COLORS.primaryNavy,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    ...SHADOWS.medium,
  },
  emiTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emiLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(241, 236, 224, 0.8)",
    letterSpacing: 0.5,
  },
  emiAmount: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.surface,
    marginTop: 2,
  },
  ratePill: {
    backgroundColor: "rgba(232, 163, 61, 0.2)",
    borderWidth: 1,
    borderColor: COLORS.accentGold,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratePillText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.accentGold,
  },
  moratoriumNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  moratoriumText: {
    fontSize: 12,
    color: "rgba(241, 236, 224, 0.9)",
    flex: 1,
    lineHeight: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
  },
  statItem: {
    alignItems: "center",
  },
  statItemLabel: {
    fontSize: 10.5,
    color: "rgba(241, 236, 224, 0.7)",
  },
  statItemVal: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.surface,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtnPrimary: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.accentGold,
    paddingVertical: 14,
    borderRadius: 12,
    ...SHADOWS.small,
  },
  actionBtnPrimaryText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primaryNavy,
    paddingVertical: 14,
    borderRadius: 12,
    ...SHADOWS.small,
  },
  actionBtnSecondaryText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.surface,
  },
});
