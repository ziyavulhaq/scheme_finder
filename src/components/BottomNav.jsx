import React from "react";
import { Compass, Calculator, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const BottomNav = ({ activeSection, onNavigate }) => {
  const { t } = useLanguage();

  const navItems = [
    {
      id: "recommend",
      label: t.navHome || "Find Scheme",
      icon: Compass
    },
    {
      id: "calculate",
      label: t.navCalculator || "Calculate EMI",
      icon: Calculator
    },
    {
      id: "locate",
      label: t.navLocator || "Find Nearby Bank",
      icon: MapPin
    }
  ];

  return (
    <nav 
      aria-label="Main Navigation"
      className="sticky bottom-0 z-40 bg-[#1F3A5F] border-t-2 border-[#E8A33D] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] py-2.5 px-4 sm:px-8 backdrop-blur-md"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (onNavigate) onNavigate(item.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                isActive
                  ? "bg-[#E8A33D] text-[#1F3A5F] shadow-md scale-105"
                  : "text-[#F1ECE0] hover:bg-[#172D4A] hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-[#1F3A5F]" : "text-[#E8A33D]"}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
