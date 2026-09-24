import React, { useState } from "react";
import { Settings, Sparkles } from "lucide-react";
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
              if (onNavigate) onNavigate("landing");
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

          {/* Top-Right Action Buttons: ASK AI & Settings */}
          <div className="flex items-center gap-2">
            {/* ASK AI Button - Left side of settings */}
            <button
              onClick={() => {
                if (onNavigate) onNavigate("ask-ai");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl border transition shadow-xs cursor-pointer font-bold text-xs sm:text-sm ${
                activeSection === "ask-ai"
                  ? "bg-[#1F3A5F] text-[#E8A33D] border-[#1F3A5F] shadow-sm ring-2 ring-[#E8A33D]/40"
                  : "bg-[#E8A33D] hover:bg-[#B97A1C] text-[#1F3A5F] hover:text-white border-[#D8D2C4]"
              }`}
              title="Ask AI: Government Loan Scheme Assistant"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{t.askAiBtn || "ASK AI"}</span>
            </button>

            {/* Settings Button (Language, Audio Guide, Profile & Logout) */}
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
                  {user?.name ? user.name.split(" ")[0] : (t.settingsLabel || "Settings")}
                </div>
                <div className="text-[10px] text-[#6B6558] leading-none">
                  {t.settingsAndAudio || "Settings & Audio"}
                </div>
              </div>

              <Settings className="w-4 h-4 text-[#1F3A5F] ml-0.5 group-hover:rotate-45 transition duration-300" />
            </button>
          </div>
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
