export const COLORS = {
  // Backgrounds
  background: "#FBF9F4",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceSecondary: "#F4EFE6",

  // Brand Primaries
  primaryNavy: "#1F3A5F",
  primaryNavyDark: "#132337",
  primaryNavyLight: "#2A4D7D",

  // Brand Accents
  accentGold: "#E8A33D",
  accentGoldHover: "#D9902B",
  accentGoldLight: "#FEF7EC",

  // Semantic
  success: "#1B5E20",
  successLight: "#E8F5E9",
  warning: "#C27803",
  warningLight: "#FFF8E1",
  danger: "#C62828",
  dangerLight: "#FFEBEE",

  // Text
  textPrimary: "#1A202C",
  textSecondary: "#4A5568",
  textMuted: "#718096",
  textLight: "#FFFFFF",
  textGold: "#B27117",

  // Borders & Dividers
  border: "#E2D9CC",
  borderLight: "#EDE6DA",
  borderDark: "#CBD5E1",
};

export const TYPOGRAPHY = {
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primaryNavy,
    lineHeight: 28,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryNavy,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  }
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tabBar: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  }
};
