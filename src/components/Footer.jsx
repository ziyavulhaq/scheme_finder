import React from "react";
import { ShieldCheck, Lock, ExternalLink, Phone } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const Footer = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#F1ECE0] border-t border-[#D8D2C4] py-10 px-4 sm:px-8 text-xs text-[#6B6558]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Quick Page Links */}
        {onNavigate && (
          <div className="flex flex-wrap items-center justify-center gap-6 pb-4 border-b border-[#D8D2C4]/60 text-sm font-semibold text-[#1F3A5F]">
            <button
              onClick={() => {
                onNavigate("recommend");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:underline hover:text-[#B97A1C] transition cursor-pointer"
            >
              {t.navHome || "Find Scheme"}
            </button>
            <span>•</span>
            <button
              onClick={() => {
                onNavigate("calculate");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:underline hover:text-[#B97A1C] transition cursor-pointer"
            >
              {t.navCalculator || "Calculate EMI"}
            </button>
            <span>•</span>
            <button
              onClick={() => {
                onNavigate("locate");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:underline hover:text-[#B97A1C] transition cursor-pointer"
            >
              {t.navLocator || "Find Nearby Bank"}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-[#D8D2C4]">
          {/* Col 1: Mandatory Disclaimers (8 cols) */}
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-2 text-[#1F3A5F] font-serif font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#3B6E52]" />
              <span>{t.footerPortal || "SahayaSetu Citizen Assistance"}</span>
            </div>
            <p className="leading-relaxed">
              {t.footerDisclaimer ||
                "Important Note: Subsidized government loans require verification of annual family income (up to ₹5.00 Lakhs) and Caste Certificate at the bank branch."}
            </p>

            <div className="flex items-center gap-2 text-[#2B2A28] pt-1">
              <Phone className="w-3.5 h-3.5 text-[#1F3A5F]" />
              <span className="font-semibold text-[#1F3A5F]">{t.helpline || "Toll-Free Helpline: 14566"}</span>
            </div>
          </div>

          {/* Col 2: Official Portals (4 cols) */}
          <div className="md:col-span-4 space-y-2">
            <div className="font-semibold text-[#1F3A5F] uppercase text-[11px] tracking-wider">
              {t.officialSource || "Official Government Portals"}
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a
                  href="https://socialjustice.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1F3A5F] hover:underline flex items-center gap-1"
                >
                  <span>{t.footerDept || "Social Justice & Welfare Portal • Govt. of India"}</span>
                  <ExternalLink className="w-3 h-3 text-[#6B6558]" />
                </a>
              </li>
              <li>
                <a
                  href="https://nsfdc.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1F3A5F] hover:underline flex items-center gap-1"
                >
                  <span>National SC Finance & Dev Corp (NSFDC)</span>
                  <ExternalLink className="w-3 h-3 text-[#6B6558]" />
                </a>
              </li>
              <li>
                <a
                  href="https://mudra.org.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1F3A5F] hover:underline flex items-center gap-1"
                >
                  <span>Pradhan Mantri MUDRA Yojana</span>
                  <ExternalLink className="w-3 h-3 text-[#6B6558]" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Citizen Portal Footer Note */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-[#6B6558]">
          <div>
            {t.footerRef || "Helping citizens discover and apply for low-interest government schemes."}
          </div>
          <div className="text-right">
            {t.footerCopyright || "© 2026 SahayaSetu • Citizen Scheme & Loan Guide"}
          </div>
        </div>
      </div>
    </footer>
  );
};
