import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, TYPOGRAPHY, SHADOWS } from "../constants/theme";

export const ReferralSlipModal = ({
  visible,
  onClose,
  partner,
  schemeName = "NSFDC Micro Finance Scheme (MCF)",
  beneficiary = {
    name: "Ramesh S.",
    category: "Scheduled Caste (SC)",
    income: "₹1,80,000 / annum",
    loanRequired: "₹1,40,000",
  },
}) => {
  if (!partner) return null;

  const refId = `MoSJE-2026-${Math.floor(100000 + (partner.id ? partner.id.length * 12345 : 482918))}`;
  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleShare = async () => {
    try {
      const message = `*FINORA - Official Scheme Application Referral Slip*
Ref ID: ${refId}
Date: ${todayStr}

Beneficiary: ${beneficiary.name}
Category: ${beneficiary.category}
Scheme: ${schemeName}
Loan: ${beneficiary.loanRequired}

*Assigned Partner Branch:*
${partner.name}
${partner.address}
Helpline: ${partner.phone || "1800 1234"}

*Documents to Carry:*
1. Aadhaar Card (Original + 2 copies)
2. Caste/Community Certificate
3. Income Certificate / BPL Card
4. Bank Passbook copy with IFSC
5. 3 Passport size photographs
6. Project Cost Estimate / Quotation

*Official Ministry of Social Justice & Empowerment (MoSJE) Priority Channeling*`;

      await Share.share({
        message,
        title: `FINORA Visit Slip - ${partner.shortName || partner.name}`,
      });
    } catch (error) {}
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarTitleRow}>
              <Ionicons name="document-text" size={18} color={COLORS.accentGold} />
              <Text style={styles.topBarTitle}>Official Branch Visit Slip</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.surface} />
            </TouchableOpacity>
          </View>

          {/* Slip Printable/Viewable Body */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Emblem */}
            <View style={styles.slipHeaderBox}>
              <View style={styles.emblemRow}>
                <Ionicons name="ribbon" size={24} color={COLORS.accentGoldDark} />
              </View>
              <Text style={styles.ministryTitle}>GOVERNMENT OF INDIA</Text>
              <Text style={styles.deptTitle}>
                MINISTRY OF SOCIAL JUSTICE & EMPOWERMENT
              </Text>
              <Text style={styles.slipBadge}>PRIORITY CITIZEN REFERRAL SLIP</Text>
            </View>

            {/* Reference Bar */}
            <View style={styles.refBar}>
              <View>
                <Text style={styles.refLabel}>REFERRAL ID</Text>
                <Text style={styles.refVal}>{refId}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.refLabel}>DATE OF GENERATION</Text>
                <Text style={styles.refVal}>{todayStr}</Text>
              </View>
            </View>

            {/* Beneficiary Details */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeader}>1. Beneficiary Profile</Text>
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Applicant Name:</Text>
                <Text style={styles.gridValue}>{beneficiary.name}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Social Category:</Text>
                <Text style={styles.gridValue}>{beneficiary.category}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Annual Income:</Text>
                <Text style={styles.gridValue}>{beneficiary.income}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Scheme Selected:</Text>
                <Text style={[styles.gridValue, { color: COLORS.accentGoldDark }]}>
                  {schemeName}
                </Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Assistance Amount:</Text>
                <Text style={[styles.gridValue, { fontWeight: "800" }]}>
                  {beneficiary.loanRequired}
                </Text>
              </View>
            </View>

            {/* Allocated Partner Branch */}
            <View style={[styles.sectionCard, { borderColor: COLORS.primaryNavy }]}>
              <View style={styles.partnerTitleRow}>
                <Ionicons name="business" size={16} color={COLORS.primaryNavy} />
                <Text style={[styles.cardHeader, { marginBottom: 0 }]}>
                  2. Designated Bank / SCA Branch
                </Text>
              </View>
              <Text style={styles.partnerNameText}>{partner.name}</Text>
              <Text style={styles.partnerTypeText}>
                {partner.type} • Shortest Route {partner.distance} km
              </Text>
              <Text style={styles.partnerAddrText}>{partner.address}</Text>

              {partner.phone && (
                <View style={styles.phonePill}>
                  <Ionicons name="call" size={13} color={COLORS.success} />
                  <Text style={styles.phonePillText}>
                    Desk Helpline: {partner.phone}
                  </Text>
                </View>
              )}
            </View>

            {/* Checklist of Docs to Bring */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeader}>3. Mandatory Documents Checklist</Text>
              {[
                "Original Aadhaar Card + 2 Photocopies",
                "Caste / Community Certificate (Govt Authorized)",
                "Income Certificate (Income ≤ ₹5,00,000 p.a.)",
                "Active Bank Passbook Copy (showing IFSC & Account)",
                "3 Recent Passport Size Photographs",
                "Quotation / Machinery Estimate / Business Plan",
              ].map((item, idx) => (
                <View key={idx} style={styles.docCheckRow}>
                  <Ionicons
                    name="checkbox"
                    size={16}
                    color={COLORS.success}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.docCheckText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Official Instructions Notice */}
            <View style={styles.noticeBox}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={COLORS.primaryNavy}
                style={{ marginTop: 2 }}
              />
              <Text style={styles.noticeText}>
                Present this referral slip at the bank’s Priority Sector Lending
                Desk. Under MoSJE mandates, eligible beneficiaries are exempted
                from collateral security up to ₹10 Lakhs.
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Action Buttons */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleShare}
              style={styles.shareBtn}
            >
              <Ionicons name="share-social" size={16} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share / Save Slip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={styles.doneBtn}
            >
              <Text style={styles.doneBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
  },
  modalCard: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
    ...SHADOWS.card,
  },
  topBar: {
    backgroundColor: COLORS.primaryNavy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topBarTitle: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "800",
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    flexGrow: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 24,
  },
  slipHeaderBox: {
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.borderDark,
    marginBottom: 12,
  },
  emblemRow: {
    marginBottom: 4,
  },
  ministryTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
  },
  deptTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primaryNavy,
    textAlign: "center",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  slipBadge: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.accentGoldDark,
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  refBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.surfaceSecondary,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  refLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: "700",
  },
  refVal: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primaryNavy,
    marginTop: 1,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primaryNavy,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  gridLabel: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  gridValue: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  partnerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  partnerNameText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
  partnerTypeText: {
    fontSize: 10.5,
    color: COLORS.success,
    fontWeight: "700",
    marginTop: 2,
  },
  partnerAddrText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 15,
  },
  phonePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.successLight,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  phonePillText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.success,
  },
  docCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2.5,
  },
  docCheckText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  noticeBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: COLORS.surfaceSecondary,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "flex-start",
  },
  noticeText: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 14,
  },
  footerRow: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
    backgroundColor: COLORS.surfaceSecondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  shareBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.success,
    paddingVertical: 10,
    borderRadius: 10,
    ...SHADOWS.small,
  },
  shareBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  doneBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    paddingVertical: 10,
    borderRadius: 10,
  },
  doneBtnText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
});
