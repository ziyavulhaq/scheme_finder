import { mySchemeCache } from "../data/mySchemeData.js";

/**
 * Standardize text for fuzzy comparison
 */
function cleanText(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[^\w\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize string into meaningful words, filtering trivial stopwords
 */
function getTokens(str) {
  const stopwords = new Set(["scheme", "yojana", "yojna", "pradhan", "mantri", "national", "state", "the", "and", "for", "of", "in", "to"]);
  return cleanText(str)
    .split(" ")
    .filter(w => w.length > 1 && !stopwords.has(w));
}

/**
 * Calculate Jaccard similarity between two sets of tokens
 */
function tokenSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Check if a domain is a legitimate Indian Government domain
 */
export function isGovernmentDomain(urlStr) {
  if (!urlStr || typeof urlStr !== "string") return true; // not provided
  try {
    let cleanUrl = urlStr.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = "https://" + cleanUrl;
    }
    const parsed = new URL(cleanUrl);
    const hostname = parsed.hostname.toLowerCase();

    // Whitelist genuine Indian government domains
    if (
      hostname.endsWith(".gov.in") ||
      hostname.endsWith(".nic.in") ||
      hostname.endsWith(".ac.in") ||
      hostname.endsWith(".res.in") ||
      hostname === "myscheme.gov.in" ||
      hostname === "sachet.rbi.org.in" ||
      hostname === "rbi.org.in" ||
      hostname === "nsfdc.nic.in" ||
      hostname === "mudra.org.in" ||
      hostname === "standupmitra.in" ||
      hostname === "udyamimitra.in" ||
      hostname === "jansamarth.in" ||
      hostname === "cybercrime.gov.in"
    ) {
      return true;
    }
    return false;
  } catch (e) {
    // If not parseable as a valid domain, flag as suspicious
    return false;
  }
}

/**
 * Search the cached myScheme database with fuzzy matching
 */
export function searchRegistry(query) {
  if (!query || !query.trim()) return [];
  const cleanQ = cleanText(query);
  const queryTokens = getTokens(query);
  const rawQueryUpper = query.trim().toUpperCase();

  const scored = [];

  for (const scheme of mySchemeCache) {
    let score = 0;
    const nameClean = cleanText(scheme.schemeName);
    const shortTitleClean = cleanText(scheme.schemeShortTitle);
    const slugClean = cleanText(scheme.slug);

    // 1. Exact acronym / short title match (e.g. "PMMY", "MSY", "MCF", "PMEGP")
    if (scheme.schemeShortTitle && scheme.schemeShortTitle.toUpperCase() === rawQueryUpper) {
      score += 1.0;
    } else if (shortTitleClean && cleanQ.includes(shortTitleClean)) {
      score += 0.8;
    }

    // 2. Exact slug match
    if (slugClean === cleanQ || scheme.slug.toLowerCase() === cleanQ) {
      score += 0.95;
    }

    // 3. Exact substring match in scheme name
    if (nameClean.includes(cleanQ)) {
      score += 0.75;
    } else if (cleanQ.includes(nameClean)) {
      score += 0.65;
    }

    // 4. Token overlap
    const schemeTokens = getTokens(scheme.schemeName);
    const sim = tokenSimilarity(queryTokens, schemeTokens);
    score += sim * 0.6;

    // 5. Check tags
    if (scheme.tags && scheme.tags.some(t => cleanText(t).includes(cleanQ))) {
      score += 0.25;
    }

    if (score >= 0.35) {
      scored.push({
        ...scheme,
        matchScore: Math.min(1, score),
        confidence: score >= 0.7 ? "HIGH" : "MEDIUM"
      });
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, 5);
}

/**
 * Evaluate rule-based red flags
 */
export function evaluateRedFlags({
  schemeName = "",
  websiteUrl = "",
  upfrontFeeAsked = false,
  urgencyTactics = false,
  otpOrPinRequested = false,
  unverifiableDepartment = false,
  isRegistryMatch = false
}) {
  const flags = [];

  // Flag 1: Domain check
  if (websiteUrl && websiteUrl.trim()) {
    const isGov = isGovernmentDomain(websiteUrl);
    if (!isGov) {
      flags.push({
        id: "non_gov_domain",
        titleKey: "flagDomainTitle",
        title: "Suspicious or Non-Government Website Domain",
        severity: "HIGH",
        descriptionKey: "flagDomainDesc",
        description: "Official Indian government schemes are exclusively hosted on .gov.in, .nic.in, or verified official statutory domains. Links ending in .com, .xyz, .top, or shortened links claiming to represent a government scheme are a common hallmark of phishing and advance-fee scams.",
        actionKey: "flagDomainAction",
        action: "Do not enter passwords, bank account numbers, or personal documents on non-government portals."
      });
    }
  }

  // Flag 2: Upfront fee requested
  if (upfrontFeeAsked) {
    flags.push({
      id: "upfront_fee",
      titleKey: "flagFeeTitle",
      title: "Upfront Processing Fee or Security Deposit Demanded",
      severity: "CRITICAL",
      descriptionKey: "flagFeeDesc",
      description: "Concessional government loans, subsidies, and MoSJE/NSFDC welfare schemes NEVER require the beneficiary to pay an advance registration fee, file clearance charge, or bribe to release funds. Legitimate processing costs (if any) are deducted transparently by authorized banks at disbursement.",
      actionKey: "flagFeeAction",
      action: "Never transfer money via UPI or cash to any agent promising to 'guarantee' or 'release' a government loan."
    });
  }

  // Flag 3: Urgency / Pressure tactics
  if (urgencyTactics) {
    flags.push({
      id: "urgency_tactics",
      titleKey: "flagUrgencyTitle",
      title: "Artificial Urgency or Countdown Pressure Tactics",
      severity: "HIGH",
      descriptionKey: "flagUrgencyDesc",
      description: "Pressure messages like 'offer expires in 2 hours', 'last 3 slots left', or 'instant cash if applied now' are psychological manipulation tactics used by fraudsters to bypass critical thinking. Real government schemes follow statutory gazette deadlines and open public application windows.",
      actionKey: "flagUrgencyAction",
      action: "Take your time. Consult your local District Social Welfare Office or an authorized Public Sector Bank."
    });
  }

  // Flag 4: Request for OTP, UPI PIN, or full card details
  if (otpOrPinRequested) {
    flags.push({
      id: "otp_pin_request",
      titleKey: "flagOtpTitle",
      title: "Request for OTP, UPI PIN, or Card Details",
      severity: "CRITICAL",
      descriptionKey: "flagOtpDesc",
      description: "No legitimate bank officer, government ministry, or registered NBFC will ever request your OTP, UPI PIN, or ATM PIN. Entering a UPI PIN or sharing an OTP authorizes funds to leave your account, never to receive money.",
      actionKey: "flagOtpAction",
      action: "Never share OTP or enter your UPI PIN. If already shared, immediately dial 1930 and freeze your account via your bank."
    });
  }

  // Flag 5: Unverifiable Department / Ministry
  if (unverifiableDepartment && !isRegistryMatch) {
    flags.push({
      id: "no_department",
      titleKey: "flagDeptTitle",
      title: "No Verifiable Sponsoring Ministry or Department",
      severity: "MEDIUM",
      descriptionKey: "flagDeptDesc",
      description: "Every authentic government welfare scheme is sponsored by a specific Central Ministry (e.g., MoSJE, MoMSME, MoF) or a State Government Department. An offer that claims to be a 'Government of India Scheme' but cannot name a specific nodal ministry or department is a warning sign.",
      actionKey: "flagDeptAction",
      action: "Ask the offer provider for the exact Gazette Notification number and sponsoring Ministry name."
    });
  }

  return flags;
}

/**
 * Generate full 4-Tier evidence-based assessment
 */
export function assessSchemeAndLender({
  schemeName = "",
  websiteUrl = "",
  lenderName = "",
  upfrontFeeAsked = false,
  urgencyTactics = false,
  otpOrPinRequested = false,
  unverifiableDepartment = false
}) {
  const matches = searchRegistry(schemeName);
  const bestMatch = matches.length > 0 ? matches[0] : null;
  const isRegistryMatch = Boolean(bestMatch);

  const redFlags = evaluateRedFlags({
    schemeName,
    websiteUrl,
    upfrontFeeAsked,
    urgencyTactics,
    otpOrPinRequested,
    unverifiableDepartment,
    isRegistryMatch
  });

  // Calculate highest severity
  let highestSeverity = "NONE";
  if (redFlags.some(f => f.severity === "CRITICAL")) {
    highestSeverity = "CRITICAL";
  } else if (redFlags.some(f => f.severity === "HIGH")) {
    highestSeverity = "HIGH";
  } else if (redFlags.some(f => f.severity === "MEDIUM")) {
    highestSeverity = "MEDIUM";
  }

  return {
    query: {
      schemeName,
      websiteUrl,
      lenderName
    },
    // Tier 1: Official Registry Match
    tier1: bestMatch
      ? {
          found: true,
          match: bestMatch,
          otherMatches: matches.slice(1),
          officialUrl: bestMatch.officialUrl
        }
      : null,
    // Tier 2: Not in Registry Advisory
    tier2: {
      isNotFound: !bestMatch,
      advisoryNote: "Not found in our cached myScheme registry. This does NOT prove the scheme is fake. MyScheme lists over 4,700 schemes, but very local, district-level, or municipal subsidies may not yet be cataloged. Please verify manually via myScheme's live search or your local District Welfare Office."
    },
    // Tier 3: Red Flags Checklist
    tier3: {
      hasRedFlags: redFlags.length > 0,
      flags: redFlags,
      highestSeverity,
      heuristicDisclaimer: "Rule-based heuristic advisory only. These are common documented warning signs of fraud, not a definitive legal determination."
    },
    // Tier 4: Authoritative RBI Sachet Verification
    tier4: {
      isRelevant: Boolean(lenderName || schemeName || upfrontFeeAsked),
      sachetHomeUrl: "https://sachet.rbi.org.in",
      sachetComplaintUrl: "https://sachet.rbi.org.in/sachet/file-a-complaint",
      sachetHelpRegulatorUrl: "https://sachet.rbi.org.in/sachet/help-your-regulator",
      whyUseSachet: "RBI Sachet is the official multi-regulator platform (run by RBI with SEBI, IRDAI, and State Regulators) to verify whether any NBFC, digital lending app, or deposit scheme is legally registered and authorized to collect money or issue loans."
    },
    // Actionable Next Steps
    emergencyContacts: {
      cybercrimeHelpline: "1930",
      cybercrimePortalUrl: "https://cybercrime.gov.in",
      sachetComplaintUrl: "https://sachet.rbi.org.in/sachet/file-a-complaint"
    }
  };
}
