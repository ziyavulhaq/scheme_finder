import React, { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, ArrowRight, Calculator, MapPin, FileText, Info, ExternalLink, ShieldCheck, FileCheck, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { calculateMarginMoney } from "../utils/financialMath";
import { useLanguage } from "../context/LanguageContext";
import { apiUrl } from "../utils/apiConfig";

export const SchemeRecommender = ({ onSelectForCalculator, onSelectForLocator, onSelectForDocuments, onSelectForAi }) => {
  const { lang, t } = useLanguage();
  const [projectType, setProjectType] = useState("trade");
  const [costInput, setCostInput] = useState(120000);
  const [incomeInput, setIncomeInput] = useState(180000);
  const [casteProof, setCasteProof] = useState("yes");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Feature 1: LLM Plain-Language Explanation State
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState("");
  const [showRawReason, setShowRawReason] = useState(false);

  const formatINR = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

  const fetchAiExplanation = async (matchData) => {
    if (!matchData || matchData.status !== "match") {
      setAiExplanation("");
      return;
    }
    setAiLoading(true);
    try {
      const explainRes = await fetch(apiUrl("/api/explain"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheme: matchData.scheme,
          eligibleLoanAmount: matchData.eligibleLoanAmount,
          marginMoney: matchData.marginMoney,
          rate: matchData.scheme?.rate,
          moratorium: matchData.scheme?.moratorium,
          reasoning: matchData.reason,
          language: lang,
          cost: Number(costInput) || 0,
          annualIncome: Number(incomeInput) || 0
        })
      });

      if (explainRes.ok) {
        const data = await explainRes.json();
        setAiExplanation(data.explanation || matchData.reason);
        setAiSource(data.source || "groq");
      } else {
        setAiExplanation(matchData.reason);
        setAiSource("deterministic_fallback");
      }
    } catch (err) {
      console.warn("AI explanation fetch failed; falling back to deterministic reasoning:", err);
      setAiExplanation(matchData.reason);
      setAiSource("deterministic_fallback");
    } finally {
      setAiLoading(false);
    }
  };

  // Re-fetch explanation when user switches language
  useEffect(() => {
    if (result && result.status === "match") {
      fetchAiExplanation(result);
    }
  }, [lang]);

  const handleQuickPreset = (preset) => {
    setProjectType(preset.type);
    setCostInput(preset.cost);
    setIncomeInput(preset.income);
    setCasteProof("yes");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const payload = {
      projectType,
      projectCost: Number(costInput) || 0,
      annualIncome: Number(incomeInput) || 0,
      casteProof
    };

    try {
      // Call real backend endpoint
      const res = await fetch(apiUrl("/api/recommend"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setHasSearched(true);
    } catch (err) {
      console.warn("Backend API error or offline; using local rules evaluation fallback:", err);
      // Deterministic fallback matching exact backend logic
      const cost = payload.projectCost;
      const income = payload.annualIncome;

      if (income > 500000) {
        setResult({
          status: "ineligible",
          reasonType: "income",
          reason: `Family income of ${formatINR(income)} exceeds the ₹5,00,000 per year concessional limit. You fall outside the scope of these subsidized schemes.`,
          suggestedAlternative: "Explore standard commercial bank credit or MUDRA loans (Shishu/Kishore/Tarun) at market rates."
        });
      } else if (projectType === "education" || projectType === "higher education") {
        const isCapped = cost > 2000000;
        const marginData = calculateMarginMoney(cost, 2000000);
        setResult({
          status: "match",
          schemeId: "education",
          scheme: {
            id: "education",
            name: "Education Loan Scheme",
            category: "Education Loan",
            maxCost: 2000000,
            rate: 4.0,
            moratorium: 12,
            maxTenureMonths: 120,
            description: "Subsidized educational credit for recognized technical, engineering, and medical courses up to ₹20 Lakh (Domestic) / ₹40 Lakh (Abroad).",
            source_url: "https://nsfdc.nic.in/scheme",
            last_verified_date: "2026-09-18"
          },
          capped: isCapped,
          maxSanctionAmount: 2000000,
          effectiveAmount: isCapped ? 2000000 : cost,
          ...marginData,
          reason: isCapped
            ? `Matched Education Loan Scheme up to domestic ceiling of ₹20,00,000. Course cost of ${formatINR(cost)} exceeds domestic limit; eligible loan is ${formatINR(marginData.eligibleLoanAmount)}, and remaining ${formatINR(marginData.marginMoney)} must be arranged via student contribution or scholarship (study abroad is eligible up to ₹40,00,000 under NSFDC guidelines).`
            : `Matched Education Loan Scheme because course cost of ${formatINR(cost)} is within the ₹20,00,000 domestic ceiling and family income of ${formatINR(income)} is within the ₹5,00,000 limit. Eligible loan: ${formatINR(marginData.eligibleLoanAmount)} (90%), required margin money: ${formatINR(marginData.marginMoney)} (10%).`,
          casteProofNote: casteProof === "yes" ? null : "Caste certificate required before loan sanction: We provide a step-by-step document checklist to obtain your certificate."
        });
      } else if (cost > 5000000) {
        setResult({
          status: "ineligible",
          reasonType: "over_limit",
          reason: `Project cost of ${formatINR(cost)} exceeds the maximum ceiling of ₹50,00,000 permitted under these concessional schemes.`,
          suggestedAlternative: "Consider phasing your project into distinct stages or exploring commercial institutional consortium finance through SIDBI / State Financial Corporations."
        });
      } else if (cost <= 140000) {
        const marginData = calculateMarginMoney(cost, 140000);
        setResult({
          status: "match",
          schemeId: "micro",
          scheme: {
            id: "micro",
            name: "Micro Finance Scheme",
            category: "Micro Finance",
            maxCost: 140000,
            rate: 6.5,
            moratorium: 3,
            maxTenureMonths: 36,
            description: "Concessional micro-credit assistance for small trade, vending, artisanal, and allied business projects up to ₹1.4 Lakh at 6.5% p.a.",
            source_url: "https://nsfdc.nic.in/scheme",
            last_verified_date: "2026-09-18"
          },
          capped: false,
          maxSanctionAmount: 140000,
          effectiveAmount: cost,
          ...marginData,
          reason: `Matched Micro Finance Scheme because project cost ${formatINR(cost)} is within the ₹1,40,000 Micro Finance limit. Eligible concessional loan: ${formatINR(marginData.eligibleLoanAmount)} (90%), borrower margin money: ${formatINR(marginData.marginMoney)} (10%).`,
          casteProofNote: casteProof === "yes" ? null : "Caste certificate required before loan sanction: We provide a step-by-step document checklist to obtain your certificate."
        });
      } else {
        const marginData = calculateMarginMoney(cost, 5000000);
        setResult({
          status: "match",
          schemeId: "term",
          scheme: {
            id: "term",
            name: "Term Loan Scheme",
            category: "Term Loan",
            maxCost: 5000000,
            rate: 8.0,
            moratorium: 6,
            maxTenureMonths: 84,
            description: "Direct term financing for manufacturing, fabrication, processing, and scalable service units up to ₹50 Lakh at 8.0% p.a.",
            source_url: "https://nsfdc.nic.in/scheme",
            last_verified_date: "2026-09-18"
          },
          capped: false,
          maxSanctionAmount: 5000000,
          effectiveAmount: cost,
          ...marginData,
          reason: `Matched Term Loan Scheme because project cost ${formatINR(cost)} requires medium-scale capital within the ₹1,40,000 to ₹50,00,000 Term Loan band. Eligible loan: ${formatINR(marginData.eligibleLoanAmount)} (90%), borrower margin money: ${formatINR(marginData.marginMoney)} (10%).`,
          casteProofNote: casteProof === "yes" ? null : "Caste certificate required before loan sanction: We provide a step-by-step document checklist to obtain your certificate."
        });
      }
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const isEdu = projectType === "education";

  return (
    <section className="section py-6 sm:py-10 px-3 sm:px-8 border-b border-[#D8D2C4] w-full max-w-full overflow-hidden" id="recommend">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif font-bold text-2xl sm:text-4xl text-[#1F3A5F] tracking-tight">
            {t("recommenderTitle") || "Find Your Scheme"}
          </h1>
        </div>

        {/* 4-Question Intake Form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 max-w-xl">
          {/* Q1: Project Type */}
          <div className="flex gap-3 sm:gap-4 items-start">
            <span className="flex-none w-7 h-7 rounded-full border border-[#1F3A5F] text-[#1F3A5F] font-serif font-bold text-sm flex items-center justify-center mt-1">
              1
            </span>
            <div className="flex-1 min-w-0">
              <label htmlFor="projectType" className="block text-sm font-semibold text-[#2B2A28] mb-1.5">
                {t("q1Label") || "What are you raising money for?"}
              </label>
              <select
                id="projectType"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#D8D2C4] rounded text-sm text-[#2B2A28] focus:border-[#1F3A5F] focus:outline-none transition shadow-sm"
              >
                <option value="trade">{t("optTrade") || "Small trade or shop (Grocery, Vending, Artisans)"}</option>
                <option value="manufacturing">{t("optMfg") || "Manufacturing or production unit"}</option>
                <option value="services">{t("optServices") || "Services business (Repair, IT, Transport)"}</option>
                <option value="agri">{t("optAgri") || "Agriculture-allied activity (Dairy, Poultry, Fishery)"}</option>
                <option value="education">{t("optEdu") || "Higher education or professional course"}</option>
              </select>
            </div>
          </div>

          {/* Q2: Estimated Cost */}
          <div className="flex gap-3 sm:gap-4 items-start">
            <span className="flex-none w-7 h-7 rounded-full border border-[#1F3A5F] text-[#1F3A5F] font-serif font-bold text-sm flex items-center justify-center mt-1">
              2
            </span>
            <div className="flex-1 min-w-0">
              <label htmlFor="costInput" className="block text-sm font-semibold text-[#2B2A28] mb-1.5">
                {isEdu ? (t("q2LabelCostEdu") || "Estimated course cost (₹)") : (t("q2LabelCost") || "Estimated project cost (₹)")}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#6B6558] font-serif text-base">₹</span>
                <input
                  type="number"
                  id="costInput"
                  min="5000"
                  step="5000"
                  value={costInput}
                  onChange={(e) => setCostInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-white border border-[#D8D2C4] rounded text-base font-serif font-medium text-[#1F3A5F] focus:border-[#1F3A5F] focus:outline-none transition shadow-sm"
                  required
                />
              </div>
              <p className="text-xs text-[#6B6558] mt-1.5">
                {isEdu
                  ? (t("costEduHint") || "Standard domestic degree cap is ₹20 Lakhs; courses abroad eligible up to ₹40 Lakhs.")
                  : (t("costGeneralHint") || "Micro-credit covers up to ₹1.4 Lakhs; Term loans cover up to ₹50 Lakhs.")}
              </p>
            </div>
          </div>

          {/* Q3: Annual Income */}
          <div className="flex gap-3 sm:gap-4 items-start">
            <span className="flex-none w-7 h-7 rounded-full border border-[#1F3A5F] text-[#1F3A5F] font-serif font-bold text-sm flex items-center justify-center mt-1">
              3
            </span>
            <div className="flex-1 min-w-0">
              <label htmlFor="incomeInput" className="block text-sm font-semibold text-[#2B2A28] mb-1.5">
                {t("q3LabelIncome") || "Annual family income (₹)"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#6B6558] font-serif text-base">₹</span>
                <input
                  type="number"
                  id="incomeInput"
                  min="0"
                  step="5000"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-white border border-[#D8D2C4] rounded text-base font-serif font-medium text-[#1F3A5F] focus:border-[#1F3A5F] focus:outline-none transition shadow-sm"
                  required
                />
              </div>
              <p className="text-xs text-[#6B6558] mt-1.5">
                {t("incomeHintRule") || "Concessional government schemes strictly apply up to ₹5,00,000 per year family income."}
              </p>
            </div>
          </div>

          {/* Q4: SC Category Proof */}
          <div className="flex gap-3 sm:gap-4 items-start">
            <span className="flex-none w-7 h-7 rounded-full border border-[#1F3A5F] text-[#1F3A5F] font-serif font-bold text-sm flex items-center justify-center mt-1">
              4
            </span>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-semibold text-[#2B2A28] mb-1.5">
                {t("q4LabelProof") || "Do you have Scheduled Caste (SC) category proof?"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <label
                  className={`border rounded p-2.5 text-center cursor-pointer text-xs sm:text-sm font-medium transition ${
                    casteProof === "yes"
                      ? "bg-[#1F3A5F] text-white border-[#1F3A5F] shadow-sm"
                      : "bg-white text-[#2B2A28] border-[#D8D2C4] hover:bg-[#F1ECE0]"
                  }`}
                >
                  <input
                    type="radio"
                    name="proof"
                    value="yes"
                    checked={casteProof === "yes"}
                    onChange={() => setCasteProof("yes")}
                    className="hidden"
                  />
                  <span>{t("proofYes") || "Yes — have certificate"}</span>
                </label>

                <label
                  className={`border rounded p-2.5 text-center cursor-pointer text-xs sm:text-sm font-medium transition ${
                    casteProof === "no"
                      ? "bg-[#1F3A5F] text-white border-[#1F3A5F] shadow-sm"
                      : "bg-white text-[#2B2A28] border-[#D8D2C4] hover:bg-[#F1ECE0]"
                  }`}
                >
                  <input
                    type="radio"
                    name="proof"
                    value="no"
                    checked={casteProof === "no"}
                    onChange={() => setCasteProof("no")}
                    className="hidden"
                  />
                  <span>{t("proofNo") || "No / in progress"}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 pl-0 sm:pl-11">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-[#E8A33D] hover:bg-[#B97A1C] text-[#2B2A28] hover:text-white font-semibold rounded text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>{t("checkingBtn") || "Finding matching schemes..."}</span>
              ) : (
                <>
                  <span>{t("checkEligibilityBtn") || "Find My Scheme"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>


        {/* RESULTS SECTION */}
        {hasSearched && result && (
          <div className="mt-12 transition-all duration-300">
            {result.status === "match" ? (
              /* MATCHED PASSBOOK ENTRY */
              <div className="ledger-entry bg-[#FFFDF9] border border-[#D8D2C4] p-6 sm:p-8 rounded-md shadow-sm relative">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs uppercase text-[#6B6558] mb-1">
                      <span className="font-semibold text-[#1F3A5F]">{t("auditOutcome") || "Loan Eligibility"}</span>
                      <span>•</span>
                      <span className="text-[#3B6E52] font-semibold">{t("ruleMatched") || "Best Match Found"}</span>
                    </div>

                    <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1F3A5F]">
                      {result.scheme.name}
                    </h2>
                    <p className="text-sm text-[#6B6558] mt-1 mb-4 leading-relaxed">
                      {result.scheme.description}
                    </p>

                    {/* Natural-Language Explanation Box (Rephrased via Groq LLM & Fact-Validated) */}
                    <div className="bg-[#FAF7F0] border border-[#D8D2C4] rounded-md p-4 mb-6 shadow-2xs">
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#D8D2C4]/70">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#E8A33D]" />
                          <span className="font-semibold text-xs text-[#1F3A5F]">
                            {t("aiSummaryTitle") || "Plain-Language AI Explanation"}
                          </span>
                        </div>
                      </div>

                      {aiLoading ? (
                        <div className="py-2 flex items-center gap-2 text-xs text-[#6B6558]">
                          <span className="inline-block w-2 h-2 rounded-full bg-[#1F3A5F] animate-bounce"></span>
                          <span className="inline-block w-2 h-2 rounded-full bg-[#1F3A5F] animate-bounce [animation-delay:0.2s]"></span>
                          <span className="inline-block w-2 h-2 rounded-full bg-[#1F3A5F] animate-bounce [animation-delay:0.4s]"></span>
                          <span>{t("aiGenerating") || "Generating warm summary..."}</span>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-[#2B2A28] leading-relaxed font-sans">
                          {aiExplanation || result.reason}
                        </p>
                      )}

                      {/* Expandable toggle to view raw deterministic rules engine reasoning */}
                      <div className="mt-3 pt-2.5 border-t border-[#D8D2C4]/60">
                        <button
                          type="button"
                          onClick={() => setShowRawReason(!showRawReason)}
                          className="text-[11px] text-[#6B6558] hover:text-[#1F3A5F] inline-flex items-center gap-1 font-medium transition cursor-pointer"
                        >
                          <span>{showRawReason ? "Hide statutory rules reasoning" : "View statutory rules engine reasoning"}</span>
                          {showRawReason ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {showRawReason && (
                          <div className="mt-2 p-2.5 bg-[#F1ECE0] rounded text-[11px] text-[#2B2A28] leading-relaxed border-l-2 border-[#1F3A5F]">
                            <strong className="text-[#1F3A5F]">Rules Engine Audit: </strong>
                            {result.reason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Capped Warning */}
                    {result.capped && (
                      <div className="bg-[#FBEBD2] border-l-2 border-[#E8A33D] p-3 rounded text-xs text-[#2B2A28] leading-relaxed mb-6">
                        <span className="font-semibold text-[#B97A1C]">{t("projectCapExceeded") || "Course Loan Limit: "}</span>
                        Maximum concessional loan for domestic education is capped at ₹20,00,000.
                        Remaining balance of {formatINR(Number(costInput) - 2000000)} can be arranged
                        via personal contribution or scholarship (study abroad is eligible up to ₹40,00,000).
                      </div>
                    )}

                    {/* Caste proof guidance */}
                    {result.casteProofNote && (
                      <div className="bg-[#E4EEE7] border-l-2 border-[#3B6E52] p-3 rounded text-xs text-[#2B2A28] leading-relaxed mb-6">
                        <span className="font-semibold text-[#3B6E52]">{t("proofHelp") || "Document Reminder: "}</span>
                        {result.casteProofNote}
                      </div>
                    )}

                    {/* 90% Cost Coverage & Your Contribution Card */}
                    <div className="bg-[#FAF7F0] border border-[#D8D2C4] rounded-md p-4 mb-6">
                      <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2 mb-3">
                        <span className="text-xs font-semibold uppercase text-[#1F3A5F]">
                          {t("marginBreakdownTitle") || "Loan Amount & Your Contribution Breakdown"}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 bg-[#3B6E52]/10 text-[#3B6E52] font-semibold rounded border border-[#3B6E52]/20">
                          {result.loanPercentage || 90}% Government Loan • {result.marginPercentage || 10}% Your Share
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded border border-[#D8D2C4]/70">
                          <span className="text-xs text-[#6B6558] block">{t("totalProjectCost") || "Total Project / Course Cost"}</span>
                          <span className="font-serif font-bold text-xl text-[#2B2A28]">
                            {formatINR(result.enteredCost || costInput)}
                          </span>
                          <span className="text-[11px] text-[#6B6558] block mt-0.5">100% of money needed</span>
                        </div>

                        <div className="bg-white p-3 rounded border border-[#3B6E52]/30 bg-emerald-50/30">
                          <span className="text-xs text-[#3B6E52] font-medium block">
                            {t("eligibleLoanLabel") || "Eligible Government Loan (90%)"}
                          </span>
                          <span className="font-serif font-bold text-xl text-[#1F3A5F]">
                            {formatINR(result.eligibleLoanAmount || (result.scheme.maxCost ? Math.min(result.scheme.maxCost, Math.round(0.9 * (result.enteredCost || costInput))) : 0))}
                          </span>
                          <span className="text-[11px] text-[#3B6E52] block mt-0.5 font-medium">{t("schemeCoverage") || "Covered under low-interest scheme"}</span>
                        </div>

                        <div className="bg-white p-3 rounded border border-[#B97A1C]/30 bg-amber-50/30">
                          <span className="text-xs text-[#B97A1C] font-medium block">
                            {t("borrowerMargin") || "Your Share (10% Margin Money)"}
                          </span>
                          <span className="font-serif font-bold text-xl text-[#B97A1C]">
                            {formatINR(result.marginMoney !== undefined ? result.marginMoney : (Number(costInput) - (result.eligibleLoanAmount || 0)))}
                          </span>
                          <span className="text-[11px] text-[#6B6558] block mt-0.5">{t("selfContr") || "Your self-contribution"}</span>
                        </div>
                      </div>

                      {/* Explicit Margin Money Explanation Note */}
                      <p className="text-xs text-[#6B6558] mt-2.5 leading-relaxed">
                        <span className="font-semibold text-[#1F3A5F]">Important Note: </span>
                        The government scheme funds up to 90% of your total project cost. You only need to arrange the remaining 10% ({formatINR(result.marginMoney || 0)}) from your personal savings or state subsidies.
                      </p>
                    </div>

                    {/* Key Scheme Terms */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#D8D2C4]">
                      <div>
                        <span className="text-xs text-[#6B6558] block">{t("concessionalRate") || "Low Interest Rate"}</span>
                        <span className="font-serif font-bold text-xl text-[#1F3A5F]">
                          {result.scheme.rate}% p.a.
                        </span>
                        <span className="text-[11px] text-[#6B6558] block">{t("statutoryInterest") || "Government subsidized rate"}</span>
                      </div>

                      <div>
                        <span className="text-xs text-[#6B6558] block">{t("moratoriumGrace") || "Repayment Holiday (Grace Period)"}</span>
                        <span className="font-serif font-bold text-xl text-[#1F3A5F]">
                          {result.scheme.moratorium} {t("months") || "Months"}
                        </span>
                        <span className="text-[11px] text-[#6B6558] block">{t("repaymentHoliday") || "No loan repayment during startup"}</span>
                      </div>

                      <div>
                        <span className="text-xs text-[#6B6558] block">{t("maxLoanLimit") || "Maximum Scheme Loan"}</span>
                        <span className="font-serif font-bold text-xl text-[#1F3A5F]">
                          {formatINR(result.scheme.maxCost)}
                        </span>
                        <span className="text-[11px] text-[#6B6558] block">{t("maxLoanLimitHelp") || "Maximum limit for this scheme"}</span>
                      </div>
                    </div>

                    {/* Official Guidelines Info Box */}
                    <div className="mt-4 p-3 bg-blue-50/50 border border-blue-200/60 rounded text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[#1F3A5F]">
                        <ShieldCheck className="w-4 h-4 text-[#3B6E52] flex-none" />
                        <span>
                          <strong>{t("officialSource") || "Government Guidelines:"}</strong> {t("nsfdcVerified") || "Official Government Scheme Information"}
                        </span>
                      </div>
                      <a
                        href={result.scheme.source_url || "https://nsfdc.nic.in/scheme"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1F3A5F] hover:underline font-medium inline-flex items-center gap-1 flex-none"
                      >
                        <span>{t("officialGuidelines") || "View Official Scheme Details"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 mt-6 pt-4 border-t border-[#D8D2C4]/60">
                      <button
                        onClick={() => onSelectForDocuments && onSelectForDocuments(result.scheme, Number(incomeInput) || 180000)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-[#E8A33D] hover:bg-[#B97A1C] text-[#2B2A28] hover:text-white rounded text-xs sm:text-sm font-semibold transition flex items-center justify-center sm:justify-start gap-2 shadow-sm cursor-pointer"
                      >
                        <FileCheck className="w-4 h-4 shrink-0" />
                        <span>{t("actionCheckDocuments") || "Verify Required Documents"}</span>
                      </button>

                      <button
                        onClick={() => onSelectForCalculator && onSelectForCalculator(result.scheme, result.eligibleLoanAmount || result.effectiveAmount || costInput)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-[#1F3A5F] hover:bg-[#345178] text-white rounded text-xs sm:text-sm font-semibold transition flex items-center justify-center sm:justify-start gap-2 shadow-sm cursor-pointer"
                      >
                        <Calculator className="w-4 h-4 shrink-0" />
                        <span>{t("actionCalculateEmi") || "Calculate My EMI"}</span>
                      </button>

                      <button
                        onClick={() => onSelectForLocator && onSelectForLocator(result.scheme.id)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-[#F1ECE0] border border-[#D8D2C4] text-[#1F3A5F] rounded text-xs sm:text-sm font-semibold transition flex items-center justify-center sm:justify-start gap-2 cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{t("actionFindPartner") || "Find Nearby Bank to Apply"}</span>
                      </button>

                      <button
                        onClick={() => onSelectForAi && onSelectForAi(result.scheme)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-[#FAF7F0] hover:bg-[#F1ECE0] border border-[#1F3A5F] text-[#1F3A5F] rounded text-xs sm:text-sm font-semibold transition flex items-center justify-center sm:justify-start gap-2 shadow-2xs cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-[#E8A33D] shrink-0" />
                        <span>{t.askAiBtn || "Ask AI"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Stamp / Badge */}
                  <div className="flex-none self-center sm:self-start">
                    <div className="px-4 py-2.5 bg-[#E4EEE7] border-2 border-[#3B6E52] rounded-lg text-[#3B6E52] text-center font-bold text-xs uppercase tracking-wider shadow-sm">
                      Eligible<br />Match
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* INELIGIBLE ENTRY */
              <div className="ledger-entry-danger border border-[#D8D2C4] p-6 sm:p-8 rounded-md shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-[#A6412A] flex-none mt-0.5" />
                  <div>
                    <span className="text-xs uppercase text-[#A6412A] tracking-wider font-semibold">
                      {t("auditOutcome") || "Loan Eligibility Notice"}
                    </span>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#A6412A] mt-1">
                      {t("incomeExceeded") || "Not eligible for this subsidized scheme"}
                    </h3>

                    <p className="text-sm text-[#2B2A28] mt-2 leading-relaxed">
                      {result.reason}
                    </p>

                    <div className="mt-4 p-3 bg-white border border-[#D8D2C4] rounded text-xs text-[#6B6558] leading-relaxed">
                      <span className="font-semibold text-[#2B2A28]">{t("whyMatched") || "What you can do next: "}</span>
                      {result.suggestedAlternative}
                    </div>

                    <div className="mt-4 text-xs text-[#6B6558]">
                      Need assistance? You can adjust your answers above or visit your nearest district government bank.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
