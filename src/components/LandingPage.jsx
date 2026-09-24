import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Building2,
  PhoneCall,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { SCHEMES } from "../data/schemes";

export const LandingPage = ({ onNavigate }) => {
  const { lang, t } = useLanguage();
  const [showMore, setShowMore] = useState(false);

  // Helper to retrieve localized title for SC schemes
  const getLocalizedTitle = (s) => {
    if (lang === "hi" && s.titleHi) return s.titleHi;
    if (lang === "ta" && s.titleTa) return s.titleTa;
    if (lang === "te" && s.titleTe) return s.titleTe;
    if (lang === "kn" && s.titleKn) return s.titleKn;
    if (lang === "ml" && s.titleMl) return s.titleMl;
    return s.title;
  };

  // Initially show top 2 schemes for SC; clicking "Show More Options" expands to all 6
  const displayedSchemes = showMore ? SCHEMES : SCHEMES.slice(0, 2);

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F0] to-[#F1ECE0] border-b border-[#D8D2C4] py-10 sm:py-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Top Pill / Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8A33D]/20 text-[#B97A1C] border border-[#E8A33D]/40 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("heroBadge") || "Government Subsidized Concessional Loan Schemes"}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1F3A5F]/10 text-[#1F3A5F]">
              <span>MoSJE • NSFDC Guidelines</span>
            </span>
          </div>

          {/* Main Headline & Subtitle */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1F3A5F] tracking-tight leading-[1.15]">
                {t("heroHeading") || "Get Concessional Loans up to ₹50 Lakhs at 6.5% – 8.0% p.a."}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-[#6B6558] max-w-2xl leading-relaxed">
                {t("heroSubheading") ||
                  "Tailored financial assistance covering up to 90% of project costs for Scheduled Caste (SC) entrepreneurs and students with annual family income up to ₹5.00 Lakhs."}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-3 sm:gap-4 items-center">
                <button
                  onClick={() => onNavigate("recommend")}
                  className="px-6 py-3.5 bg-[#E8A33D] hover:bg-[#B97A1C] text-[#1F3A5F] hover:text-white font-bold rounded-xl text-sm sm:text-base transition shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer group"
                >
                  <span>{t("startMatchingBtn") || "Check Scheme Eligibility"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate("ask-ai")}
                  className="px-5 py-3.5 bg-[#1F3A5F] hover:bg-[#345178] text-white font-bold rounded-xl text-sm sm:text-base transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#E8A33D]" />
                  <span>{t("askAiBtn") || "ASK AI Assistant"}</span>
                </button>

                <button
                  onClick={() => onNavigate("calculate")}
                  className="px-5 py-3.5 bg-white hover:bg-[#FAF7F0] border border-[#D8D2C4] text-[#1F3A5F] font-semibold rounded-xl text-sm sm:text-base transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-[#3B6E52]" />
                  <span>{t("calcEmiBtn") || "Calculate EMI"}</span>
                </button>
              </div>
            </div>

            {/* Right Card: Channel Partner Lending Notice */}
            <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#D8D2C4] shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#1F3A5F]/10 rounded-xl text-[#1F3A5F] flex-none">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1F3A5F]">
                    {t.disbursedViaBanks || "Disbursed via Authorized Banks"}
                  </h3>
                  <p className="text-xs text-[#6B6558] mt-1.5 leading-relaxed">
                    {t.disbursedViaBanksDesc ||
                      "All subsidized loans are sanctioned directly through State Channelizing Agencies (SCAs) and 11 Public Sector Banks (Canara Bank, Indian Overseas Bank, PNB, Bank of Baroda)."}
                  </p>
                  <div className="mt-3.5 pt-3 border-t border-[#D8D2C4]/70 flex items-center justify-between text-[11px] font-semibold text-[#3B6E52]">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.zeroProcessingFees || "Zero Processing Fees"}</span>
                    </span>
                    <span className="bg-[#3B6E52]/10 px-2 py-0.5 rounded text-[#3B6E52] border border-[#3B6E52]/20">
                      {t.officialQuota || "Official Quota"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Stat Metrics Ribbon */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#D8D2C4] shadow-xs">
              <div className="text-xs font-semibold text-[#6B6558]">{t("stat1Label") || "Concessional Rates"}</div>
              <div className="text-xl sm:text-2xl font-bold font-serif text-[#1F3A5F] mt-1">6.5% - 8.0%</div>
              <div className="text-[11px] text-[#6B6558] mt-0.5">vs 12-16% commercial rates</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#D8D2C4] shadow-xs">
              <div className="text-xs font-semibold text-[#6B6558]">{t("stat2Label") || "Project Cost Covered"}</div>
              <div className="text-xl sm:text-2xl font-bold font-serif text-[#3B6E52] mt-1">Up to 90%</div>
              <div className="text-[11px] text-[#6B6558] mt-0.5">You only need 10% margin</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#D8D2C4] shadow-xs">
              <div className="text-xs font-semibold text-[#6B6558]">{t("stat3Label") || "Income Limit"}</div>
              <div className="text-xl sm:text-2xl font-bold font-serif text-[#1F3A5F] mt-1">≤ ₹5.00 Lakhs</div>
              <div className="text-[11px] text-[#6B6558] mt-0.5">Family annual income ceiling</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#D8D2C4] shadow-xs">
              <div className="text-xs font-semibold text-[#6B6558]">{t("stat4Label") || "Channel Partners"}</div>
              <div className="text-xl sm:text-2xl font-bold font-serif text-[#B97A1C] mt-1">100+ Branches</div>
              <div className="text-[11px] text-[#6B6558] mt-0.5">SCAs &amp; Public Sector Banks</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONCESSIONAL SCHEMES FOR SCHEDULED CASTES (SC) */}
      <section className="bg-[#FAF7F0] border-b border-[#D8D2C4] py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B97A1C]">
                {t.scEligibilityBadge || "Official NSFDC Schemes for Scheduled Castes (SC)"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F3A5F] mt-1">
                {t.schemesForSc || "Concessional Loan Schemes for Scheduled Castes (SC)"}
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6558] mt-1.5 max-w-2xl">
                {t.schemesForScSub ||
                  "Specialized low-interest financial assistance under NSFDC & MoSJE guidelines with up to 90% funding and 10% borrower margin."}
              </p>
            </div>
            <button
              onClick={() => onNavigate("recommend")}
              className="text-xs font-bold text-[#1F3A5F] hover:text-[#B97A1C] inline-flex items-center gap-1 transition shrink-0 cursor-pointer"
            >
              <span>{t.viewGuidelines || "View full statutory guidelines"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayedSchemes.map((scheme) => {
              const localizedTitle = getLocalizedTitle(scheme);
              const formattedMaxLoan =
                scheme.maxLoan >= 10000000
                  ? `₹${(scheme.maxLoan / 10000000).toFixed(2)} Cr`
                  : scheme.maxLoan >= 100000
                  ? `₹${(scheme.maxLoan / 100000).toFixed(2).replace(/\.00$/, "")} Lakh`
                  : `₹${scheme.maxLoan.toLocaleString("en-IN")}`;

              return (
                <div
                  key={scheme.id}
                  className="bg-white p-5 rounded-xl border border-[#D8D2C4] shadow-xs hover:shadow-sm transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#1F3A5F]/10 text-[#1F3A5F]">
                        {scheme.category}
                      </span>
                      <span className="text-sm font-serif font-bold text-[#3B6E52]">
                        {scheme.interestRate}% p.a.
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#1F3A5F]">
                      {localizedTitle}
                    </h3>
                    <p className="text-xs text-[#6B6558] mt-1.5 leading-relaxed">
                      {scheme.tagline}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs bg-[#FAF7F0] p-2.5 rounded-lg border border-[#D8D2C4]/60">
                      <div>
                        <span className="text-[10px] text-[#6B6558] block">
                          {t.maxLoanLabel || "Max Loan"}
                        </span>
                        <strong className="text-[#1F3A5F]">{formattedMaxLoan}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6B6558] block">
                          {t.marginShareLabel || "Margin Share"}
                        </span>
                        <strong className="text-[#B97A1C]">{scheme.ownContributionMin}%</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6B6558] block">
                          {t.gracePeriodLabel || "Grace Period"}
                        </span>
                        <strong className="text-[#1F3A5F]">{scheme.defaultMoratoriumMonths} Months</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 pt-2 border-t border-[#D8D2C4]/50">
                    <button
                      onClick={() => onNavigate("recommend")}
                      className="w-full py-2 bg-[#FAF7F0] hover:bg-[#F1ECE0] border border-[#D8D2C4] text-[#1F3A5F] text-xs font-bold rounded-lg transition cursor-pointer text-center"
                    >
                      {t.checkMyMatch || "Eligibility"}
                    </button>
                    <button
                      onClick={() => onNavigate("calculate", scheme)}
                      className="w-full py-2 bg-white hover:bg-[#FAF7F0] border border-[#D8D2C4] text-[#1F3A5F] text-xs font-bold rounded-lg transition cursor-pointer text-center"
                    >
                      {t.simulateEmiBtn || "EMI"}
                    </button>
                    <button
                      onClick={() => onNavigate("ask-ai", scheme)}
                      className="w-full py-2 bg-[#1F3A5F] hover:bg-[#345178] text-white text-xs font-bold rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#E8A33D]" />
                      <span>{t.askAiBtn || "Ask AI"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show More / Show Less Options Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowMore(!showMore)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-[#F1ECE0] border border-[#D8D2C4] text-[#1F3A5F] font-bold text-sm transition shadow-xs hover:shadow-sm cursor-pointer"
            >
              <span>
                {showMore ? (t.showLessOptions || "Show Less Options") : (t.showMoreOptions || "Show More Options")}
              </span>
              {showMore ? (
                <ChevronUp className="w-4 h-4 text-[#B97A1C]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#B97A1C]" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 3. 4-STEP CITIZEN ROADMAP */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B97A1C]">
            {t.fourStepProcess || "Simple 4-Step Process"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F3A5F] mt-1">
            {t.fourStepProcessSub || "How to Get Your Government Loan Funded"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#D8D2C4] shadow-xs relative">
            <span className="w-7 h-7 rounded-full bg-[#1F3A5F] text-[#E8A33D] font-bold text-xs flex items-center justify-center mb-3">
              1
            </span>
            <h4 className="font-serif font-bold text-base text-[#1F3A5F]">
              {t.step1Title || "Check Eligibility"}
            </h4>
            <p className="text-xs text-[#6B6558] mt-1 leading-relaxed">
              {t.step1Desc || "Answer 4 questions on your project cost, income, and category. Instant rule-based outcome."}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#D8D2C4] shadow-xs relative">
            <span className="w-7 h-7 rounded-full bg-[#1F3A5F] text-[#E8A33D] font-bold text-xs flex items-center justify-center mb-3">
              2
            </span>
            <h4 className="font-serif font-bold text-base text-[#1F3A5F]">
              {t.step2Title || "Simulate EMI"}
            </h4>
            <p className="text-xs text-[#6B6558] mt-1 leading-relaxed">
              {t.step2Desc || "Calculate your monthly repayment schedule and understand your 10% margin money share."}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#D8D2C4] shadow-xs relative">
            <span className="w-7 h-7 rounded-full bg-[#1F3A5F] text-[#E8A33D] font-bold text-xs flex items-center justify-center mb-3">
              3
            </span>
            <h4 className="font-serif font-bold text-base text-[#1F3A5F]">
              {t.step3Title || "Verify Documents"}
            </h4>
            <p className="text-xs text-[#6B6558] mt-1 leading-relaxed">
              {t.step3Desc || "Verify your Caste Certificate, Income Certificate, and Quotations on your device with zero upload."}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#D8D2C4] shadow-xs relative">
            <span className="w-7 h-7 rounded-full bg-[#1F3A5F] text-[#E8A33D] font-bold text-xs flex items-center justify-center mb-3">
              4
            </span>
            <h4 className="font-serif font-bold text-base text-[#1F3A5F]">
              {t.step4Title || "Apply at Nearest Bank"}
            </h4>
            <p className="text-xs text-[#6B6558] mt-1 leading-relaxed">
              {t.step4Desc || "Take your pre-filled referral slip to your confirmed Public Sector Bank branch or State Agency."}
            </p>
          </div>
        </div>
      </section>

      {/* 4. NATIONAL HELPLINES & TRUST FOOTER RIBBON */}
      <section className="bg-[#1F3A5F] text-white py-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl text-[#E8A33D]">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg">
                {t.needHelpTitle || "Need Immediate Assistance?"}
              </h4>
              <p className="text-xs text-white/80">
                {t.needHelpSub || "Official Ministry of Social Justice & Empowerment (MoSJE) Citizen Helplines"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:14566"
              className="px-4 py-2 rounded-lg bg-[#E8A33D] hover:bg-[#B97A1C] text-[#1F3A5F] hover:text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5"
            >
              <span>{t.nationalHelpline || "National Helpline: 14566"}</span>
            </a>

            <a
              href="tel:1930"
              className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/20 transition flex items-center gap-1.5"
            >
              <span>{t.cyberFraudHelpline || "Cyber Fraud: 1930"}</span>
            </a>

            <a
              href="https://nsfdc.nic.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/20 transition flex items-center gap-1.5"
            >
              <span>nsfdc.nic.in</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
