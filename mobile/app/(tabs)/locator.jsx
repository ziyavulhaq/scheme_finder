import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Header } from "../../components/Header";
import { InteractiveMap } from "../../components/InteractiveMap";
import { ReferralSlipModal } from "../../components/ReferralSlipModal";
import { COLORS, TYPOGRAPHY, SHADOWS } from "../../constants/theme";
import {
  getAllPartnersWithDistance,
  calculateDistanceKm,
} from "../../constants/partners";

const SCHEME_FILTERS = [
  { id: "all", label: "All Schemes" },
  { id: "micro", label: "Micro Finance (MCF - ₹1.4L)" },
  { id: "msy", label: "Mahila Samriddhi (MSY)" },
  { id: "term", label: "Term Loan (TL - ₹50L)" },
  { id: "education", label: "Education Loan (ELS - ₹20L)" },
  { id: "green-business", label: "Green Business (GBS - ₹30L)" },
  { id: "suy", label: "Swachhta Udyami (SUY - ₹50L)" },
];

export default function LocatorScreen() {
  const [userLoc, setUserLoc] = useState({ lat: 11.01515, lng: 76.976618 });
  const [locationName, setLocationName] = useState("Coimbatore, Tamil Nadu");
  const [detectedState, setDetectedState] = useState("Tamil Nadu");
  const [cityInput, setCityInput] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [slipModalPartner, setSlipModalPartner] = useState(null);
  const [noticeMessage, setNoticeMessage] = useState("");

  const scrollViewRef = useRef(null);

  // Compute nearby partners based on user location & selected scheme filter
  const partners = getAllPartnersWithDistance(
    userLoc.lat,
    userLoc.lng,
    selectedFilter
  );

  // Handle manual city / PIN code search with OpenStreetMap Nominatim
  const handleCitySearch = async () => {
    const query = cityInput.trim();
    if (!query) return;

    setLoading(true);
    setNoticeMessage("");

    try {
      const isPin = /^\d{6}$/.test(query);
      const searchQuery = isPin ? query : `${query}, India`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        searchQuery
      )}&format=json&limit=1&countrycodes=in`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "FINORA-Mobile/1.0 (contact@finora.gov.in)",
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Search service error");

      const data = await response.json();

      if (data && data.length > 0) {
        const item = data[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);
        const displayName = item.display_name;

        // Try extracting state
        const parts = displayName.split(",");
        const stateName = parts.length >= 2 ? parts[parts.length - 2].trim() : "India";

        setUserLoc({ lat: newLat, lng: newLng });
        setLocationName(displayName.split(",").slice(0, 3).join(","));
        setDetectedState(stateName);
      } else {
        Alert.alert(
          "Location Not Found",
          `Could not locate "${query}". Please check the spelling or enter a 6-digit Indian PIN code.`
        );
      }
    } catch (error) {
      setNoticeMessage("Network search issue. Showing nearest verified partner directory.");
    } finally {
      setLoading(false);
    }
  };

  // Handle "Use My GPS"
  const handleUseCurrentLocation = async () => {
    setGpsLoading(true);
    setNoticeMessage("");

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Denied",
          "Permission to access device GPS was denied. You can search by Indian city name or PIN code above."
        );
        setGpsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      setUserLoc({ lat, lng });

      // Reverse geocode
      try {
        const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`;
        const res = await fetch(revUrl, {
          headers: {
            "User-Agent": "FINORA-Mobile/1.0 (contact@finora.gov.in)",
            Accept: "application/json",
          },
        });
        if (res.ok) {
          const revData = await res.json();
          const addr = revData.address || {};
          const cityOrDistrict =
            addr.city || addr.town || addr.district || addr.county || "Current Location";
          const state = addr.state || "India";
          setLocationName(`${cityOrDistrict}, ${state}`);
          setDetectedState(state);
        }
      } catch (e) {
        setLocationName(`Lat: ${lat.toFixed(3)}, Lng: ${lng.toFixed(3)}`);
      }
    } catch (error) {
      Alert.alert(
        "GPS Unavailable",
        "Could not determine current location. Please verify device GPS is enabled or search manually."
      );
    } finally {
      setGpsLoading(false);
    }
  };

  // One-touch phone call
  const handleCall = (phoneNumber) => {
    if (!phoneNumber) return;
    const cleaned = phoneNumber.replace(/[^0-9]/g, "");
    Linking.openURL(`tel:${cleaned}`).catch(() => {
      Alert.alert("Call Unavailable", `Number: ${phoneNumber}`);
    });
  };

  // Open driving directions in Google Maps
  const handleDirections = (directionsUrl) => {
    if (directionsUrl) {
      Linking.openURL(directionsUrl).catch(() => {});
    }
  };

  // Partner selection from Map or Card
  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <Header />

      <ScrollView
        ref={scrollViewRef}
        style={styles.flexOne}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Info Banner */}
        <View style={styles.bannerBox}>
          <View style={styles.bannerHeaderRow}>
            <Ionicons name="map" size={18} color={COLORS.primaryNavy} />
            <Text style={styles.bannerTitle}>Authorized Partner Branch Locator</Text>
          </View>
          <Text style={styles.bannerSubtitle}>
            Find the nearest official State Channelizing Agency (SCA) or Public Sector Bank (PSB) branch for instant concessional loan processing.
          </Text>
        </View>

        {/* Location Search & GPS Controls Card */}
        <View style={styles.controlsCard}>
          {/* Search Input */}
          <View style={styles.searchRow}>
            <View style={styles.inputWrapper}>
              <Ionicons name="search" size={18} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search city, district, or 6-digit PIN..."
                placeholderTextColor={COLORS.textMuted}
                value={cityInput}
                onChangeText={setCityInput}
                onSubmitEditing={handleCitySearch}
                returnKeyType="search"
              />
              {cityInput ? (
                <TouchableOpacity onPress={() => setCityInput("")} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCitySearch}
              style={styles.searchBtn}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.searchBtnText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* GPS Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleUseCurrentLocation}
            style={styles.gpsBtn}
          >
            {gpsLoading ? (
              <ActivityIndicator size="small" color={COLORS.accentGoldDark} />
            ) : (
              <Ionicons name="locate" size={16} color={COLORS.accentGoldDark} />
            )}
            <Text style={styles.gpsBtnText}>Use My Current GPS</Text>
          </TouchableOpacity>

          {/* Active Location Info Row */}
          <View style={styles.activeLocRow}>
            <View style={styles.activeLocLeft}>
              <Text style={styles.activeLocLabel}>Active Search Location:</Text>
              <Text style={styles.activeLocName} numberOfLines={1}>
                {locationName}
              </Text>
            </View>
            <View style={styles.stateChip}>
              <Text style={styles.stateChipText}>{detectedState}</Text>
            </View>
          </View>

          {noticeMessage ? (
            <View style={styles.noticeAlert}>
              <Ionicons name="information-circle" size={15} color={COLORS.accentGoldDark} />
              <Text style={styles.noticeAlertText}>{noticeMessage}</Text>
            </View>
          ) : null}
        </View>

        {/* Category Filter Chips (Pan-India Schemes) */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Filter by Concessional Scheme:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsScroll}
          >
            {SCHEME_FILTERS.map((filter) => {
              const isSelected = selectedFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedFilter(filter.id)}
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
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Interactive Map View */}
        <View style={styles.mapContainerBox}>
          <View style={styles.mapHeaderRow}>
            <View style={styles.mapTitleLeft}>
              <Ionicons name="navigate-circle" size={18} color={COLORS.primaryNavy} />
              <Text style={styles.mapTitle}>Live Interactive Geodata Map</Text>
            </View>
            <Text style={styles.mapBadge}>OpenStreetMap</Text>
          </View>

          <InteractiveMap
            userLocation={userLoc}
            partners={partners}
            selectedPartner={selectedPartner}
            onSelectPartner={handleSelectPartner}
            height={260}
          />

          <View style={styles.mapLegendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#B97A1C" }]} />
              <Text style={styles.legendText}>You</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#1F3A5F" }]} />
              <Text style={styles.legendText}>Bank (B)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#3B6E52" }]} />
              <Text style={styles.legendText}>Agency (S)</Text>
            </View>
          </View>
        </View>

        {/* Partner List Section */}
        <View style={styles.listHeaderRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="business" size={17} color={COLORS.primaryNavy} />
            <Text style={styles.listHeaderTitle}>
              Authorized Branches ({partners.length})
            </Text>
          </View>
          <Text style={styles.sortedText}>Sorted by shortest distance</Text>
        </View>

        {partners.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="alert-circle-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Branches Found</Text>
            <Text style={styles.emptySubtitle}>
              Try selecting "All Schemes" or searching for a nearby district or city.
            </Text>
          </View>
        ) : (
          partners.map((partner) => {
            const isSelected = selectedPartner?.id === partner.id;
            const isSCA = partner.type === "State Channelizing Agency";

            return (
              <TouchableOpacity
                key={partner.id}
                activeOpacity={0.9}
                onPress={() => handleSelectPartner(partner)}
                style={[
                  styles.partnerCard,
                  isSelected ? styles.partnerCardSelected : null,
                ]}
              >
                {/* Top Row: Name, Badge, Distance */}
                <View style={styles.partnerTopRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.typeBadge,
                          isSCA ? styles.scaBadge : styles.bankBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeBadgeText,
                            isSCA ? styles.scaBadgeText : styles.bankBadgeText,
                          ]}
                        >
                          {partner.type}
                        </Text>
                      </View>
                      {partner.utilizationStatus ? (
                        <View style={styles.statusPill}>
                          <Text style={styles.statusPillText}>
                            {partner.utilizationStatus}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.distCol}>
                    <Text style={styles.distValue}>{partner.distance} km</Text>
                    <Text style={styles.distSub}>Shortest Route</Text>
                  </View>
                </View>

                {/* Address */}
                <Text style={styles.partnerAddress}>{partner.address}</Text>

                {/* Action Buttons Row */}
                <View style={styles.cardActionsRow}>
                  {/* Call Button */}
                  {partner.phone ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleCall(partner.phone.split("•")[0])}
                      style={styles.actionBtnCall}
                    >
                      <Ionicons name="call" size={13} color={COLORS.primaryNavy} />
                      <Text style={styles.actionBtnCallText}>Call Branch</Text>
                    </TouchableOpacity>
                  ) : null}

                  {/* Directions Button */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleDirections(partner.directionsUrl)}
                    style={styles.actionBtnRoute}
                  >
                    <Ionicons name="navigate" size={13} color="#FFFFFF" />
                    <Text style={styles.actionBtnRouteText}>Directions</Text>
                  </TouchableOpacity>

                  {/* Referral Slip Button */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setSlipModalPartner(partner)}
                    style={styles.actionBtnSlip}
                  >
                    <Ionicons name="document-text" size={13} color={COLORS.primaryNavy} />
                    <Text style={styles.actionBtnSlipText}>Visit Slip</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Official Referral Slip Modal */}
      <ReferralSlipModal
        visible={!!slipModalPartner}
        onClose={() => setSlipModalPartner(null)}
        partner={slipModalPartner}
        schemeName={
          selectedFilter === "micro"
            ? "NSFDC Micro Finance Scheme (MCF)"
            : selectedFilter === "msy"
            ? "Mahila Samriddhi Yojana (MSY)"
            : selectedFilter === "term"
            ? "Term Loan Scheme (TL)"
            : selectedFilter === "education"
            ? "Education Loan Scheme (ELS)"
            : "NSFDC Concessional Loan Scheme"
        }
      />
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
  bannerBox: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bannerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  controlsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
    ...SHADOWS.small,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  searchBtn: {
    backgroundColor: COLORS.primaryNavy,
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  gpsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    borderRadius: 10,
    paddingVertical: 9,
    marginBottom: 10,
  },
  gpsBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.primaryNavy,
  },
  activeLocRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 8,
  },
  activeLocLeft: {
    flex: 1,
  },
  activeLocLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
  },
  activeLocName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primaryNavy,
    marginTop: 1,
  },
  stateChip: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  stateChipText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: COLORS.success,
  },
  noticeAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  noticeAlertText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  filterSection: {
    marginBottom: 14,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primaryNavy,
    marginBottom: 8,
  },
  filterPillsScroll: {
    gap: 8,
  },
  filterPill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryNavy,
    borderColor: COLORS.primaryNavy,
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.surface,
    fontWeight: "800",
  },
  mapContainerBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
    ...SHADOWS.small,
  },
  mapHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  mapTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mapTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
  mapBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapLegendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  listHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
  sortedText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primaryNavy,
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 3,
  },
  partnerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  partnerCardSelected: {
    borderColor: COLORS.primaryNavy,
    borderWidth: 2,
    backgroundColor: "#FBF9F4",
  },
  partnerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  partnerName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primaryNavy,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  bankBadge: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  bankBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primaryNavy,
  },
  scaBadge: {
    backgroundColor: COLORS.successLight,
  },
  scaBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.success,
  },
  statusPill: {
    backgroundColor: COLORS.accentGoldLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.accentGoldDark,
  },
  distCol: {
    alignItems: "flex-end",
  },
  distValue: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
  distSub: {
    fontSize: 9.5,
    color: COLORS.success,
    fontWeight: "700",
    marginTop: 1,
  },
  partnerAddress: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionBtnCall: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    borderRadius: 8,
    paddingVertical: 7,
  },
  actionBtnCallText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primaryNavy,
  },
  actionBtnRoute: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingVertical: 7,
  },
  actionBtnRouteText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  actionBtnSlip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: COLORS.accentGoldLight,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
    borderRadius: 8,
    paddingVertical: 7,
  },
  actionBtnSlipText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primaryNavy,
  },
});
