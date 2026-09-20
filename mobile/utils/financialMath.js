/**
 * Financial calculation engine for Samarth Setu Mobile
 * Computes statutory 90% loan vs 10% margin breakdown, reducing-balance EMI, and moratorium details.
 */

export function formatINR(val) {
  const num = Math.round(Number(val) || 0);
  return "₹" + num.toLocaleString("en-IN");
}

export function formatLakhs(val) {
  const num = Number(val) || 0;
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return formatINR(num);
}

/**
 * Statutory 90% Margin Money Rule:
 * Eligible Loan = min(Scheme Max Cost, 90% of Entered Cost)
 * Margin Money = Entered Cost - Eligible Loan
 */
export function calculateMarginBreakdown(enteredCost, maxSchemeCost = 5000000) {
  const cost = Math.max(0, Number(enteredCost) || 0);
  const ceiling = Number(maxSchemeCost) || 5000000;

  let eligibleLoanAmount;
  let isCapped = false;

  if (cost > ceiling) {
    eligibleLoanAmount = ceiling;
    isCapped = true;
  } else {
    eligibleLoanAmount = Math.round(0.90 * cost);
  }

  const marginMoney = Math.max(0, cost - eligibleLoanAmount);
  const loanPercent = cost > 0 ? Number(((eligibleLoanAmount / cost) * 100).toFixed(1)) : 90;
  const marginPercent = cost > 0 ? Number(((marginMoney / cost) * 100).toFixed(1)) : 10;

  return {
    cost,
    eligibleLoanAmount,
    marginMoney,
    loanPercent,
    marginPercent,
    isCapped
  };
}

/**
 * Standard reducing-balance EMI:
 * EMI = [P * r * (1+r)^n] / [(1+r)^n - 1]
 */
export function calculateEMI(principal, annualRate, tenureMonths) {
  const P = Number(principal) || 0;
  const n = Number(tenureMonths) || 0;
  const rate = Number(annualRate) || 0;

  if (P <= 0 || n <= 0) return 0;
  if (rate <= 0) return Math.round(P / n);

  const r = rate / 12 / 100;
  const factor = Math.pow(1 + r, n);
  const emi = (P * r * factor) / (factor - 1);

  return Math.round(emi);
}

/**
 * Total Loan Repayment Summary:
 */
export function calculateLoanSummary(principal, annualRate, tenureMonths, moratoriumMonths = 0) {
  const P = Number(principal) || 0;
  const n = Number(tenureMonths) || 0;
  const emi = calculateEMI(P, annualRate, n);
  const totalRepayment = emi * n;
  const totalInterest = Math.max(0, totalRepayment - P);

  // Market comparison at typical 14% commercial micro-credit rate:
  const commercialEMI = calculateEMI(P, 14.0, n);
  const commercialTotal = commercialEMI * n;
  const totalSavings = Math.max(0, commercialTotal - totalRepayment);

  return {
    principal: P,
    monthlyEMI: emi,
    tenureMonths: n,
    totalRepayment,
    totalInterest,
    totalSavings,
    moratoriumMonths: Number(moratoriumMonths) || 0
  };
}
