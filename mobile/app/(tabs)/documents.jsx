import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components/Header";
import { COLORS, TYPOGRAPHY, SHADOWS } from "../../constants/theme";
import {
  MANDATORY_DOCUMENTS,
  SCHEME_SPECIFIC_DOCUMENTS,
} from "../../constants/documents";

export default function DocumentsScreen() {
  const router = useRouter();

  // Checked documents state (keyed by doc ID)
  const [checkedDocs, setCheckedDocs] = useState({
    caste: true,
    aadhaar: true,
    passbook: true,
  });

  const [activeSchemeFilter, setActiveSchemeFilter] = useState("all");

  const toggleCheck = (docId) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  // Compute total mandatory ready
  const mandatoryCount = MANDATORY_DOCUMENTS.length;
  const readyCount = MANDATORY_DOCUMENTS.filter((d) => checkedDocs[d.id]).length;
  const progressPercent = Math.round((readyCount / mandatoryCount) * 100);

  // Scheme specific list
  const specificList =
    activeSchemeFilter === "all"
      ? [
          ...SCHEME_SPECIFIC_DOCUMENTS.micro,
          ...SCHEME_SPECIFIC_DOCUMENTS.term,
          ...SCHEME_SPECIFIC_DOCUMENTS.education,
        ]
      : SCHEME_SPECIFIC_DOCUMENTS[activeSchemeFilter] || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <Header />

      <ScrollView
        style={styles.flexOne}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressTopRow}>
            <View>
              <Text style={styles.progressTitle}>Document Readiness</Text>
              <Text style={styles.progressSubtitle}>
                {readyCount} of {mandatoryCount} Mandatory Documents Ready ({progressPercent}%)
              </Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{progressPercent}%</Text>
            </View>
          </View>

          {/* Progress Bar Track */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>

          <Text style={styles.progressNote}>
            Having these ready guarantees zero rejection at your State Channelizing Agency or Bank Branch.
          </Text>
        </View>

        {/* Section 1: Mandatory Documents */}
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark" size={18} color={COLORS.primaryNavy} />
          <Text style={styles.sectionTitle}>Statutory Mandatory Documents</Text>
        </View>

        {MANDATORY_DOCUMENTS.map((doc) => {
          const isReady = !!checkedDocs[doc.id];
          return (
            <TouchableOpacity
              key={doc.id}
              activeOpacity={0.7}
              onPress={() => toggleCheck(doc.id)}
              style={[
                styles.docCard,
                isReady ? styles.docCardReady : styles.docCardPending,
              ]}
            >
              <View style={styles.docCardTop}>
                <View
                  style={[
                    styles.checkCircle,
                    isReady ? styles.checkCircleReady : styles.checkCirclePending,
                  ]}
                >
                  <Ionicons
                    name={isReady ? "checkmark" : "add"}
                    size={16}
                    color={isReady ? COLORS.surface : COLORS.textMuted}
                  />
                </View>

                <View style={styles.docTextContainer}>
                  <View style={styles.docTitleRow}>
                    <Text style={styles.docTitle}>{doc.title}</Text>
                    <View
                      style={[
                        styles.statusPill,
                        isReady ? styles.statusPillReady : styles.statusPillPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          isReady ? styles.statusPillTextReady : styles.statusPillTextPending,
                        ]}
                      >
                        {isReady ? "READY" : "NEEDED"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.docSubtitle}>{doc.subtitle}</Text>
                  <Text style={styles.docDescription}>{doc.description}</Text>

                  {doc.tip && (
                    <View style={styles.tipBox}>
                      <Ionicons name="bulb-outline" size={13} color={COLORS.accentGold} />
                      <Text style={styles.tipText}>{doc.tip}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Section 2: Scheme Specific Documents */}
        <View style={[styles.sectionHeader, { marginTop: 14 }]}>
          <Ionicons name="folder-open" size={18} color={COLORS.primaryNavy} />
          <Text style={styles.sectionTitle}>Scheme Specific Project Papers</Text>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsScroll}
        >
          {[
            { id: "all", label: "All Schemes" },
            { id: "micro", label: "Micro Finance" },
            { id: "term", label: "Term Loan" },
            { id: "education", label: "Education Loan" },
          ].map((pill) => {
            const isSelected = activeSchemeFilter === pill.id;
            return (
              <TouchableOpacity
                key={pill.id}
                activeOpacity={0.7}
                onPress={() => setActiveSchemeFilter(pill.id)}
                style={[
                  styles.filterPill,
                  isSelected ? styles.filterPillActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected ? styles.filterPillTextActive : null,
                  ]}
                >
                  {pill.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {specificList.map((doc) => {
          const isReady = !!checkedDocs[doc.id];
          return (
            <TouchableOpacity
              key={doc.id}
              activeOpacity={0.7}
              onPress={() => toggleCheck(doc.id)}
              style={[
                styles.docCard,
                isReady ? styles.docCardReady : styles.docCardPending,
              ]}
            >
              <View style={styles.docCardTop}>
                <View
                  style={[
                    styles.checkCircle,
                    isReady ? styles.checkCircleReady : styles.checkCirclePending,
                  ]}
                >
                  <Ionicons
                    name={isReady ? "checkmark" : "add"}
                    size={16}
                    color={isReady ? COLORS.surface : COLORS.textMuted}
                  />
                </View>

                <View style={styles.docTextContainer}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docSubtitle}>{doc.subtitle}</Text>
                  <Text style={styles.docDescription}>{doc.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Route to Partner Banks */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/locator")}
          style={styles.bottomCtaButton}
        >
          <Ionicons name="location" size={18} color={COLORS.surface} />
          <Text style={styles.bottomCtaText}>Find Authorized Bank Branch to Apply</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.surface} />
        </TouchableOpacity>
      </ScrollView>
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
  progressCard: {
    backgroundColor: COLORS.primaryNavy,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  progressTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.surface,
  },
  progressSubtitle: {
    fontSize: 12,
    color: "rgba(241, 236, 224, 0.85)",
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.primaryNavy,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 4,
    marginVertical: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.accentGold,
    borderRadius: 4,
  },
  progressNote: {
    fontSize: 11.5,
    color: "rgba(241, 236, 224, 0.75)",
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
  filterPillsScroll: {
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryNavy,
    borderColor: COLORS.primaryNavy,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.surface,
    fontWeight: "700",
  },
  docCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    ...SHADOWS.small,
  },
  docCardReady: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.success,
  },
  docCardPending: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  docCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkCircleReady: {
    backgroundColor: COLORS.success,
  },
  checkCirclePending: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
  },
  docTextContainer: {
    flex: 1,
  },
  docTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  docTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: COLORS.primaryNavy,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillReady: {
    backgroundColor: COLORS.successLight,
  },
  statusPillPending: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800",
  },
  statusPillTextReady: {
    color: COLORS.success,
  },
  statusPillTextPending: {
    color: COLORS.textMuted,
  },
  docSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  docDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
    lineHeight: 16,
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.accentGoldLight,
    padding: 6,
    borderRadius: 6,
    marginTop: 8,
  },
  tipText: {
    fontSize: 11,
    color: COLORS.textGold,
    fontWeight: "600",
    flex: 1,
  },
  bottomCtaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primaryNavy,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    ...SHADOWS.small,
  },
  bottomCtaText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: COLORS.surface,
  },
});
