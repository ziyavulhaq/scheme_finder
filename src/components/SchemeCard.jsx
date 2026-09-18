import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { formatINR } from "../utils/financialMath";
import { 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Calculator, 
  MapPin, 
  Layers, 
  Percent, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  AlertCircle 
} from "lucide-react";

export const SchemeCard = ({ 
  scheme, 
  onSelectForCalculator, 
  onSelectForLocator, 
  onToggleCompare, 
  isCompared = false 
}) => {
  const { lang, t } = useLanguage();
  const [showExplanation, setShowExplanation] = useState(false);

  // Dynamic language title lookup
  const localizedTitle = 
    lang === "hi" && scheme.titleHi ? scheme.titleHi :
    lang === "ta" && scheme.titleTa ? scheme.titleTa :
    lang === "te" && scheme.titleTe ? scheme.titleTe :
    scheme.title;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-soft hover:shadow-hover overflow-hidden flex flex-col justify-between ${
      scheme.matchScore >= 80 ? "border-emerald-300 ring-1 ring-emerald-400/30" : "border-slate-200"
    }`}>
      {/* Top Banner / Match Score */}
      <div>
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              {scheme.code}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
              {scheme.category}
            </span>
          </div>

          {/* AI Match Score Pill */}
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 block leading-none">
                {t("matchScore")}
              </span>
              <span className={`text-sm font-extrabold ${
                scheme.matchScore >= 80 ? "text-emerald-700" : scheme.matchScore >= 60 ? "text-blue-700" : "text-amber-700"
              }`}>
                {scheme.matchScore}%
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-300">
              ✓
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {localizedTitle}
            </h3>
          </div>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {scheme.tagline}
          </p>

          {/* Scheme Badges */}
          <div className="mt-3">
            <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
              ★ {scheme.badge}
            </span>
          </div>

          {/* Financial Highlights Matrix */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">{t("concessionalRate")}</span>
              <span className="font-extrabold text-base text-emerald-700 flex items-center gap-1">
                {scheme.interestRate}% <span className="text-[10px] font-normal text-slate-500">p.a.</span>
              </span>
              <span className="text-[10px] text-slate-400 line-through">
                Market: {scheme.commercialRate}%
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">{t("maxLoanLimit")}</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatINR(scheme.maxLoan)}
              </span>
              <span className="text-[10px] text-emerald-700 block font-medium">
                {scheme.coveragePercent}% financed
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">{t("moratoriumLabel")}</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {scheme.maxMoratoriumMonths} Months Grace
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Max Repayment</span>
              <span className="font-semibold text-slate-800">
                {scheme.maxTenureMonths} Months
              </span>
            </div>
          </div>

          {/* Explainability Accordion: "Why this scheme?" */}
          <div className="mt-4">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full flex items-center justify-between text-xs font-semibold py-2 px-3 rounded-lg bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 border border-blue-200/70 transition"
            >
              <div className="flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
                <span>{t("whyThisScheme")}</span>
              </div>
              {showExplanation ? <ChevronUp className="w-4 h-4 text-blue-700" /> : <ChevronDown className="w-4 h-4 text-blue-700" />}
            </button>

            {showExplanation && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                  AI Eligibility Factors:
                </div>
                {scheme.reasons && scheme.reasons.length > 0 ? (
                  scheme.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-slate-600 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500">Meets standard MoSJE eligibility criteria.</div>
                )}

                {scheme.caveats && scheme.caveats.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    {scheme.caveats.map((c, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-amber-800 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2">
        <button
          onClick={() => onSelectForCalculator(scheme)}
          className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-300 shadow-sm transition"
        >
          <Calculator className="w-3.5 h-3.5 text-blue-700" />
          <span>{t("viewCalculatorBtn")}</span>
        </button>

        <button
          onClick={() => onSelectForLocator && onSelectForLocator(scheme?.id || "all")}
          className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm transition"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{t("applyNowBtn")}</span>
        </button>

        <button
          onClick={() => onToggleCompare(scheme)}
          title={t("compareBtn")}
          className={`p-2 rounded-xl border transition ${
            isCompared 
              ? "bg-amber-100 border-amber-300 text-amber-900" 
              : "bg-white hover:bg-slate-100 border-slate-300 text-slate-600"
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
