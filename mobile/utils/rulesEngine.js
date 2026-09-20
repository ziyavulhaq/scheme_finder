import { SCHEMES } from "../constants/schemes";

export const STATUTORY_INCOME_LIMIT = 500000; // ₹5,00,000 annual family income ceiling (MoSJE)

/**
 * Deterministic scheme eligibility matching
 */
export function matchScheme({ projectType, projectCost, annualIncome, isSCCategory }) {
  const cost = Number(projectCost) || 0;
  const income = Number(annualIncome) || 0;

  // Rule 1: Community check
  if (!isSCCategory) {
    return {
      status: "ineligible",
      reason: "NSFDC concessional lending schemes are reserved for citizens belonging to the Scheduled Caste (SC) community.",
      remedy: "Please explore general MSME schemes such as PMEGP or Mudra Loan via your nearest bank."
    };
  }

  // Rule 2: Annual family income ceiling check
  if (income > STATUTORY_INCOME_LIMIT) {
    return {
      status: "ineligible",
      reason: `Annual family income of ₹${income.toLocaleString("en-IN")} exceeds the statutory ceiling of ₹5,00,000 per annum.`,
      remedy: "Families with income above ₹5.00 Lakhs are eligible for regular bank commercial credit with credit guarantee schemes."
    };
  }

  // Rule 3: Scheme matching by project type and cost
  let matchedSchemeId = "micro";

  if (projectType === "education") {
    matchedSchemeId = "education";
  } else if (cost > 140000) {
    matchedSchemeId = "term";
  } else if (projectType === "mfi") {
    matchedSchemeId = "aajeevika";
  } else {
    matchedSchemeId = "micro";
  }

  const scheme = SCHEMES.find(s => s.id === matchedSchemeId) || SCHEMES[0];

  // Statutory 90% breakdown
  const eligibleLoan = Math.min(scheme.maxCost, Math.round(0.90 * cost));
  const marginMoney = cost - eligibleLoan;
  const isCapped = cost > scheme.maxCost;

  return {
    status: "eligible",
    scheme,
    enteredCost: cost,
    eligibleLoan,
    marginMoney,
    isCapped,
    guidance: isCapped
      ? `Project cost exceeds scheme maximum of ₹${scheme.maxCost.toLocaleString("en-IN")}. Eligible loan is capped at maximum limit.`
      : `Government scheme covers 90% (₹${eligibleLoan.toLocaleString("en-IN")}) at subsidized ${scheme.rate}% interest rate.`
  };
}
