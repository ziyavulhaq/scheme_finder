import React from "react";
import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.accentGold,
        tabBarInactiveTintColor: "rgba(241, 236, 224, 0.75)",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      {/* 1. Find Scheme */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Find Scheme",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Calculate EMI */}
      <Tabs.Screen
        name="calculator"
        options={{
          title: "Calculate EMI",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "calculator" : "calculator-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Verify Docs - Highlighted Golden-Orange Button */}
      <Tabs.Screen
        name="documents"
        options={{
          title: "Verify Docs",
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                styles.docsLabel,
                focused ? styles.docsLabelActive : styles.docsLabelInactive,
              ]}
            >
              Verify Docs
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.docsHighlightBtn,
                focused ? styles.docsHighlightBtnActive : null,
              ]}
            >
              <Ionicons
                name={focused ? "document-text" : "document-text-outline"}
                size={20}
                color={COLORS.primaryNavy}
              />
            </View>
          ),
        }}
      />

      {/* 4. Nearby Banks */}
      <Tabs.Screen
        name="locator"
        options={{
          title: "Nearby Banks",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "location" : "location-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.primaryNavy,
    borderTopWidth: 2,
    borderTopColor: COLORS.accentGold,
    height: Platform.OS === "ios" ? 88 : 70,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
    paddingTop: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...SHADOWS.tabBar,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
  docsHighlightBtn: {
    backgroundColor: COLORS.accentGold,
    width: 36,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    ...SHADOWS.small,
  },
  docsHighlightBtnActive: {
    backgroundColor: "#F2B04D",
    transform: [{ scale: 1.05 }],
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  docsLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  docsLabelActive: {
    color: COLORS.accentGold,
  },
  docsLabelInactive: {
    color: COLORS.accentGold,
  },
});
