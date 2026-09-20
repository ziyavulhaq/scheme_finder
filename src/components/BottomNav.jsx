import React from "react";
import { Compass, Calculator, FileCheck, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const BottomNav = ({ activeSection, onNavigate }) => {
  const { t } = useLanguage();

  const cleanLabel = (text, fallback) => {
    if (!text || typeof text !== "string") return fallback;
    const stripped = text.replace(/^\d+[\.\s\-]+\s*/, "").trim();
    // Normalize "Find Nearby Bank(s)" to concise "Nearby Banks"
    return stripped.replace(/^Find\s+Nearby\s+Bank(s)?/i, "Nearby Banks");
  };

  const navItems = [
    {
      id: "recommend",
      label: cleanLabel(t.navHome, "Find Scheme"),
      icon: Compass
    },
    {
      id: "calculate",
      label: cleanLabel(t.navCalculator, "Calculate EMI"),
      icon: Calculator
    },
    {
      id: "documents",
      label: cleanLabel(t.navDocuments || t.navDocs, "Verify Docs"),
      icon: FileCheck,
      isHighlighted: true
    },
    {
      id: "locate",
      label: cleanLabel(t.navLocator, "Nearby Banks"),
      icon: MapPin
    }
  ];

  return (
    <nav 
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 w-full bg-[#1F3A5F] border-t-2 border-[#E8A33D] shadow-[0_-4px_25px_rgba(0,0,0,0.25)] py-2 px-2 sm:px-6 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="w-full max-w-2xl mx-auto grid grid-cols-4 gap-1.5 sm:gap-3 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isDocs = item.isHighlighted;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (onNavigate) onNavigate(item.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`group relative min-w-0 flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 sm:px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isDocs
                  ? isActive
                    ? "bg-[#E8A33D] text-[#1F3A5F] font-bold shadow-lg ring-2 ring-white scale-105"
                    : "bg-[#E8A33D] hover:bg-[#F2B04D] text-[#1F3A5F] font-bold shadow-md hover:scale-[1.02]"
                  : isActive
                    ? "bg-white/15 text-[#E8A33D] font-bold border border-white/20 shadow-xs scale-105"
                    : "text-[#F1ECE0]/85 hover:text-white hover:bg-white/10 font-medium"
              }`}
              title={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon 
                className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform duration-200 ${
                  isDocs
                    ? "text-[#1F3A5F] group-hover:scale-110"
                    : isActive
                      ? "text-[#E8A33D] scale-110"
                      : "text-[#E8A33D] group-hover:scale-110"
                }`} 
              />
              <span className={`text-[10px] sm:text-xs leading-tight text-center mt-0.5 max-w-full truncate px-0.5 ${
                isDocs ? "text-[#1F3A5F] font-extrabold" : ""
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
