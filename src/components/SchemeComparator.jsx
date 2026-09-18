import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { SCHEMES } from "../data/schemes";
import { formatINR } from "../utils/financialMath";
import { Layers, X, Plus, CheckCircle2, ArrowRight } from "lucide-react";

export const SchemeComparator = ({ 
  comparedSchemes = [], 
  onRemoveFromCompare, 
  onAddScheme, 
  onSelectForCalculator, 
  onSelectForLocator 
}) => {
  const { lang, t } = useLanguage();

  // If none selected, default to top 2 schemes for demo comparison
  const displaySchemes = comparedSchemes.length > 0 
    ? comparedSchemes 
    : [SCHEMES[0], SCHEMES[2]]; // Micro Credit & Term Loan

  return (
    <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 mb-2">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Side-by-Side Analysis</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Concessional Schemes Comparison Matrix
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Compare loan ceilings, interest subsidies, moratorium grace periods, and eligible activities to pick the best financing option.
        </p>
      </div>

      {/* Comparison Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-1/4 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  Feature / Parameter
                </th>
                {displaySchemes.map(scheme => {
                  const localizedTitle = 
                    lang === "hi" && scheme.titleHi ? scheme.titleHi :
                    lang === "ta" && scheme.titleTa ? scheme.titleTa :
                    lang === "te" && scheme.titleTe ? scheme.titleTe :
                    scheme.title;

                  return (
                    <th key={scheme.id} className="p-4 w-1/3 border-l border-slate-200 align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 uppercase">
                            {scheme.code}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                            {localizedTitle}
                          </h4>
                        </div>
                        {comparedSchemes.length > 0 && (
                          <button
                            onClick={() => onRemoveFromCompare(scheme.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Category */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/50">
                  Target Category
                </td>
                {displaySchemes.map(s => (
                  <td key={s.id} className="p-4 border-l border-slate-200 font-medium text-slate-800">
                    {s.category}
                  </td>
                ))}
              </tr>

              {/* Maximum Loan Ceiling */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/50">
                  Maximum Loan Limit
                </td>
                {displaySchemes.map(s => (
                  <td key={s.id} className="p-4 border-l border-slate-200">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatINR(s.maxLoan)}
                    </span>
                    <span className="block text-[11px] text-emerald-700 font-medium">
                      Covers {s.coveragePercent}% of project cost
                    </span>
                  </td>
                ))}
              </tr>

              {/* Interest Rate */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/50">
                  Concessional Interest Rate
                </td>
                {displaySchemes.map(s => (
                  <td key={s.id} className="p-4 border-l border-slate-200">
                    <span className="text-base font-extrabold text-emerald-700">
                      {s.interestRate}% p.a.
                    </span>
                    <span className="block text-[10px] text-slate-400 line-through">
                      Commercial Rate: {s.commercialRate}% p.a.
                    </span>
                  </td>
                ))}
              </tr>

              {/* Moratorium Grace Period */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/50">
                  Moratorium Period (Grace)
                </td>
                {displaySchemes.map(s => (
                  <td key={s.id} className="p-4 border-l border-slate-200 font-semibold text-slate-800">
                    Up to {s.maxMoratoriumMonths} Months
                  </td>
                ))}
              </tr>

              {/* Repayment Tenure */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/50">
                  Maximum Repayment Tenure
                </td>
                {displaySchemes.map(s => (
                  <td key={s.id} className="p-4 border-l border-slate-200 font-medium text-slate-700">
                    {s.maxTenureMonths} Months ({Math.round(s.maxTenureMonths / 12)} Years)
                  </td>
                ))}
              </tr>

              {/* Self Contribution */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/50">
                  Promoter Contribution
                </td>
                {displaySchemes.map(s => (
                  <td key={s.id} className="p-4 border-l border-slate-200 text-slate-700">
                    Just {s.ownContributionMin}% (90% MoSJE funded)
                  </td>
                ))}
              </tr>

              {/* Key Activities */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/50">
                  Supported Activities
                </td>
                {displaySchemes.map(s => (
                  <td key={s.id} className="p-4 border-l border-slate-200">
                    <div className="flex flex-wrap gap-1">
                      {s.eligibleActivities.map((act, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {act}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Actions */}
              <tr>
                <td className="p-4 bg-slate-50/50"></td>
                {displaySchemes.map(s => (
                  <td key={s.id} className="p-4 border-l border-slate-200 space-y-2">
                    <button
                      onClick={() => onSelectForCalculator(s)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200 transition"
                    >
                      Calculate EMI
                    </button>
                    <button
                      onClick={() => onSelectForLocator(s)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition"
                    >
                      Find Nearest Partner →
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
