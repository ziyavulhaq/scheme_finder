import React, { createContext, useContext, useState, useEffect } from "react";
import { TRANSLATIONS } from "../data/translations";
import { apiUrl } from "../utils/apiConfig";

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

  // Store current fallback audio element if playing
  const [audioElement, setAudioElement] = useState(null);

  // Pre-load available voices on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const stopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setAudioElement(null);
    }
    setIsSpeaking(false);
  };

  // Text-To-Speech function supporting Tamil, Kannada, Malayalam, Telugu, Hindi, English
  const speak = (textToSpeak, targetLang) => {
    stopSpeech();

    const activeLangCode = targetLang || lang;
    const langCodeMap = {
      en: "en-IN",
      hi: "hi-IN",
      ta: "ta-IN",
      te: "te-IN",
      kn: "kn-IN",
      ml: "ml-IN"
    };
    const desiredLocale = langCodeMap[activeLangCode] || "en-IN";

    // Play via Web Speech API fallback
    const playSpeechSynthesis = () => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setIsSpeaking(false);
        return;
      }
      try {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = desiredLocale;
        utterance.rate = 0.9;
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const matchedVoice = voices.find(v => 
            v.lang === desiredLocale || 
            v.lang.toLowerCase().replace('_', '-').startsWith(activeLangCode.toLowerCase())
          );
          if (matchedVoice) utterance.voice = matchedVoice;
        }
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        setIsSpeaking(false);
      }
    };

    // Play via high-quality native audio proxy (/api/tts)
    try {
      const cleanText = (textToSpeak || "").slice(0, 250);
      const ttsUrl = apiUrl(`/api/tts?tl=${activeLangCode}&q=${encodeURIComponent(cleanText)}`);
      const audio = new Audio(ttsUrl);
      setAudioElement(audio);

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        setAudioElement(null);
      };
      audio.onerror = (e) => {
        console.warn("Backend TTS playback failed, falling back to Web Speech:", e);
        setAudioElement(null);
        playSpeechSynthesis();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio play prevented or failed, trying speech synthesis:", err);
          setAudioElement(null);
          playSpeechSynthesis();
        });
      }
    } catch (e) {
      playSpeechSynthesis();
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, speak, stopSpeech, isSpeaking }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
