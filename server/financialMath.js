/**
 * SahayaSetu - Single Source of Truth Financial Math Engine
 * Computes standard reducing-balance EMI, moratorium grace periods, and amortization schedules.
 */

/**
 * 90% Cost Coverage & Margin Money Rule:
 * eligibleLoanAmount = min(scheme.maxCost, 0.90 * enteredCost)
 * marginMoney = enteredCost - eligibleLoanAmount
 */
export function calculateMarginMoney(enteredCost, schemeMaxCost = 5000000) {
  const cost = Math.max(0, Number(enteredCost) || 0);
  const maxCost = Number(schemeMaxCost) || 5000000;

  let eligibleLoanAmount;
  let isCapped = false;

  if (cost > maxCost) {
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
 * Standard Reducing Balance EMI Formula:
 * EMI = [P * r * (1+r)^n] / [(1+r)^n - 1]
 */
export function calculateEMI(principal, annualRate, tenureMonths) {
  const P = Number(principal) || 0;
  const n = Number(tenureMonths) || 0;
  const rate = Number(annualRate) || 0;

  if (P <= 0 || n <= 0) return 0;
  if (rate === 0) return Math.round(P / n);

  const r = rate / 12 / 100;
  const factor = Math.pow(1 + r, n);
  const emi = (P * r * factor) / (factor - 1);

  return Math.round(emi);
}

/**
 * Computes complete loan breakdown with optional moratorium (grace period).
 * During moratorium, principal repayments are suspended, postponing first EMI.
 */
export function calculateAmortization({
  principal,
  annualRate,
  tenureMonths,
  moratoriumMonths = 0,
  applyMoratorium = true,
  startDate = new Date()
}) {
  const P = Number(principal) || 0;
  const n = Number(tenureMonths) || 0;
  const rate = Number(annualRate) || 0;
  const grace = applyMoratorium ? Number(moratoriumMonths) || 0 : 0;

  const emi = calculateEMI(P, rate, n);
  const monthlyRate = rate / 12 / 100;

  let balance = P;
  let totalInterest = 0;
  const schedule = [];

  // Compute estimated first EMI date
  const firstPaymentDate = new Date(startDate);
  firstPaymentDate.setMonth(firstPaymentDate.getMonth() + grace + 1);
  const firstPaymentDateStr = firstPaymentDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });

  // Phase 1: Moratorium Months (Grace period - interest only or deferred)
  for (let m = 1; m <= grace; m++) {
    const interestForMonth = Math.round(balance * monthlyRate);
    totalInterest += interestForMonth;

    const mDate = new Date(startDate);
    mDate.setMonth(mDate.getMonth() + m);

    schedule.push({
      month: m,
      date: mDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      phase: "Grace Period",
      isMoratorium: true,
      principalPaid: 0,
      interestPaid: interestForMonth,
      totalInstallment: interestForMonth,
      remainingBalance: Math.round(balance)
    });
  }

  // Phase 2: Active Repayment Months
  for (let m = 1; m <= n; m++) {
    const monthIndex = grace + m;
    const interestForMonth = Math.round(balance * monthlyRate);
    let principalForMonth = emi - interestForMonth;

    if (m === n || balance < principalForMonth) {
      principalForMonth = balance;
    }

    balance -= principalForMonth;
    if (balance < 0) balance = 0;

    totalInterest += interestForMonth;

    const mDate = new Date(startDate);
    mDate.setMonth(mDate.getMonth() + monthIndex);

    schedule.push({
      month: monthIndex,
      date: mDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      phase: "Active Repayment",
      isMoratorium: false,
      principalPaid: Math.round(principalForMonth),
      interestPaid: Math.round(interestForMonth),
      totalInstallment: Math.round(principalForMonth + interestForMonth),
      remainingBalance: Math.round(balance)
    });

    if (balance <= 0) break;
  }

  const totalRepayment = Math.round(P + totalInterest);
  const principalPct = totalRepayment > 0 ? Math.round((P / totalRepayment) * 100) : 100;
  const interestPct = 100 - principalPct;

  return {
    principal: P,
    annualRate: rate,
    tenureMonths: n,
    moratoriumMonths: grace,
    applyMoratorium: !!applyMoratorium,
    monthlyEmi: emi,
    firstPaymentDate: firstPaymentDateStr,
    totalInterest: Math.round(totalInterest),
    totalRepayment,
    principalPct,
    interestPct,
    schedule
  };
}
