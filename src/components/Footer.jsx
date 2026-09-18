import React from "react";
import { ShieldCheck, Lock, ExternalLink, Phone } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#F1ECE0] border-t border-[#D8D2C4] py-10 px-4 sm:px-8 text-xs text-[#6B6558]">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-[#D8D2C4]">
          {/* Col 1: Mandatory Disclaimers (8 cols) */}
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-2 text-[#1F3A5F] font-serif font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#3B6E52]" />
              <span>{t.footerMoSJE || "Ministry of Social Justice & Empowerment"}</span>
            </div>
            <p className="leading-relaxed">
              {t.footerDisclaimer ||
                "Disclaimer: Concessional interest rates and subsidies are subject to statutory verification of annual family income (≤ ₹5.00 Lakhs) and Caste Certificate by competent government authorities."}
            </p>

            <div className="flex items-center gap-2 text-[#2B2A28] pt-1">
              <Phone className="w-3.5 h-3.5 text-[#1F3A5F]" />
              <span className="font-semibold text-[#1F3A5F]">{t.helpline || "Toll-Free Helpline: 14566"}</span>
            </div>
          </div>

          {/* Col 2: Official Portals (4 cols) */}
          <div className="md:col-span-4 space-y-2">
            <div className="font-semibold text-[#1F3A5F] uppercase text-[11px] tracking-wider">
              {t.officialSource || "Official Apex Portals"}
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a
                  href="https://socialjustice.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1F3A5F] hover:underline flex items-center gap-1"
                >
                  <span>{t.footerDept || "Department of Social Justice & Empowerment • Government of India"}</span>
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

        {/* SIH / Team Credits */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-[#6B6558]">
          <div>
            {t.footerRef || "Built for Smart India Hackathon • Problem Statement 26092 (Ministry of Social Justice and Empowerment)"}
          </div>
          <div className="text-right">
            {t.footerCopyright || "© 2026 SahayaSetu • Smart India Hackathon PS SIH26092"}
          </div>
        </div>
      </div>
    </footer>
  );
};
