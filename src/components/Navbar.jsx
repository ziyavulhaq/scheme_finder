import React from "react";
import { Landmark, Compass, Calculator, MapPin, Globe, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const Navbar = ({ activeSection, onNavigate }) => {
  const { lang, setLang, t, speak, stopSpeech, isSpeaking } = useLanguage();

  const scrollTo = (id) => {
    if (onNavigate) onNavigate(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAudioGuide = () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      const speechText = `${t.govTitle || "Ministry of Social Justice and Empowerment"}. ${t.recommenderTitle || "Find the scheme that fits you"}. ${t.recommenderSubtitle || "Answer 4 simple questions to check your statutory entitlement."}`;
      speak(speechText);
    }
  };

  const languages = [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi", native: "हिन्दी" },
    { code: "ta", label: "Tamil", native: "தமிழ்" },
    { code: "te", label: "Telugu", native: "తెలుగు" },
    { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" }
  ];

  return (
    <header className="site-header sticky top-0 z-50 bg-[#FBF9F4]/95 backdrop-blur-md border-b border-[#D8D2C4]">
      {/* Top Ledger Strip */}
      <div className="bg-[#1F3A5F] text-[#FBF9F4] text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#E8A33D] inline-block"></span>
            <span>{t.govTitle || "Ministry of Social Justice & Empowerment • Government of India"}</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-[#F1ECE0]">
            <span className="hidden sm:inline">{t.sihStatement || "SIH Problem Statement 26092"}</span>
            <span className="hidden sm:inline">•</span>

            {/* Audio Guide TTS Button */}
            <button
              onClick={handleAudioGuide}
              title={isSpeaking ? (t.stopAudioNarration || "Stop Audio Guide") : (t.viewAudioNarration || "Listen to Audio Guide")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border transition text-xs font-medium cursor-pointer ${
                isSpeaking 
                  ? "bg-[#B97A1C] text-white border-[#B97A1C] animate-pulse" 
                  : "bg-[#172D4A] text-[#FBF9F4] border-white/20 hover:bg-[#1f3d64]"
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3 h-3 text-white" /> : <Volume2 className="w-3 h-3 text-[#E8A33D]" />}
              <span>{isSpeaking ? (t.audioPlaying || "Speaking...") : (t.audioAssistant || "Audio Guide")}</span>
            </button>

            {/* Language Selector in Top Strip */}
            <div className="flex items-center gap-1.5 bg-[#172D4A] px-2 py-0.5 rounded border border-white/20">
              <Globe className="w-3 h-3 text-[#E8A33D]" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                aria-label="Select Language"
                className="bg-transparent text-[#FBF9F4] text-xs font-medium focus:outline-none cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="text-[#2B2A28] bg-white">
                    {l.native} ({l.label})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand & Nav Row */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => scrollTo("recommend")}
          className="flex items-baseline gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded border border-[#1F3A5F] bg-[#1F3A5F] text-[#FBF9F4] flex items-center justify-center font-serif font-bold text-base shadow-sm">
            S
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-2xl text-[#1F3A5F] tracking-tight">
                SahayaSetu
              </span>
              <span className="text-xs font-medium text-[#6B6558] uppercase tracking-wider hidden md:inline">
                {t.subBrand || "scheme & credit assistant"}
              </span>
            </div>
            <p className="text-[11px] text-[#6B6558] font-mono leading-none mt-0.5">
              {t.refText || "Ref: MoSJE / NSFDC Concessional Channel Credit"}
            </p>
          </div>
        </div>

        {/* Action Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => scrollTo("recommend")}
            className={`px-3 py-2 text-sm font-medium rounded transition flex items-center gap-1.5 ${
              activeSection === "recommend"
                ? "bg-[#1F3A5F] text-white shadow-sm"
                : "text-[#2B2A28] hover:bg-[#F1ECE0]"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t.navHome || "Find a scheme"}</span>
          </button>

          <button
            onClick={() => scrollTo("calculate")}
            className={`px-3 py-2 text-sm font-medium rounded transition flex items-center gap-1.5 ${
              activeSection === "calculate"
                ? "bg-[#1F3A5F] text-white shadow-sm"
                : "text-[#2B2A28] hover:bg-[#F1ECE0]"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{t.navCalculator || "Calculate EMI"}</span>
          </button>

          <button
            onClick={() => scrollTo("locate")}
            className={`px-3 py-2 text-sm font-medium rounded transition flex items-center gap-1.5 ${
              activeSection === "locate"
                ? "bg-[#1F3A5F] text-white shadow-sm"
                : "text-[#2B2A28] hover:bg-[#F1ECE0]"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{t.navLocator || "Find a partner"}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
