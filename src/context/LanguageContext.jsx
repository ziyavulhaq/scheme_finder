import React, { createContext, useContext, useState, useEffect } from "react";
import { TRANSLATIONS } from "../data/translations";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("mosje_lang") || "en";
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    localStorage.setItem("mosje_lang", lang);
  }, [lang]);

  // Translation helper supporting both t("key") and t.key
  const langDict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const tFn = (key, params = {}) => {
    if (!key) return "";
    let text = langDict[key] || TRANSLATIONS.en[key] || key;

    // Replace any interpolated parameters like {savings}
    if (params && typeof params === "object") {
      Object.keys(params).forEach(p => {
        text = text.replace(new RegExp(`\\{${p}\\}`, "g"), params[p]);
      });
    }

    return text;
  };

  const t = new Proxy(tFn, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return langDict[prop] || TRANSLATIONS.en[prop] || "";
    }
  });

  // Text-To-Speech function for Low-Literacy Beneficiaries
  const speak = (textToSpeak) => {
    if (!("speechSynthesis" in window)) {
      alert("Audio narration is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Map selected language to TTS voice code
    const langCodeMap = {
      en: "en-IN",
      hi: "hi-IN",
      ta: "ta-IN",
      te: "te-IN",
      kn: "kn-IN"
    };
    utterance.lang = langCodeMap[lang] || "en-IN";
    utterance.rate = 0.9; // Slightly slower for clear rural comprehension

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, speak, stopSpeech, isSpeaking }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
