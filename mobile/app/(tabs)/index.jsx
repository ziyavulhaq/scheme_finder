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
import { BigOptionButton } from "../../components/BigOptionButton";
import { SchemeCard } from "../../components/SchemeCard";
import { COLORS, TYPOGRAPHY, SHADOWS } from "../../constants/theme";
import { matchScheme } from "../../utils/rulesEngine";
import { formatINR, formatLakhs } from "../../utils/financialMath";

export default function FindSchemeScreen() {
  const router = useRouter();

  // Questionnaire state
  const [projectType, setProjectType] = useState("trade");
  const [costInput, setCostInput] = useState("140000");
  const [annualIncome, setAnnualIncome] = useState("180000");
  const [isSCCategory, setIsSCCategory] = useState(true);

  // Evaluate eligibility deterministically
  const evaluation = matchScheme({
    projectType,
    projectCost: Number(costInput) || 0,
    annualIncome: Number(annualIncome) || 0,
    isSCCategory,
  });

  const quickCostAmounts = [
    { label: "₹50,000", value: 50000 },
    { label: "₹1.4 Lakh", value: 140000 },
    { label: "₹5 Lakh", value: 500000 },
    { label: "₹10 Lakh", value: 1000000 },
    { label: "₹25 Lakh", value: 2500000 },
    { label: "₹50 Lakh", value: 5000000 },
  ];

  const presets = [
    { label: "Vendor • ₹1.4L", type: "trade", cost: "140000", income: "180000" },
    { label: "Workshop • ₹5L", type: "manufacturing", cost: "500000", income: "240000" },
    { label: "B.Tech • ₹8L", type: "education", cost: "800000", income: "300000" },
  ];

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
          {/* Hero Banner with Official Subsidies Headline */}
          <View style={styles.heroCard}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles" size={13} color={COLORS.accentGold} />
                <Text style={styles.heroBadgeText}>GOVERNMENT SCHEME GUIDE</Text>
              </View>
              <View style={styles.heroBadgeSecondary}>
                <Text style={styles.heroBadgeSecondaryText}>MoSJE / NSFDC</Text>
              </View>
            </View>

            <Text style={styles.heroHeading}>
              Get Concessional Loans up to ₹50 Lakhs at 4.0% – 8.0% p.a.
            </Text>

            <Text style={styles.heroSubheading}>
              Tailored financial assistance covering up to 90% of project costs for Scheduled Caste (SC) entrepreneurs and students with family income ≤ ₹5.00 Lakhs.
            </Text>

            {/* 4 Stat Metrics Pills matching Web */}
            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Text style={styles.statVal}>4.0% – 8.0%</Text>
                <Text style={styles.statLbl}>Concessional Rates</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statVal}>Up to 90%</Text>
                <Text style={styles.statLbl}>Cost Covered</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statVal}>≤ ₹5.00 L/yr</Text>
                <Text style={styles.statLbl}>Income Ceiling</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statVal}>100+ Partners</Text>
                <Text style={styles.statLbl}>SCAs & Banks</Text>
              </View>
            </View>

            {/* Quick Demo Presets */}
            <View style={styles.presetSection}>
              <Text style={styles.presetLabel}>Quick Presets:</Text>
              <View style={styles.presetsRow}>
                {presets.map((p) => (
                  <TouchableOpacity
                    key={p.label}
                    activeOpacity={0.7}
                    onPress={() => {
                      setProjectType(p.type);
                      setCostInput(p.cost);
                      setAnnualIncome(p.income);
                      setIsSCCategory(true);
                    }}
                    style={styles.presetChip}
                  >
                    <Text style={styles.presetChipText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Form Header */}
          <View style={styles.formHeaderBox}>
            <Text style={styles.formTitle}>AI Scheme Eligibility Assessment</Text>
            <Text style={styles.formSubtitle}>
              Answer 4 simple questions to find the exact concessional loan tailored for your business or study.
            </Text>
          </View>

          {/* Question 1: Activity Type */}
          <View style={styles.sectionBox}>
            <View style={styles.stepHeader}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNum}>1</Text>
              </View>
              <Text style={styles.stepTitle}>What are you raising money for?</Text>
            </View>

            <BigOptionButton
              icon="cart-outline"
              title="Small Trade or Shop"
              subtitle="Grocery, retail, street vending, artisans, allied activities"
              badgeText="6.5% Rate"
              selected={projectType === "trade"}
              onPress={() => setProjectType("trade")}
            />

            <BigOptionButton
              icon="construct-outline"
              title="Manufacturing or Production Unit"
              subtitle="Workshop, fabrication, food processing, machinery & equipment"
              badgeText="8.0% Rate"
              selected={projectType === "manufacturing"}
              onPress={() => setProjectType("manufacturing")}
            />

            <BigOptionButton
              icon="car-outline"
              title="Services Business"
              subtitle="Repair, IT, transport, logistics, healthcare services"
              badgeText="8.0% Rate"
              selected={projectType === "services"}
              onPress={() => setProjectType("services")}
            />

            <BigOptionButton
              icon="leaf-outline"
              title="Agriculture-Allied Activity"
              subtitle="Dairy farming, poultry, fishery, agri-logistics"
              badgeText="6.5% / 8.0%"
              selected={projectType === "agri"}
              onPress={() => setProjectType("agri")}
            />

            <BigOptionButton
              icon="school-outline"
              title="Higher Education or Professional Course"
              subtitle="Engineering, MBBS, MBA, recognized domestic or overseas degrees"
              badgeText="Lowest 4.0%"
              selected={projectType === "education"}
              onPress={() => setProjectType("education")}
            />
          </View>

          {/* Question 2: Project Cost */}
          <View style={styles.sectionBox}>
            <View style={styles.stepHeader}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNum}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Estimated Project Cost or Course Fee</Text>
            </View>

            {/* Quick Amounts Chips */}
            <View style={styles.quickChipsContainer}>
              {quickCostAmounts.map((chip) => {
                const isChipSelected = Number(costInput) === chip.value;
                return (
                  <TouchableOpacity
                    key={chip.value}
                    activeOpacity={0.7}
                    onPress={() => setCostInput(String(chip.value))}
                    style={[
                      styles.quickChip,
                      isChipSelected ? styles.quickChipActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        isChipSelected ? styles.quickChipTextActive : null,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Cost Input Box */}
            <View style={styles.inputWrapper}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={costInput}
                onChangeText={setCostInput}
                placeholder="Enter project cost"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Statutory 90% Loan vs 10% Margin Bar */}
            <View style={styles.marginPreviewBox}>
              <View style={styles.marginBarRow}>
                <View style={[styles.barPartLoan, { flex: 9 }]} />
                <View style={[styles.barPartMargin, { flex: 1 }]} />
              </View>
              <View style={styles.marginBarLabels}>
                <Text style={styles.marginBarLeft}>
                  90% Govt Loan: {formatINR(Math.round(0.9 * (Number(costInput) || 0)))}
                </Text>
                <Text style={styles.marginBarRight}>
                  10% Margin: {formatINR(Math.round(0.1 * (Number(costInput) || 0)))}
                </Text>
              </View>
            </View>
          </View>

          {/* Question 3: Annual Family Income */}
          <View style={styles.sectionBox}>
            <View style={styles.stepHeader}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNum}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Annual Family Income (MoSJE ≤ ₹5 Lakhs Ceiling)</Text>
            </View>

            <View style={styles.incomeOptionsRow}>
              {[
                { label: "≤ ₹3.00 Lakhs", sub: "Priority Beneficiary", value: "180000" },
                { label: "₹3.00 – ₹5.00 Lakhs", sub: "Standard Eligibility", value: "420000" },
                { label: "> ₹5.00 Lakhs", sub: "Above Ceiling", value: "600000" },
              ].map((item) => {
                const isSelected = annualIncome === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    activeOpacity={0.7}
                    onPress={() => setAnnualIncome(item.value)}
                    style={[
                      styles.incomePill,
                      isSelected ? styles.incomePillActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.incomePillText,
                        isSelected ? styles.incomePillTextActive : null,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.incomePillSub,
                        isSelected ? styles.incomePillSubActive : null,
                      ]}
                    >
                      {item.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Question 4: Category Verification */}
          <View style={styles.sectionBox}>
            <View style={styles.stepHeader}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNum}>4</Text>
              </View>
              <Text style={styles.stepTitle}>Do you belong to the Scheduled Caste (SC) Community?</Text>
            </View>

            <View style={styles.casteButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsSCCategory(true)}
                style={[
                  styles.casteButton,
                  isSCCategory ? styles.casteButtonActive : null,
                ]}
              >
                <Ionicons
                  name={isSCCategory ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={isSCCategory ? COLORS.surface : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.casteButtonText,
                    isSCCategory ? styles.casteButtonTextActive : null,
                  ]}
                >
                  Yes, I have an SC Caste Certificate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsSCCategory(false)}
                style={[
                  styles.casteButton,
                  !isSCCategory ? styles.casteButtonIneligible : null,
                ]}
              >
                <Ionicons
                  name={!isSCCategory ? "close-circle" : "ellipse-outline"}
                  size={18}
                  color={!isSCCategory ? COLORS.danger : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.casteButtonText,
                    !isSCCategory ? styles.casteButtonTextIneligible : null,
                  ]}
                >
                  No, other community
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scheme Result Section */}
          {evaluation.status === "eligible" ? (
            <View style={styles.resultSection}>
              <View style={styles.resultBadgeRow}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.resultBadgeText}>You Are Eligible for Concessional Credit!</Text>
              </View>

              <SchemeCard
                scheme={evaluation.scheme}
                enteredCost={evaluation.enteredCost}
                eligibleLoan={evaluation.eligibleLoan}
                marginMoney={evaluation.marginMoney}
                isCapped={evaluation.isCapped}
                onPressCalculate={() => router.push("/(tabs)/calculator")}
                onPressDocuments={() => router.push("/(tabs)/documents")}
              />
            </View>
          ) : (
            <View style={styles.ineligibleBox}>
              <Ionicons name="alert-circle" size={28} color={COLORS.warning} />
              <Text style={styles.ineligibleTitle}>Eligibility Notice</Text>
              <Text style={styles.ineligibleReason}>{evaluation.reason}</Text>
              <Text style={styles.ineligibleRemedy}>{evaluation.remedy}</Text>
            </View>
          )}
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
  heroCard: {
    backgroundColor: COLORS.primaryNavy,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(232, 163, 61, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  heroBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: COLORS.accentGold,
    letterSpacing: 0.5,
  },
  heroBadgeSecondary: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  heroBadgeSecondaryText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "rgba(241, 236, 224, 0.9)",
  },
  heroHeading: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.surface,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  heroSubheading: {
    fontSize: 12.5,
    color: "rgba(241, 236, 224, 0.88)",
    marginTop: 6,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
  },
  statPill: {
    flex: 1,
    minWidth: "46%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statVal: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.accentGold,
  },
  statLbl: {
    fontSize: 10,
    color: "rgba(241, 236, 224, 0.8)",
    marginTop: 1,
  },
  presetSection: {
    marginTop: 12,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(241, 236, 224, 0.75)",
    marginBottom: 6,
  },
  presetsRow: {
    flexDirection: "row",
    gap: 6,
  },
  presetChip: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  presetChipText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.surface,
  },
  formHeaderBox: {
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
  formSubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  sectionBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryNavy,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "800",
  },
  stepTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: COLORS.primaryNavy,
    flex: 1,
  },
  quickChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  quickChip: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickChipActive: {
    backgroundColor: COLORS.accentGoldLight,
    borderColor: COLORS.accentGold,
  },
  quickChipText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  quickChipTextActive: {
    color: COLORS.primaryNavy,
    fontWeight: "800",
  },
  inputWrapper: {
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
  marginPreviewBox: {
    marginTop: 10,
    backgroundColor: COLORS.surfaceSecondary,
    padding: 10,
    borderRadius: 8,
  },
  marginBarRow: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barPartLoan: {
    backgroundColor: COLORS.success,
  },
  barPartMargin: {
    backgroundColor: COLORS.primaryNavy,
  },
  marginBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  marginBarLeft: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.success,
  },
  marginBarRight: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primaryNavy,
  },
  incomeOptionsRow: {
    flexDirection: "row",
    gap: 6,
  },
  incomePill: {
    flex: 1,
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  incomePillActive: {
    backgroundColor: COLORS.accentGoldLight,
    borderColor: COLORS.accentGold,
  },
  incomePillText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  incomePillTextActive: {
    color: COLORS.primaryNavy,
  },
  incomePillSub: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: "center",
  },
  incomePillSubActive: {
    color: COLORS.textGold,
    fontWeight: "600",
  },
  casteButtonsRow: {
    gap: 8,
  },
  casteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48,
  },
  casteButtonActive: {
    backgroundColor: COLORS.primaryNavy,
    borderColor: COLORS.primaryNavy,
  },
  casteButtonIneligible: {
    backgroundColor: COLORS.dangerLight,
    borderColor: COLORS.danger,
  },
  casteButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  casteButtonTextActive: {
    color: COLORS.surface,
  },
  casteButtonTextIneligible: {
    color: COLORS.danger,
  },
  resultSection: {
    marginTop: 8,
  },
  resultBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.successLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  resultBadgeText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: COLORS.success,
  },
  ineligibleBox: {
    backgroundColor: COLORS.warningLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.warning,
    alignItems: "center",
    marginTop: 10,
  },
  ineligibleTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.warning,
    marginTop: 6,
  },
  ineligibleReason: {
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  ineligibleRemedy: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 17,
  },
});
