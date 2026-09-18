// Financial Mathematics Engine: Concessional EMI, Moratorium Schedule, Interest Savings & Amortization

/**
 * Statutory 90% Margin Money Rule:
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
 * Standard EMI Formula: EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
 * @param {number} principal - Loan amount in INR
 * @param {number} annualRate - Annual interest rate in percent (e.g., 6.5)
 * @param {number} tenureMonths - Repayment period in months
 * @returns {number} Monthly EMI amount
 */
export function calculateEMI(principal, annualRate, tenureMonths) {
  if (!principal || principal <= 0 || !tenureMonths || tenureMonths <= 0) return 0;
  if (annualRate === 0) return Math.round(principal / tenureMonths);

  const monthlyRate = annualRate / (12 * 100);
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  return Math.round(emi);
}

/**
 * Generates full amortization schedule with Moratorium Period (3 to 12 months)
 */
export function generateAmortizationSchedule({
  principal,
  annualRate,
  tenureMonths,
  moratoriumMonths = 0,
  commercialRate = 13.5
}) {
  const schedule = [];
  let balance = principal;
  const monthlyRate = annualRate / (12 * 100);
  const emi = calculateEMI(principal, annualRate, tenureMonths);

  let totalConcessionalInterest = 0;
  let totalPrincipalPaid = 0;

  // Phase 1: Moratorium Months (Grace Period - zero principal, low interest)
  for (let m = 1; m <= moratoriumMonths; m++) {
    const monthlyInterest = Math.round(balance * monthlyRate);
    totalConcessionalInterest += monthlyInterest;

    schedule.push({
      month: m,
      phase: "Moratorium (Grace Period)",
      isMoratorium: true,
      principalPaid: 0,
      interestPaid: monthlyInterest,
      totalPayment: monthlyInterest,
      remainingBalance: Math.round(balance)
    });
  }

  // Phase 2: Active Repayment Months
  for (let m = 1; m <= tenureMonths; m++) {
    const monthNumber = moratoriumMonths + m;
    const interestForMonth = Math.round(balance * monthlyRate);
    let principalForMonth = emi - interestForMonth;

    if (m === tenureMonths || balance < principalForMonth) {
      principalForMonth = balance;
    }

    balance -= principalForMonth;
    if (balance < 0) balance = 0;

    totalConcessionalInterest += interestForMonth;
    totalPrincipalPaid += principalForMonth;

    schedule.push({
      month: monthNumber,
      phase: "Active Repayment",
      isMoratorium: false,
      principalPaid: Math.round(principalForMonth),
      interestPaid: Math.round(interestForMonth),
      totalPayment: Math.round(principalForMonth + interestForMonth),
      remainingBalance: Math.round(balance)
    });

    if (balance <= 0) break;
  }

  // Commercial Bank Benchmark Comparison (at commercialRate without MoSJE subsidy)
  const commercialMonthlyEmi = calculateEMI(principal, commercialRate, tenureMonths);
  const commercialMonthlyRate = commercialRate / (12 * 100);
  let commercialBalance = principal;
  let totalCommercialInterest = 0;

  // Commercial moratorium interest (usually compounded heavily in open market)
  for (let m = 1; m <= moratoriumMonths; m++) {
    totalCommercialInterest += Math.round(commercialBalance * commercialMonthlyRate);
  }
  for (let m = 1; m <= tenureMonths; m++) {
    const interest = Math.round(commercialBalance * commercialMonthlyRate);
    const princ = commercialMonthlyEmi - interest;
    commercialBalance -= princ;
    totalCommercialInterest += interest;
    if (commercialBalance <= 0) break;
  }

  const interestSaved = Math.max(0, totalCommercialInterest - totalConcessionalInterest);
  const savingsPercent = totalCommercialInterest > 0 ? Math.round((interestSaved / totalCommercialInterest) * 100) : 0;

  return {
    monthlyEmi: emi,
    totalConcessionalInterest,
    totalPrincipalPaid: Math.round(principal),
    totalRepayment: Math.round(principal + totalConcessionalInterest),
    commercialMonthlyEmi,
    totalCommercialInterest,
    interestSaved,
    savingsPercent,
    schedule
  };
}

/**
 * Format currency in Indian numbering format (e.g., ₹1,40,000)
 */
export function formatINR(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Download amortization schedule as a structured CSV file
 */
export function exportAmortizationCSV(schedule, schemeCode = "MoSJE-Scheme") {
  const headers = ["Month", "Phase", "Principal Paid (INR)", "Interest Paid (INR)", "Total Installment (INR)", "Remaining Balance (INR)"];
  const rows = schedule.map(row => [
    row.month,
    `"${row.phase}"`,
    row.principalPaid,
    row.interestPaid,
    row.totalPayment,
    row.remainingBalance
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${schemeCode}_Amortization_Schedule.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
