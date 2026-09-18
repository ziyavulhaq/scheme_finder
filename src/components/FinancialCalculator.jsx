import React, { useState, useEffect } from "react";
import { Calculator, Download, Calendar, ArrowRight, ShieldCheck, Info, PieChart, Coins } from "lucide-react";
import { calculateMarginMoney } from "../utils/financialMath";
import { useLanguage } from "../context/LanguageContext";

export const FinancialCalculator = ({ initialScheme, initialAmount, onRouteToPartners }) => {
  const { t } = useLanguage();

  // Master Schemes List (Live NSFDC figures)
  const schemesList = [
    {
      id: "micro",
      name: "Micro Finance Scheme",
      maxCost: 140000,
      maxLoan: 125000,
      rate: 6.5,
      defaultTenure: 36,
      maxTenure: 60,
      moratorium: 3
    },
    {
      id: "term",
      name: "Term Loan Scheme",
      maxCost: 5000000,
      maxLoan: 4500000,
      rate: 8.0,
      defaultTenure: 60,
      maxTenure: 84,
      moratorium: 6
    },
    {
      id: "education",
      name: "Education Loan Scheme",
      maxCost: 2000000,
      maxLoan: 1800000,
      rate: 4.0,
      defaultTenure: 84,
      maxTenure: 120,
      moratorium: 12
    },
    {
      id: "aajeevika",
      name: "Aajeevika Microfinance (NBFC-MFI)",
      maxCost: 140000,
      maxLoan: 125000,
      rate: 15.0,
      defaultTenure: 36,
      maxTenure: 36,
      moratorium: 3
    }
  ];

  const [activeSchemeId, setActiveSchemeId] = useState(
    initialScheme ? initialScheme.id : "micro"
  );

  const currentScheme = schemesList.find(s => s.id === activeSchemeId) || schemesList[0];

  // Total Project Cost state
  const [projectCost, setProjectCost] = useState(
    initialAmount ? Math.min(Number(initialAmount), currentScheme.maxCost) : currentScheme.maxCost
  );

  // Customizable rate, tenure, and moratorium
  const [customRate, setCustomRate] = useState(currentScheme.rate);
  const [tenureMonths, setTenureMonths] = useState(currentScheme.defaultTenure);
  const [moratoriumMonths, setMoratoriumMonths] = useState(currentScheme.moratorium);
  const [applyMoratorium, setApplyMoratorium] = useState(true);

  // Sync when initialScheme or initialAmount changes
  useEffect(() => {
    if (initialScheme) {
      const match = schemesList.find(s => s.id === initialScheme.id) || schemesList[0];
      setActiveSchemeId(match.id);
      const amt = initialAmount ? Math.min(Number(initialAmount), match.maxCost) : match.maxCost;
      setProjectCost(amt);
      setCustomRate(match.rate);
      setTenureMonths(match.defaultTenure);
      setMoratoriumMonths(match.moratorium);
    }
  }, [initialScheme, initialAmount]);

  const handleSchemeSelect = (id) => {
    setActiveSchemeId(id);
    const selected = schemesList.find(s => s.id === id) || schemesList[0];
    setProjectCost(selected.maxCost);
    setCustomRate(selected.rate);
    setTenureMonths(selected.defaultTenure);
    setMoratoriumMonths(selected.moratorium);
  };

  const formatINR = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

  // Live 90% Project Coverage & Margin Money Calculation
  const marginCalc = calculateMarginMoney(projectCost, activeSchemeId);
  const P = marginCalc.eligibleLoanAmount; // Principal is the funded concessional loan
  const r = (Number(customRate) || currentScheme.rate) / 12 / 100;
  const n = Number(tenureMonths) || 1;

  // Standard Reducing Balance EMI Calculation
  let emi = 0;
  if (P > 0 && n > 0) {
    if (r === 0) {
      emi = Math.round(P / n);
    } else {
      const factor = Math.pow(1 + r, n);
      emi = Math.round((P * r * factor) / (factor - 1));
    }
  }

  // Moratorium grace calculations
  const grace = applyMoratorium ? Number(moratoriumMonths) : 0;
  const moratoriumInterest = applyMoratorium ? Math.round(P * r * grace) : 0;
  const regularInterest = Math.round(emi * n - P);
  const totalInterest = Math.max(0, regularInterest + moratoriumInterest);
  const totalRepayment = P + totalInterest;

  // Commercial comparison (13.5% open market commercial rate benchmark)
  const commRate = 13.5 / 12 / 100;
  const commFactor = Math.pow(1 + commRate, n);
  const commEmi = Math.round((P * commRate * commFactor) / (commFactor - 1));
  const commInterest = Math.round(commEmi * n - P + (applyMoratorium ? P * commRate * grace : 0));
  const interestSaved = Math.max(0, commInterest - totalInterest);

  const principalPct = totalRepayment > 0 ? Math.max(5, Math.min(95, Math.round((P / totalRepayment) * 100))) : 100;
  const interestPct = 100 - principalPct;

  // Estimated first regular EMI payment date
  const now = new Date();
  now.setMonth(now.getMonth() + grace + 1);
  const firstPaymentDateStr = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  // Export Amortization Schedule to CSV
  const handleExportCSV = () => {
    let balance = P;
    const rows = [
      [
        t.colMonth || "Month",
        t.colPhase || "Phase",
        t.colPrincipal || "Principal Paid (INR)",
        t.colInterest || "Interest Paid (INR)",
        t.colTotal || "Total Payment (INR)",
        t.colBalance || "Remaining Balance (INR)"
      ]
    ];

    for (let m = 1; m <= grace; m++) {
      const monthlyInt = Math.round(balance * r);
      rows.push([m, t.gracePhase || "Grace Period (Moratorium)", 0, monthlyInt, monthlyInt, Math.round(balance)]);
    }

    for (let m = 1; m <= n; m++) {
      const monthlyInt = Math.round(balance * r);
      let princ = emi - monthlyInt;
      if (m === n || balance < princ) princ = balance;
      balance -= princ;
      if (balance < 0) balance = 0;
      rows.push([grace + m, t.repayPhase || "Active Repayment", Math.round(princ), monthlyInt, Math.round(princ + monthlyInt), Math.round(balance)]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SahayaSetu_${currentScheme.id}_Schedule.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="section py-10 px-4 sm:px-8 border-b border-[#D8D2C4]" id="calculate">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono px-2 py-0.5 bg-[#F1ECE0] border border-[#D8D2C4] text-[#1F3A5F] rounded">
              {t.entry2Badge || "ENTRY 02 • FINANCIAL AMORTIZATION & MARGIN MONEY"}
            </span>
            <span className="text-xs text-[#6B6558]">
              {t.entry2Formula || "Statutory Reducing-Balance Formula"}
            </span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1F3A5F] tracking-tight">
            {t.calcTitle || "Calculate your monthly instalment"}
          </h2>
          <p className="mt-2 text-[#6B6558] text-base max-w-3xl leading-relaxed">
            {t.calcSubtitle ||
              "Transparent repayment projections with statutory 90% project cost coverage, 10% borrower margin money, moratorium grace period offsets, and commercial interest savings."}
          </p>
        </div>

        {/* Scheme Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {schemesList.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSchemeSelect(s.id)}
              className={`px-3.5 py-2 rounded text-xs sm:text-sm font-medium border transition ${
                activeSchemeId === s.id
                  ? "bg-[#1F3A5F] text-white border-[#1F3A5F] shadow-sm"
                  : "bg-white text-[#2B2A28] border-[#D8D2C4] hover:bg-[#F1ECE0]"
              }`}
            >
              {s.name} ({s.rate}% p.a.)
            </button>
          ))}
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sliders & Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-6 bg-white border border-[#D8D2C4] p-6 rounded-md shadow-sm">
            {/* Total Project Cost Slider */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label htmlFor="projectCostSlider" className="text-sm font-semibold text-[#2B2A28]">
                  {t.totalProjectCost || "Total Project Cost"}
                </label>
                <span className="font-serif font-bold text-lg text-[#1F3A5F]">
                  {formatINR(projectCost)}
                </span>
              </div>
              <input
                type="range"
                id="projectCostSlider"
                min={10000}
                max={currentScheme.maxCost}
                step={currentScheme.maxCost > 500000 ? 25000 : 5000}
                value={projectCost}
                onChange={(e) => setProjectCost(Number(e.target.value))}
                className="w-full accent-[#1F3A5F] h-1.5 bg-[#D8D2C4] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#6B6558] mt-1">
                <span>₹10,000</span>
                <span>{t.maxLoanLimit || "Max Ceiling"}: {formatINR(currentScheme.maxCost)}</span>
              </div>
            </div>

            {/* 90% Cost Coverage & Margin Money Breakdown Card */}
            <div className="p-4 bg-[#FBF9F4] border border-[#D8D2C4] rounded-md space-y-3">
              <div className="text-xs font-bold text-[#1F3A5F] uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#B97A1C]" />
                <span>{t.marginBreakdownTitle || "Statutory 90% Project Financing & Margin Money"}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-white border border-[#3B6E52]/30 rounded">
                  <span className="text-[11px] text-[#3B6E52] block font-medium">
                    {t.eligibleConcessionalLoan || t.eligibleLoanLabel || "Eligible Concessional Loan (Up to 90%)"}
                  </span>
                  <span className="font-serif font-bold text-base text-[#1F3A5F]">
                    {formatINR(marginCalc.eligibleLoanAmount)}
                  </span>
                  <span className="text-[10px] text-[#6B6558] block mt-0.5">
                    ({marginCalc.loanPercentage}% {t.schemeCoverage || "funded by MoSJE/Channel Partner"})
                  </span>
                </div>

                <div className="p-2.5 bg-white border border-[#B97A1C]/30 rounded">
                  <span className="text-[11px] text-[#B97A1C] block font-medium">
                    {t.requiredMarginMoney || t.marginMoneyLabel || "Borrower Margin Money (Self-Contribution)"}
                  </span>
                  <span className="font-serif font-bold text-base text-[#B97A1C]">
                    {formatINR(marginCalc.marginMoney)}
                  </span>
                  <span className="text-[10px] text-[#6B6558] block mt-0.5">
                    ({marginCalc.marginPercentage}% {t.selfContr || "beneficiary contribution"})
                  </span>
                </div>
              </div>
            </div>

            {/* Interest Rate Slider */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label htmlFor="rateSlider" className="text-sm font-semibold text-[#2B2A28]">
                  {t.interestRatePannum || t.interestRateLabel || "Annual Interest Rate (%)"}
                </label>
                <span className="font-serif font-bold text-lg text-[#1F3A5F]">
                  {customRate}% p.a.
                </span>
              </div>
              <input
                type="range"
                id="rateSlider"
                min={4.0}
                max={15.0}
                step={0.5}
                value={customRate}
                onChange={(e) => setCustomRate(Number(e.target.value))}
                className="w-full accent-[#1F3A5F] h-1.5 bg-[#D8D2C4] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#6B6558] mt-1">
                <span>4.0% (Education)</span>
                <span>Default: {currentScheme.rate}%</span>
                <span>15.0% (MFI Ceiling)</span>
              </div>
            </div>

            {/* Repayment Period Slider */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label htmlFor="tenureSlider" className="text-sm font-semibold text-[#2B2A28]">
                  {t.tenureMonthsLabel || t.tenureLabel || "Repayment Tenure"}
                </label>
                <span className="font-serif font-bold text-lg text-[#1F3A5F]">
                  {tenureMonths} {t.months || "Months"} ({(tenureMonths / 12).toFixed(1)} Yrs)
                </span>
              </div>
              <input
                type="range"
                id="tenureSlider"
                min={6}
                max={currentScheme.maxTenure}
                step={6}
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full accent-[#1F3A5F] h-1.5 bg-[#D8D2C4] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#6B6558] mt-1">
                <span>6 {t.months || "Months"}</span>
                <span>{t.maxTenure || "Max Tenure"}: {currentScheme.maxTenure} {t.months || "Months"}</span>
              </div>
            </div>

            {/* Moratorium Grace Slider & Toggle */}
            <div className="pt-2 border-t border-[#D8D2C4] space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={applyMoratorium}
                  onChange={(e) => setApplyMoratorium(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#1F3A5F] rounded border-[#D8D2C4]"
                />
                <div>
                  <span className="text-sm font-semibold text-[#2B2A28] block">
                    {t.moratoriumGrace || "Apply Moratorium Repayment Holiday"} ({moratoriumMonths} {t.months || "Months"})
                  </span>
                  <span className="text-xs text-[#6B6558] block mt-0.5">
                    {t.moratoriumHint ||
                      "Defers principal repayments during business setup gestation. First EMI postponed."}
                  </span>
                </div>
              </label>

              {applyMoratorium && (
                <div className="pl-7">
                  <div className="flex justify-between text-xs text-[#6B6558] mb-1">
                    <span>{t.moratoriumLabel || "Grace Period Length"}</span>
                    <span className="font-bold text-[#1F3A5F]">{moratoriumMonths} {t.months || "Months"}</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    step={1}
                    value={moratoriumMonths}
                    onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                    className="w-full accent-[#B97A1C] h-1.5 bg-[#D8D2C4] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#6B6558] mt-1">
                    <span>3 {t.months || "Months"} (Micro)</span>
                    <span>6 {t.months || "Months"} (Term)</span>
                    <span>12 {t.months || "Months"} (Edu/Industry)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Ledger EMI Output Entry (6 cols) */}
          <div className="lg:col-span-6 bg-[#FFFDF9] border border-[#D8D2C4] border-l-4 border-l-[#B97A1C] p-6 sm:p-8 rounded-md shadow-sm space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-[#6B6558] tracking-wider block mb-1">
                {t.amortizationScheduleTitle || "MONTHLY REPAYMENT SCHEDULE"}
              </span>
              <span className="text-xs text-[#6B6558] block">{t.monthlyEmiLabel || t.monthlyEmi || "Estimated Monthly Instalment"}</span>
              <div className="font-serif font-bold text-4xl sm:text-5xl text-[#1F3A5F] mt-1">
                {formatINR(emi)}
                <span className="text-base font-normal font-sans text-[#6B6558]"> / month</span>
              </div>
            </div>

            {/* Grace period note */}
            {applyMoratorium ? (
              <div className="p-3 bg-[#FBEBD2] border-l-2 border-[#E8A33D] rounded text-xs text-[#2B2A28] leading-relaxed">
                <span className="font-semibold text-[#B97A1C]">{t.repaymentHoliday || "Grace Period Applied"}: </span>
                First regular EMI is due after a {moratoriumMonths}-month moratorium
                (estimated first payment date: <strong className="font-semibold">{firstPaymentDateStr}</strong>).
              </div>
            ) : (
              <div className="p-3 bg-[#F1ECE0] border-l-2 border-[#1F3A5F] rounded text-xs text-[#2B2A28] leading-relaxed">
                <span className="font-semibold text-[#1F3A5F]">Immediate Repayment: </span>
                First regular EMI will commence on the following calendar month.
              </div>
            )}

            {/* Breakdown Visual Bar */}
            <div>
              <div className="flex justify-between text-xs text-[#6B6558] mb-1.5 font-medium">
                <span>{t.principalRepayment || "Principal"} ({principalPct}%)</span>
                <span>{t.totalInterestLabel || t.totalInterest || "Total Interest"} ({interestPct}%)</span>
              </div>
              <div className="h-3.5 rounded-full overflow-hidden flex bg-[#D8D2C4]">
                <div
                  className="bg-[#1F3A5F] transition-all duration-300"
                  style={{ width: `${principalPct}%` }}
                />
                <div
                  className="bg-[#E8A33D] transition-all duration-300"
                  style={{ width: `${interestPct}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-[#D8D2C4]">
                <div>
                  <span className="text-[#6B6558] block">{t.principalRepayment || "Principal Loan Amount"}</span>
                  <span className="font-serif font-bold text-base text-[#1F3A5F]">
                    {formatINR(P)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#6B6558] block">{t.totalInterestLabel || t.totalInterest || "Total Concessional Interest"}</span>
                  <span className="font-serif font-bold text-base text-[#B97A1C]">
                    {formatINR(totalInterest)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-[#6B6558]">{t.colTotal || "Total Repayment"} ({t.principalRepayment || "Principal"} + {t.interestCol || "Interest"}):</span>
                <span className="font-serif font-bold text-base text-[#2B2A28]">
                  {formatINR(totalRepayment)}
                </span>
              </div>
            </div>

            {/* Commercial Savings Benchmark */}
            <div className="p-3 bg-[#E4EEE7] border border-[#3B6E52]/30 rounded text-xs text-[#2B2A28]">
              <span className="font-semibold text-[#3B6E52]">{t.estSavings || "Concessional Savings"}: </span>
              Compared to standard commercial bank loans at 13.5% p.a., you save approximately{" "}
              <strong className="font-bold text-[#3B6E52]">{formatINR(interestSaved)}</strong> in total
              interest charges through this MoSJE scheme.
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-[#D8D2C4]">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-white hover:bg-[#F1ECE0] border border-[#D8D2C4] text-[#1F3A5F] rounded text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.downloadCsvLabel || t.downloadCsvBtn || "Export CSV Schedule"}</span>
              </button>

              <button
                onClick={() => onRouteToPartners && onRouteToPartners(currentScheme.id)}
                className="px-4 py-2.5 bg-[#1F3A5F] hover:bg-[#345178] text-white rounded text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>{t.routeToBanksBtn || t.locatePartnerBtn || "Find Nearby Channel Partners"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
