import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { ShieldCheck } from "lucide-react";

export const Footer = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#F1ECE0] border-t border-[#D8D2C4] py-6 px-4 sm:px-8 text-xs text-[#6B6558] w-full overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Navigation Quick Links */}
        {onNavigate && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-[#1F3A5F] border-b border-[#D8D2C4]/60 pb-4">
            <button
              onClick={() => { onNavigate("recommend"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="hover:text-[#E8A33D] transition cursor-pointer"
            >
              1. Find Scheme
            </button>
            <span className="text-[#D8D2C4]">•</span>
            <button
              onClick={() => { onNavigate("calculate"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="hover:text-[#E8A33D] transition cursor-pointer"
            >
              2. Calculate EMI
            </button>
            <span className="text-[#D8D2C4]">•</span>
            <button
              onClick={() => { onNavigate("documents"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="hover:text-[#E8A33D] transition cursor-pointer"
            >
              3. Verify Docs
            </button>
            <span className="text-[#D8D2C4]">•</span>
            <button
              onClick={() => { onNavigate("locate"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="hover:text-[#E8A33D] transition cursor-pointer"
            >
              4. Nearby Banks
            </button>
            <span className="text-[#D8D2C4]">•</span>
            <button
              onClick={() => { onNavigate("verify"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="hover:text-[#E8A33D] transition cursor-pointer flex items-center gap-1 font-bold text-[#1F3A5F]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#E8A33D]" />
              <span>5. {t.navVerify || "Verify Scheme"}</span>
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-[#6B6558] text-center sm:text-left">
          <div>
            {t.footerRef || "Helping citizens discover and apply for low-interest government schemes."}
          </div>
          <div className="flex items-center gap-2 text-center sm:text-right">
            <div className="h-6 px-1 rounded bg-white border border-[#D8D2C4] shadow-2xs flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="FINORA" className="h-full w-auto object-contain max-w-[36px]" />
            </div>
            <span>{t.footerCopyright || "© 2026 FINORA • Citizen Scheme & Loan Guide"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
