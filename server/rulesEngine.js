/**
 * SahayaSetu - Deterministic Scheme Eligibility Rules Engine
 * SIH Problem Statement 26092 (Ministry of Social Justice and Empowerment)
 * 
 * Predictable, 100% explainable statutory classification without black-box ML.
 */

export const INCOME_LIMIT = 500000;       // ₹5.00 Lakhs annual family income ceiling
export const MICRO_COST_LIMIT = 140000;   // ₹1.40 Lakhs max for Micro Finance
export const TERM_COST_LIMIT = 5000000;    // ₹50.00 Lakhs max for Term Loan
export const EDU_COST_LIMIT = 2000000;     // ₹20.00 Lakhs domestic Education Loan ceiling

export function formatINR(val) {
  return "₹" + Math.round(Number(val) || 0).toLocaleString("en-IN");
}

/**
 * Statutory 90% Margin Money Rule:
 * eligibleLoanAmount = min(scheme.maxCost, 0.90 * enteredCost)
 * marginMoney = enteredCost - eligibleLoanAmount
 * 
 * If 0.90 * cost exceeds or cost exceeds the scheme ceiling, the ceiling wins and margin money absorbs the excess.
 */
export function calculateMarginMoney(enteredCost, schemeMaxCost) {
  const cost = Math.max(0, Number(enteredCost) || 0);
  const maxCost = Number(schemeMaxCost) || TERM_COST_LIMIT;

  let eligibleLoanAmount;
  let isCapped = false;

  if (cost > maxCost) {
    // Ceiling wins: scheme maximum is granted, margin money covers remainder
    eligibleLoanAmount = maxCost;
    isCapped = true;
  } else {
    eligibleLoanAmount = Math.round(0.90 * cost);
  }

  const marginMoney = cost - eligibleLoanAmount;
  const loanPercentage = cost > 0 ? Number(((eligibleLoanAmount / cost) * 100).toFixed(1)) : 90;
  const marginPercentage = cost > 0 ? Number(((marginMoney / cost) * 100).toFixed(1)) : 10;

  return {
    enteredCost: cost,
    eligibleLoanAmount,
    marginMoney,
    loanPercentage,
    marginPercentage,
    isCapped
  };
}

/**
 * Evaluates user input against statutory MoSJE / NSFDC scheme rules.
 * @param {Object} input
 * @param {string} input.projectType - 'trade' | 'manufacturing' | 'services' | 'agri' | 'education'
 * @param {number} input.projectCost - in INR
 * @param {number} input.annualIncome - in INR
 * @param {string|boolean} input.casteProof - 'yes' | 'no' | true | false
 * @param {boolean} [input.allowCapped] - whether to allow capping for costs above statutory limit
 * @param {Object} schemesMap - Map of scheme objects keyed by id ('micro', 'term', 'education')
 * @returns {Object} Evaluation outcome
 */
export function evaluateEligibility(input, schemesMap = {}) {
  const projectType = (input.projectType || "").toLowerCase().trim();
  const cost = Math.max(0, Number(input.projectCost) || 0);
  const income = Math.max(0, Number(input.annualIncome) || 0);
  const hasCasteProof = input.casteProof === "yes" || input.casteProof === true;
  const allowCapped = !!input.allowCapped;

  // 1. Income Cap Check (Applies to all concessional schemes)
  if (income > INCOME_LIMIT) {
    return {
      status: "ineligible",
      reasonType: "income",
      reason: `Family income of ${formatINR(income)} exceeds the ₹5,00,000 per year concessional limit. You fall outside the scope of these subsidized schemes.`,
      suggestedAlternative: "Explore standard commercial bank credit or MUDRA loans (Shishu/Kishore/Tarun) at market rates.",
      scheme: null
    };
  }

  // 2. Higher Education Pathway
  if (projectType === "education" || projectType === "higher education") {
    const baseScheme = schemesMap.education || {
      id: "education",
      code: "NSFDC-ELS",
      name: "Education Loan Scheme",
      category: "Education Loan",
      maxCost: EDU_COST_LIMIT,
      rate: 4.0,
      moratorium: 12,
      maxTenureMonths: 120
    };

    const marginData = calculateMarginMoney(cost, EDU_COST_LIMIT);

    if (cost > EDU_COST_LIMIT) {
      // Higher education cost exceeds domestic ₹20 Lakh ceiling
      return {
        status: "match",
        schemeId: "education",
        scheme: baseScheme,
        capped: true,
        maxSanctionAmount: EDU_COST_LIMIT,
        effectiveAmount: EDU_COST_LIMIT,
        ...marginData,
        reason: `Matched Education Loan Scheme up to the domestic ceiling of ₹20,00,000. Course cost of ${formatINR(cost)} exceeds domestic limit; eligible loan is ${formatINR(marginData.eligibleLoanAmount)}, and remaining margin money of ${formatINR(marginData.marginMoney)} must be arranged via student contribution or scholarship (study abroad is eligible up to ₹40,00,000 under NSFDC guidelines).`,
        casteProofNote: hasCasteProof ? null : "Caste certificate required before loan sanction: We provide a step-by-step document checklist to obtain your certificate."
      };
    }

    return {
      status: "match",
      schemeId: "education",
      scheme: baseScheme,
      capped: false,
      maxSanctionAmount: EDU_COST_LIMIT,
      effectiveAmount: cost,
      ...marginData,
      reason: `Matched Education Loan Scheme because course cost of ${formatINR(cost)} is within the ₹20,00,000 domestic ceiling and family income of ${formatINR(income)} is within the ₹5,00,000 limit. Eligible loan: ${formatINR(marginData.eligibleLoanAmount)} (90%), required margin money: ${formatINR(marginData.marginMoney)} (10%).`,
      casteProofNote: hasCasteProof ? null : "Caste certificate required before loan sanction: We provide a step-by-step document checklist to obtain your certificate."
    };
  }

  // 3. Project Cost Ceiling Check for Business / Trade / Manufacturing
  if (cost > TERM_COST_LIMIT && !allowCapped) {
    return {
      status: "ineligible",
      reasonType: "over_limit",
      reason: `Project cost of ${formatINR(cost)} exceeds the maximum ceiling of ₹50,00,000 permitted under these concessional schemes.`,
      suggestedAlternative: "Consider phasing your project into distinct stages or exploring commercial institutional consortium finance through SIDBI / State Financial Corporations.",
      scheme: null
    };
  }

  // 4. Micro Finance Scheme Pathway (<= ₹1.40 Lakhs)
  if (cost <= MICRO_COST_LIMIT) {
    const baseScheme = schemesMap.micro || {
      id: "micro",
      code: "NSFDC-MCF",
      name: "Micro Finance Scheme",
      category: "Micro Finance",
      maxCost: MICRO_COST_LIMIT,
      rate: 6.5,
      moratorium: 3,
      maxTenureMonths: 60
    };

    const marginData = calculateMarginMoney(cost, MICRO_COST_LIMIT);

    return {
      status: "match",
      schemeId: "micro",
      scheme: baseScheme,
      capped: false,
      maxSanctionAmount: MICRO_COST_LIMIT,
      effectiveAmount: cost,
      ...marginData,
      reason: `Matched Micro Finance Scheme because project cost ${formatINR(cost)} is within the ₹1,40,000 Micro Finance limit. Eligible concessional loan: ${formatINR(marginData.eligibleLoanAmount)} (90%), borrower margin money: ${formatINR(marginData.marginMoney)} (10%).`,
      casteProofNote: hasCasteProof ? null : "Caste certificate required before loan sanction: We provide a step-by-step document checklist to obtain your certificate."
    };
  }

  // 5. Term Loan Scheme Pathway (₹1,40,001 to ₹50,00,000, or capped if allowCapped)
  const baseScheme = schemesMap.term || {
    id: "term",
    code: "NSFDC-TL",
    name: "Term Loan Scheme",
    category: "Term Loan",
    maxCost: TERM_COST_LIMIT,
    rate: 8.0,
    moratorium: 6,
    maxTenureMonths: 84
  };

  const marginData = calculateMarginMoney(cost, TERM_COST_LIMIT);
  const isCapped = cost > TERM_COST_LIMIT;

  return {
    status: "match",
    schemeId: "term",
    scheme: baseScheme,
    capped: isCapped,
    maxSanctionAmount: TERM_COST_LIMIT,
    effectiveAmount: Math.min(cost, TERM_COST_LIMIT),
    ...marginData,
    reason: isCapped
      ? `Matched Term Loan Scheme capped at statutory limit of ₹50,00,000. Project cost of ${formatINR(cost)} receives eligible loan of ${formatINR(marginData.eligibleLoanAmount)}, with remaining ${formatINR(marginData.marginMoney)} required as borrower margin money.`
      : `Matched Term Loan Scheme because project cost ${formatINR(cost)} requires medium-scale capital within the ₹1,40,000 to ₹50,00,000 Term Loan band. Eligible loan: ${formatINR(marginData.eligibleLoanAmount)} (90%), borrower margin money: ${formatINR(marginData.marginMoney)} (10%).`,
    casteProofNote: hasCasteProof ? null : "Caste certificate required before loan sanction: We provide a step-by-step document checklist to obtain your certificate."
  };
}
