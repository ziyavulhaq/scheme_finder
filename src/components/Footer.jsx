import React from "react";
import { useLanguage } from "../context/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#F1ECE0] border-t border-[#D8D2C4] py-6 px-4 sm:px-8 text-xs text-[#6B6558] w-full overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-[#6B6558] text-center sm:text-left">
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
    </footer>
  );
};
