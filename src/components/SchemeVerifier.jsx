import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  PhoneCall,
  Search,
  Building2,
  Globe,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Landmark,
  FileWarning,
  Lock,
  ArrowRight,
  Info
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { assessSchemeAndLender, searchRegistry, isGovernmentDomain } from "../utils/verifierEngine";

export const SchemeVerifier = () => {
  const { t } = useLanguage();

  // Form State
  const [schemeQuery, setSchemeQuery] = useState("");
  const [lenderName, setLenderName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [upfrontFeeAsked, setUpfrontFeeAsked] = useState(false);
  const [urgencyTactics, setUrgencyTactics] = useState(false);
  const [otpOrPinRequested, setOtpOrPinRequested] = useState(false);
  const [unverifiableDepartment, setUnverifiableDepartment] = useState(false);

  // UI State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Live autosuggest for scheme names
  useEffect(() => {
    if (schemeQuery.trim().length >= 2) {
      const hits = searchRegistry(schemeQuery);
      setSuggestions(hits.slice(0, 4));
    } else {
      setSuggestions([]);
    }
  }, [schemeQuery]);

  // Run assessment
  const handleVerify = (overrideParams = {}) => {
    const params = {
      schemeName: overrideParams.schemeName !== undefined ? overrideParams.schemeName : schemeQuery,
      websiteUrl: overrideParams.websiteUrl !== undefined ? overrideParams.websiteUrl : websiteUrl,
      lenderName: overrideParams.lenderName !== undefined ? overrideParams.lenderName : lenderName,
      upfrontFeeAsked: overrideParams.upfrontFeeAsked !== undefined ? overrideParams.upfrontFeeAsked : upfrontFeeAsked,
      urgencyTactics: overrideParams.urgencyTactics !== undefined ? overrideParams.urgencyTactics : urgencyTactics,
      otpOrPinRequested: overrideParams.otpOrPinRequested !== undefined ? overrideParams.otpOrPinRequested : otpOrPinRequested,
      unverifiableDepartment: overrideParams.unverifiableDepartment !== undefined ? overrideParams.unverifiableDepartment : unverifiableDepartment
    };

    const res = assessSchemeAndLender(params);
    setAssessment(res);
    setShowSuggestions(false);
  };

  const handleReset = () => {
    setSchemeQuery("");
    setLenderName("");
    setWebsiteUrl("");
    setUpfrontFeeAsked(false);
    setUrgencyTactics(false);
    setOtpOrPinRequested(false);
    setUnverifiableDepartment(false);
    setAssessment(null);
    setSuggestions([]);
  };

  const domainIsGov = websiteUrl.trim() ? isGovernmentDomain(websiteUrl) : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Module Header */}
      <div className="bg-white rounded-2xl border border-[#D8D2C4] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#1F3A5F]/10 text-[#1F3A5F]">
              <ShieldCheck className="w-4 h-4 text-[#1F3A5F]" />
              <span>Module 5 • Official Verification &amp; Anti-Scam Shield</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F3A5F] tracking-tight">
              {t.verifyTitle || "Scheme & Lender Verification Checker"}
            </h1>
          </div>

          {/* Golden Hour / Cybercrime Badge */}
          <div className="shrink-0 bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl p-3 flex sm:flex-col items-center justify-between sm:justify-center gap-2 text-center">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#9A3412]">
              <PhoneCall className="w-3.5 h-3.5 text-[#DC2626] animate-pulse" />
              <span>Cyber Fraud: 1930</span>
            </div>
            <a
              href="tel:1930"
              className="px-3 py-1 bg-[#1F3A5F] text-white rounded-lg text-[11px] font-bold hover:bg-[#162a45] transition cursor-pointer shadow-xs"
            >
              Dial 1930
            </a>
          </div>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="bg-white rounded-2xl border border-[#D8D2C4] p-5 sm:p-7 shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1F3A5F]">
            Scheme Name or Keyword *
          </label>
          <div className="relative">
            <input
              type="text"
              value={schemeQuery}
              onChange={(e) => {
                setSchemeQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={t.verifySearchPlaceholder || "Enter scheme name (e.g. Mudra, Mahila Samriddhi, PM Kisan...)"}
              className="w-full px-4 py-3 pl-10 rounded-xl bg-[#FBF9F4] border border-[#D8D2C4] text-sm text-[#2B2A28] placeholder-[#9C9484] focus:outline-none focus:ring-2 focus:ring-[#1F3A5F]/20 focus:border-[#1F3A5F]"
            />
            <Search className="w-4 h-4 text-[#6B6558] absolute left-3.5 top-3.5" />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#D8D2C4] rounded-xl shadow-lg z-30 overflow-hidden divide-y divide-[#D8D2C4]/40">
                {suggestions.map((s) => (
                  <div
                    key={s.slug}
                    onClick={() => {
                      setSchemeQuery(s.schemeName);
                      setShowSuggestions(false);
                      handleVerify({ schemeName: s.schemeName });
                    }}
                    className="p-3 hover:bg-[#FBF9F4] cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#1F3A5F]">{s.schemeName}</div>
                      <div className="text-[11px] text-[#6B6558]">
                        {s.nodalMinistryName || "Government Scheme"} • {s.level}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      In Registry
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Collapsible / Expandable Optional Scam Checklist */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-[#FBF9F4] border border-[#D8D2C4] hover:bg-[#F1ECE0] transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E8A33D]" />
              <span className="text-xs font-bold text-[#1F3A5F]">
                {t.optionalDetailsTitle || "Optional: Check Offer Details for Warning Signs"}
              </span>
            </div>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-[#6B6558]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6B6558]" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 rounded-xl bg-[#FBF9F4]/70 border border-[#D8D2C4] space-y-4">
              <p className="text-xs text-[#6B6558]">
                {t.optionalDetailsHint ||
                  "Enter details of the offer you received to run our rule-based red flag checklist."}
              </p>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-semibold text-[#1F3A5F] mb-1">
                  Website or Link Provided (if any)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder={t.verifyUrlPlaceholder || "Enter website or link (e.g. https://...)"}
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#2B2A28] focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
                  />
                  <Globe className="w-4 h-4 text-[#6B6558] absolute left-3 top-3" />
                </div>
                {websiteUrl.trim() && (
                  <div className="mt-1 text-[11px] flex items-center gap-1.5 font-medium">
                    {domainIsGov ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified official government/regulatory domain pattern (.gov.in / .nic.in)
                      </span>
                    ) : (
                      <span className="text-rose-700 flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        Warning: Non-government domain ({websiteUrl.replace(/^https?:\/\//i, "").split("/")[0]}). Official schemes are hosted on .gov.in.
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Lender Name */}
              <div>
                <label className="block text-xs font-semibold text-[#1F3A5F] mb-1">
                  Lender, Agency, or Loan App Name (if any)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={lenderName}
                    onChange={(e) => setLenderName(e.target.value)}
                    placeholder={t.verifyLenderPlaceholder || "Enter lender, bank, or loan app name (optional)"}
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#2B2A28] focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
                  />
                  <Building2 className="w-4 h-4 text-[#6B6558] absolute left-3 top-3" />
                </div>
              </div>

              {/* Yes/No Checkboxes for common fraud patterns */}
              <div className="space-y-3 pt-2">
                {/* 1. Upfront Fee */}
                <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-white border border-[#D8D2C4]">
                  <div className="text-xs text-[#2B2A28] leading-tight">
                    <span className="font-bold text-[#1F3A5F] block mb-0.5">
                      1. Upfront Fee Request:
                    </span>
                    {t.qUpfrontFee || "Did they ask you to pay an upfront processing fee, registration deposit, or file charge to release the loan?"}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setUpfrontFeeAsked(true)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition ${
                        upfrontFeeAsked
                          ? "bg-rose-600 text-white"
                          : "bg-[#F1ECE0] text-[#6B6558] hover:bg-[#E8DCC8]"
                      }`}
                    >
                      {t.yes || "Yes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpfrontFeeAsked(false)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition ${
                        !upfrontFeeAsked
                          ? "bg-emerald-700 text-white"
                          : "bg-[#F1ECE0] text-[#6B6558] hover:bg-[#E8DCC8]"
                      }`}
                    >
                      {t.no || "No"}
                    </button>
                  </div>
                </div>

                {/* 2. Urgency Tactics */}
                <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-white border border-[#D8D2C4]">
                  <div className="text-xs text-[#2B2A28] leading-tight">
                    <span className="font-bold text-[#1F3A5F] block mb-0.5">
                      2. Pressure Tactics:
                    </span>
                    {t.qUrgency || "Are they using pressure tactics (e.g. 'Expires in 2 hours', 'Only 3 slots left')?"}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setUrgencyTactics(true)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition ${
                        urgencyTactics
                          ? "bg-rose-600 text-white"
                          : "bg-[#F1ECE0] text-[#6B6558] hover:bg-[#E8DCC8]"
                      }`}
                    >
                      {t.yes || "Yes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrgencyTactics(false)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition ${
                        !urgencyTactics
                          ? "bg-emerald-700 text-white"
                          : "bg-[#F1ECE0] text-[#6B6558] hover:bg-[#E8DCC8]"
                      }`}
                    >
                      {t.no || "No"}
                    </button>
                  </div>
                </div>

                {/* 3. OTP or PIN Requested */}
                <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-white border border-[#D8D2C4]">
                  <div className="text-xs text-[#2B2A28] leading-tight">
                    <span className="font-bold text-[#1F3A5F] block mb-0.5">
                      3. OTP / UPI PIN Requested:
                    </span>
                    {t.qOtpPin || "Did they ask for your OTP, UPI PIN, ATM PIN, or full debit/credit card details?"}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setOtpOrPinRequested(true)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition ${
                        otpOrPinRequested
                          ? "bg-rose-600 text-white"
                          : "bg-[#F1ECE0] text-[#6B6558] hover:bg-[#E8DCC8]"
                      }`}
                    >
                      {t.yes || "Yes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpOrPinRequested(false)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition ${
                        !otpOrPinRequested
                          ? "bg-emerald-700 text-white"
                          : "bg-[#F1ECE0] text-[#6B6558] hover:bg-[#E8DCC8]"
                      }`}
                    >
                      {t.no || "No"}
                    </button>
                  </div>
                </div>

                {/* 4. No Verifiable Department */}
                <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-white border border-[#D8D2C4]">
                  <div className="text-xs text-[#2B2A28] leading-tight">
                    <span className="font-bold text-[#1F3A5F] block mb-0.5">
                      4. Sponsoring Ministry/Department:
                    </span>
                    {t.qNoDept || "Does the offer lack a verifiable sponsoring Ministry or Government Department?"}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setUnverifiableDepartment(true)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition ${
                        unverifiableDepartment
                          ? "bg-amber-600 text-white"
                          : "bg-[#F1ECE0] text-[#6B6558] hover:bg-[#E8DCC8]"
                      }`}
                    >
                      {t.yes || "Yes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnverifiableDepartment(false)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition ${
                        !unverifiableDepartment
                          ? "bg-emerald-700 text-white"
                          : "bg-[#F1ECE0] text-[#6B6558] hover:bg-[#E8DCC8]"
                      }`}
                    >
                      {t.no || "No"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleVerify()}
            className="flex-1 py-3 px-5 rounded-xl bg-[#1F3A5F] hover:bg-[#162a45] text-white font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-[#E8A33D]" />
            <span>{t.verifyBtn || "Verify Scheme & Safety"}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="py-3 px-4 rounded-xl bg-[#F1ECE0] hover:bg-[#E8DCC8] text-[#1F3A5F] font-bold text-sm transition flex items-center gap-1.5 cursor-pointer border border-[#D8D2C4]"
            title="Reset Form"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">{t.clearBtn || "Reset"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4-TIER EVIDENCE-BASED ASSESSMENT OUTPUT                                   */}
      {/* ========================================================================= */}
      {assessment && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Assessment Header Status Summary */}
          <div className="bg-[#1F3A5F] text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#E8A33D]">
                Evidence-Based Verification Assessment
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-white/10 text-[#F1ECE0]">
                Dual-Source: myScheme &amp; RBI Sachet
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold pt-1">
              {/* Pill 1: Registry Status */}
              {assessment.tier1 ? (
                <span className="px-3 py-1 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Found in myScheme Registry
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-900/80 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Not in Central Registry (Advisory)
                </span>
              )}

              {/* Pill 2: Red Flags Status */}
              {assessment.tier3.hasRedFlags ? (
                <span className="px-3 py-1 rounded-full bg-rose-900/80 text-rose-200 border border-rose-400/30 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  {assessment.tier3.flags.length} Scam Warning Sign(s) Flagged
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  No Common Red Flags Reported
                </span>
              )}

              {/* Pill 3: Regulator Guidance */}
              <span className="px-3 py-1 rounded-full bg-blue-950/80 text-blue-200 border border-blue-400/30 flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5 text-blue-400" />
                RBI Sachet Verification Available
              </span>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* TIER 1: Found in myScheme Registry                                   */}
          {/* --------------------------------------------------------------------- */}
          {assessment.tier1 && (
            <div className="bg-white rounded-2xl border-2 border-emerald-600/40 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t.tier1Badge || "Official Government Scheme"}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1F3A5F]">
                    {assessment.tier1.match.schemeName}
                  </h2>
                  {assessment.tier1.match.schemeShortTitle && (
                    <div className="text-xs font-bold text-[#6B6558]">
                      Abbreviation: {assessment.tier1.match.schemeShortTitle}
                    </div>
                  )}
                </div>

                <a
                  href={assessment.tier1.match.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  title="Open official scheme page on myScheme"
                >
                  <span>View on myScheme</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Scheme Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl bg-[#FBF9F4] border border-[#D8D2C4]">
                  <span className="font-bold text-[#1F3A5F] block mb-0.5">Nodal Ministry / Department:</span>
                  <span className="text-[#2B2A28]">
                    {assessment.tier1.match.nodalMinistryName || "Central / State Statutory Body"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FBF9F4] border border-[#D8D2C4]">
                  <span className="font-bold text-[#1F3A5F] block mb-0.5">Level &amp; Jurisdiction:</span>
                  <span className="text-[#2B2A28]">
                    {assessment.tier1.match.level} Scheme • Applicable: {assessment.tier1.match.beneficiaryState?.join(", ") || "All India"}
                  </span>
                </div>
              </div>

              {/* Description */}
              {assessment.tier1.match.briefDescription && (
                <div className="text-xs text-[#2B2A28] leading-relaxed p-3.5 rounded-xl bg-[#FBF9F4] border border-[#D8D2C4]">
                  <span className="font-bold text-[#1F3A5F] block mb-1">Official Description:</span>
                  {assessment.tier1.match.briefDescription}
                </div>
              )}

              {/* Critical Impersonation Warning */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold block mb-0.5">
                    Crucial Anti-Impersonation Warning:
                  </span>
                  {t.tier1Caution ||
                    "Caution: While this is a real government scheme, scammers often impersonate real scheme names. Always apply through official .gov.in portals or authorized banks, never through informal agents on WhatsApp."}
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TIER 2: Not Found in Registry Advisory                                */}
          {/* --------------------------------------------------------------------- */}
          {assessment.tier2.isNotFound && (
            <div className="bg-white rounded-2xl border border-amber-300 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t.tier2Badge || "Not in Central Database"}</span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-[#1F3A5F]">
                    {t.tier2Heading || "Not Found in myScheme Registry"}
                  </h2>
                </div>

                <a
                  href={`https://www.myscheme.gov.in/search?q=${encodeURIComponent(schemeQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-[#1F3A5F] hover:bg-[#162a45] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <span>{t.tier2SearchBtn || "Search on Live myScheme Portal"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="text-xs text-[#2B2A28] leading-relaxed p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <p>
                  {t.tier2Advisory ||
                    "Important Advisory: This does NOT prove the scheme is fake. The national myScheme directory lists over 4,700 schemes, but specialized local, municipal, or district-level initiatives might not be cataloged. Please verify manually via myScheme's live search or check with your local District Social Welfare Office."}
                </p>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TIER 3: Rule-Based Red-Flag Checklist                                */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-[#D8D2C4] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-serif font-bold text-[#1F3A5F]">
                  {t.tier3Heading || "Red Flags Detected (Warning Signs)"}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#6B6558] bg-[#F1ECE0] px-2.5 py-1 rounded-md border border-[#D8D2C4]">
                Heuristic Advisory
              </span>
            </div>

            <p className="text-xs text-[#6B6558] italic">
              {t.tier3Disclaimer ||
                "Notice: This checklist is a rule-based heuristic advisory based on documented fraud patterns, not a definitive legal verdict."}
            </p>

            {assessment.tier3.hasRedFlags ? (
              <div className="space-y-3 pt-2">
                {assessment.tier3.flags.map((flag) => (
                  <div
                    key={flag.id}
                    className={`p-4 rounded-xl border space-y-2 ${
                      flag.severity === "CRITICAL"
                        ? "bg-rose-50/70 border-rose-300 text-rose-950"
                        : flag.severity === "HIGH"
                        ? "bg-amber-50/70 border-amber-300 text-amber-950"
                        : "bg-blue-50/70 border-blue-300 text-blue-950"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`w-4 h-4 ${
                            flag.severity === "CRITICAL"
                              ? "text-rose-600"
                              : flag.severity === "HIGH"
                              ? "text-amber-600"
                              : "text-blue-600"
                          }`}
                        />
                        <span className="font-bold text-xs sm:text-sm">
                          {t[flag.titleKey] || flag.title}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          flag.severity === "CRITICAL"
                            ? "bg-rose-600 text-white border-rose-700"
                            : flag.severity === "HIGH"
                            ? "bg-amber-600 text-white border-amber-700"
                            : "bg-blue-600 text-white border-blue-700"
                        }`}
                      >
                        {flag.severity}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-[#2B2A28]">
                      {t[flag.descriptionKey] || flag.description}
                    </p>

                    <div className="text-[11px] font-bold flex items-start gap-1.5 pt-1 text-[#1F3A5F]">
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#E8A33D]" />
                      <span>{t[flag.actionKey] || flag.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <div className="font-bold text-sm">
                    {t.tier3NoFlags || "No Common Red Flags Detected in Provided Details"}
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    {t.tier3NoFlagsSub || "None of the standard fraud warning patterns were reported for this inquiry."}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* TIER 4: Persistent Authoritative RBI Sachet Verification             */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border-2 border-[#1F3A5F]/20 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1F3A5F] text-[#E8A33D]">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Authoritative Financial Regulatory Source</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1F3A5F]">
                  {t.tier4Heading || "Authoritative Verification via RBI Sachet"}
                </h3>
              </div>

              <a
                href="https://sachet.rbi.org.in"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3.5 py-2 rounded-xl bg-[#1F3A5F] hover:bg-[#162a45] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>{t.sachetBtn || "Open RBI Sachet Portal"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs text-[#2B2A28] leading-relaxed">
              {t.tier4Desc ||
                "RBI Sachet is the official multi-regulator platform (RBI, SEBI, IRDAI, PFRDA) established specifically to verify registered financial entities and curb illegal lending apps and fraudulent deposit schemes."}
            </p>

            {/* How to use Sachet step-by-step */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-[#FBF9F4] border border-[#D8D2C4] space-y-1">
                <span className="font-bold text-[#1F3A5F] block">1. Search Entity</span>
                <p className="text-[11px] text-[#6B6558] leading-tight">
                  Search the lender or NBFC name on Sachet to confirm regulatory registration under RBI or State laws.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#FBF9F4] border border-[#D8D2C4] space-y-1">
                <span className="font-bold text-[#1F3A5F] block">2. Check Authorization</span>
                <p className="text-[11px] text-[#6B6558] leading-tight">
                  Only borrow from recognized Public Sector Banks, Regulated NBFCs, or registered State Channelizing Agencies.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#FBF9F4] border border-[#D8D2C4] space-y-1">
                <span className="font-bold text-[#1F3A5F] block">3. Report Harassment</span>
                <p className="text-[11px] text-[#6B6558] leading-tight">
                  File an instant regulatory complaint for loan recovery harassment or unauthorized deposit schemes.
                </p>
              </div>
            </div>

            {/* Sachet Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href="https://sachet.rbi.org.in/sachet/file-a-complaint"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#E8A33D] hover:bg-[#d69330] text-[#1F3A5F] font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <FileWarning className="w-4 h-4 text-[#1F3A5F]" />
                <span>{t.sachetComplaintBtn || "Report Fraud / File Sachet Complaint"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://sachet.rbi.org.in/sachet/help-your-regulator"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#F1ECE0] hover:bg-[#E8DCC8] text-[#1F3A5F] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-[#D8D2C4]"
              >
                <span>Help Your Regulator (Report Illegal App)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* EMERGENCY NEXT STEPS & GOLDEN HOUR PROTOCOL                           */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-gradient-to-br from-[#1F3A5F] to-[#12243C] text-white rounded-2xl p-5 sm:p-7 shadow-lg space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-400 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white">
                  {t.emergencyTitle || "Emergency Action & Support"}
                </h3>
                <p className="text-xs text-[#F1ECE0]/80">
                  {t.emergencyDesc ||
                    "If you have already paid money or shared sensitive bank OTP/PIN details with a suspicious agent, act immediately during the 'golden hour' to freeze transactions."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Helpline 1930 */}
              <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-[#E8A33D] font-bold">
                    {t.helpline1930Label || "National Cyber Crime Helpline"}
                  </div>
                  <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                    1930
                  </div>
                  <p className="text-[11px] text-[#F1ECE0]/70 mt-1">
                    Operated by the Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs.
                  </p>
                </div>
                <a
                  href="tel:1930"
                  className="mt-2 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold text-center block transition shadow-xs cursor-pointer"
                >
                  {t.call1930Btn || "Dial 1930 Now"}
                </a>
              </div>

              {/* cybercrime.gov.in */}
              <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-[#E8A33D] font-bold">
                    Official Cyber Crime Portal
                  </div>
                  <div className="text-lg font-bold tracking-tight text-white mt-0.5 truncate">
                    cybercrime.gov.in
                  </div>
                  <p className="text-[11px] text-[#F1ECE0]/70 mt-1">
                    Citizen Financial Cyber Fraud Reporting System (CFCFRS) to track and recover stolen funds.
                  </p>
                </div>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full py-2 bg-[#E8A33D] hover:bg-[#d69330] text-[#1F3A5F] rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <span>{t.cybercrimePortalBtn || "Report on Cybercrime.gov.in"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="text-[11px] text-[#F1ECE0]/60 text-center pt-1">
              {t.externalLinkNote || "All external regulator links open in a new browser tab for your security."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
