import React, { useState } from "react";
import { Settings, Compass, Calculator, FileCheck, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { SettingsModal } from "./SettingsModal";

export const Navbar = ({ activeSection, onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="site-header sticky top-0 z-40 w-full max-w-full overflow-hidden bg-[#FBF9F4]/95 backdrop-blur-md border-b border-[#D8D2C4]">
        <div className="max-w-5xl mx-auto px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand */}
          <div 
            onClick={() => {
              if (onNavigate) onNavigate("recommend");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="h-10 px-1.5 py-0.5 rounded-lg bg-white border border-[#D8D2C4] shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img 
                src="/logo.png" 
                alt="FINORA Logo" 
                className="h-full w-auto object-contain max-w-[56px]" 
              />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif font-bold text-2xl text-[#1F3A5F] tracking-tight">
                  FINORA
                </span>
                <span className="text-xs font-medium text-[#6B6558] hidden lg:inline">
                  {t.subBrand || "Citizen Loan & Scheme Guide"}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop & Tablet Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <button
              onClick={() => onNavigate("recommend")}
              className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSection === "recommend"
                  ? "bg-[#1F3A5F] text-white shadow-sm"
                  : "text-[#2B2A28] hover:bg-[#F1ECE0]"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Find Scheme</span>
            </button>

            <button
              onClick={() => onNavigate("calculate")}
              className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSection === "calculate"
                  ? "bg-[#1F3A5F] text-white shadow-sm"
                  : "text-[#2B2A28] hover:bg-[#F1ECE0]"
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate EMI</span>
            </button>

            <button
              onClick={() => onNavigate("documents")}
              className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSection === "documents"
                  ? "bg-[#E8A33D] text-[#1F3A5F] shadow-sm"
                  : "text-[#2B2A28] hover:bg-[#F1ECE0]"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Verify Docs</span>
            </button>

            <button
              onClick={() => onNavigate("locate")}
              className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSection === "locate"
                  ? "bg-[#1F3A5F] text-[#E8A33D] shadow-sm ring-2 ring-[#E8A33D]"
                  : "bg-white text-[#1F3A5F] border border-[#D8D2C4] hover:bg-[#F1ECE0]"
              }`}
            >
              <MapPin className="w-4 h-4 text-[#B97A1C]" />
              <span>Nearby Banks</span>
            </button>
          </nav>

          {/* Top-Right Settings Button (Language, Audio Guide, Profile & Logout) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F1ECE0] border border-[#D8D2C4] hover:bg-white hover:border-[#1F3A5F] transition shadow-xs cursor-pointer group"
              title="Settings: Language, Audio Guide, Profile & Logout"
            >
              {/* User Avatar thumbnail */}
              <div className="w-7 h-7 rounded-full overflow-hidden border border-[#1F3A5F] bg-[#1F3A5F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                )}
              </div>

              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-[#1F3A5F] leading-tight group-hover:text-[#3B6E52]">
                  {user?.name ? user.name.split(" ")[0] : "Settings"}
                </div>
                <div className="text-[10px] text-[#6B6558] leading-none">
                  Settings &amp; Audio
                </div>
              </div>

              <Settings className="w-4 h-4 text-[#1F3A5F] ml-0.5 group-hover:rotate-45 transition duration-300" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Strip */}
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto py-1.5 px-3 border-t border-[#D8D2C4]/60 bg-[#F1ECE0]/40 no-scrollbar">
          <button
            onClick={() => onNavigate("recommend")}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeSection === "recommend"
                ? "bg-[#1F3A5F] text-white"
                : "bg-white text-[#6B6558] border border-[#D8D2C4]"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Find Scheme</span>
          </button>

          <button
            onClick={() => onNavigate("calculate")}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeSection === "calculate"
                ? "bg-[#1F3A5F] text-white"
                : "bg-white text-[#6B6558] border border-[#D8D2C4]"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculate EMI</span>
          </button>

          <button
            onClick={() => onNavigate("documents")}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeSection === "documents"
                ? "bg-[#E8A33D] text-[#1F3A5F]"
                : "bg-white text-[#6B6558] border border-[#D8D2C4]"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Verify Docs</span>
          </button>

          <button
            onClick={() => onNavigate("locate")}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeSection === "locate"
                ? "bg-[#1F3A5F] text-[#E8A33D] ring-1 ring-[#E8A33D]"
                : "bg-[#E8A33D]/20 text-[#1F3A5F] border border-[#E8A33D]"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#B97A1C]" />
            <span>Nearby Banks</span>
          </button>
        </div>
      </header>

      {/* Settings Modal containing Profile Edit, Language Settings, Audio Guide, and Logout */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeSection={activeSection}
      />
    </>
  );
};
