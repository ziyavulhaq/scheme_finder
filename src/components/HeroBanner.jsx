import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Sparkles, ArrowRight, Percent, CheckCircle2, Building2, ShieldAlert } from "lucide-react";

export const HeroBanner = ({ onFindScheme, onCalculateEmi, onLocatePartners }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-b from-white via-blue-50/40 to-slate-50 border-b border-slate-200/80 pt-8 pb-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Tag */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>{t("heroBadge")}</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <span>Ministry of Social Justice & Empowerment (MoSJE)</span>
          </span>
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <h2 className="text-2xl sm:text-4xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t("heroHeading")}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
              {t("heroSubheading")}
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onFindScheme}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <span>{t("startMatchingBtn")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onCalculateEmi}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-sm hover:border-slate-400 transition"
              >
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>{t("calcEmiBtn")}</span>
              </button>

              <button
                onClick={onLocatePartners}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-sm border border-amber-200 transition"
              >
                <Building2 className="w-4 h-4 text-amber-700" />
                <span>{t("locatePartnerBtn")}</span>
              </button>
            </div>
          </div>

          {/* Channel Finance System Notice Card */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Important: Channel Finance Routing
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  MoSJE does not entertain direct loan applications. All concessional funds are strictly routed through accredited <strong>SCAs (TAHDCO, TSCCDC, etc.)</strong>, <strong>PSBs (SBI, Canara, Indian Bank)</strong>, <strong>RRBs</strong>, and <strong>NBFC-MFIs</strong>.
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-emerald-700">
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>NPA-Filtered Routing</span>
                  </span>
                  <span className="bg-emerald-50 px-2 py-0.5 rounded text-emerald-800 border border-emerald-200">
                    Active Quota Only
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Crucial Stat Metrics */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-soft">
            <div className="text-xs font-semibold text-slate-500">{t("stat1Label")}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-blue-900 mt-1">{t("stat1Val")}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">vs 12-15% commercial bank rates</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-soft">
            <div className="text-xs font-semibold text-slate-500">{t("stat2Label")}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1">{t("stat2Val")}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Promoter needs just 10% own share</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-soft">
            <div className="text-xs font-semibold text-slate-500">{t("stat3Label")}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{t("stat3Val")}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Annual family income ceiling</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-soft">
            <div className="text-xs font-semibold text-slate-500">{t("stat4Label")}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-700 mt-1">{t("stat4Val")}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">SCAs, PSBs, RRBs & MFIs network</div>
          </div>
        </div>
      </div>
    </div>
  );
};
