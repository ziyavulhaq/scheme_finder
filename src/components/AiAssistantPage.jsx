import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  History,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  PanelLeftClose,
  PanelLeft,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  Coins
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { apiUrl } from "../utils/apiConfig";
import { SCHEMES } from "../data/schemes";

const SESSIONS_STORAGE_KEY = "finora_ai_chat_sessions";

export const AiAssistantPage = ({ onNavigate, selectedScheme }) => {
  const { lang, t } = useLanguage();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitleInput, setEditTitleInput] = useState("");
  const messagesEndRef = useRef(null);

  // Scheme Context Selection State (allows user to ask about a specific scheme or all schemes)
  const normalizeSchemeId = (rawId) => {
    if (!rawId || rawId === "all") return "all";
    const lower = String(rawId).toLowerCase();
    if (lower === "mcf" || lower === "micro" || lower.includes("mcf") || lower.includes("micro")) return "mcf";
    if (lower === "msy" || lower === "women" || lower.includes("msy") || lower.includes("mahila")) return "msy";
    if (lower === "tl" || lower === "term" || lower.includes("term")) return "tl";
    if (lower === "els" || lower === "education" || lower.includes("education")) return "els";
    if (lower === "gbs" || lower === "green" || lower.includes("green")) return "gbs";
    if (lower === "suy" || lower === "sanitation" || lower.includes("swachhta") || lower.includes("suy")) return "suy";
    return rawId;
  };

  const [activeSchemeId, setActiveSchemeId] = useState(() => {
    if (selectedScheme) {
      return normalizeSchemeId(selectedScheme.id);
    }
    return "all";
  });

  useEffect(() => {
    if (selectedScheme) {
      setActiveSchemeId(normalizeSchemeId(selectedScheme.id));
    }
  }, [selectedScheme]);

  const activeScheme =
    activeSchemeId === "all" ? null : SCHEMES.find((s) => s.id === activeSchemeId) || null;

  // Localized title lookup helper
  const getLocalizedTitle = (s) => {
    if (!s) return "";
    if (lang === "hi" && s.titleHi) return s.titleHi;
    if (lang === "ta" && s.titleTa) return s.titleTa;
    if (lang === "te" && s.titleTe) return s.titleTe;
    if (lang === "kn" && s.titleKn) return s.titleKn;
    if (lang === "ml" && s.titleMl) return s.titleMl;
    return s.title;
  };

  // Load saved chat sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not load stored chat sessions:", e);
    }

    // Default first session if none stored
    createNewSession();
  }, []);

  // Save sessions to localStorage whenever sessions state changes
  const saveSessionsToStorage = (updatedSessions) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (e) {
      console.warn("Could not save chat sessions to localStorage:", e);
    }
  };

  const getGreeting = (l, scheme) => {
    if (scheme) {
      const schemeTitle = getLocalizedTitle(scheme);
      switch (l) {
        case "hi":
          return `नमस्ते! मैं फिनोरा AI सहायक हूँ। आप **${schemeTitle}** (${scheme.interestRate}% वार्षिक ब्याज, 90% सरकारी वित्तपोषण, 10% मार्जिन मनी) के बारे में कोई भी प्रश्न पूछ सकते हैं। जैसे पात्रता, आवश्यक दस्तावेज़, ऋण सीमा या बैंक आवेदन।`;
        case "ta":
          return `வணக்கம்! நான் உங்கள் FINORA AI உதவியாளர். **${schemeTitle}** (${scheme.interestRate}% வட்டி, 90% அரசு உதவி, 10% மார்ஜின்) பற்றிய ஆவணங்கள், தகுதி அல்லது வங்கி விண்ணப்பம் குறித்து கேட்கலாம்.`;
        case "te":
          return `నమస్కారం! నేను మీ FINORA AI సహాయకుడిని. **${schemeTitle}** (${scheme.interestRate}% వడ్డీ, 90% ప్రభుత్వ సహాయం, 10% మార్జిన్ మనీ) గురించి అర్హత, పత్రాలు లేదా బ్యాంక్ దరఖాస్తుపై ఏ ప్రశ్నైనా అడగవచ్చు.`;
        case "kn":
          return `ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ FINORA AI ಸಹಾಯಕ. **${schemeTitle}** (${scheme.interestRate}% ಬಡ್ಡಿ, 90% ಸರ್ಕಾರಿ ನೆರವು, 10% ಮಾರ್ಜಿನ್ ಮನಿ) ಕುರಿತು ಅಗತ್ಯ ದಾಖಲೆಗಳು ಅಥವಾ ಬ್ಯಾಂಕ್ ಅರ್ಜಿ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.`;
        case "ml":
          return `നമസ്കാരം! ഞാൻ നിങ്ങളുടെ FINORA AI സഹായിയാണ്. **${schemeTitle}** (${scheme.interestRate}% പലിശ, 90% സർക്കാർ സഹായം) സംബന്ധിച്ച് ഏത് ചോദ്യവും ചോദിക്കാം.`;
        default:
          return `Hello! I am your FINORA AI Assistant. Ask me anything specifically about **${schemeTitle}** (subsidized interest rate: ${scheme.interestRate}% p.a., up to 90% financing, 10% margin money, grace period: ${scheme.defaultMoratoriumMonths} months), eligibility criteria, required documents, or bank application procedures.`;
      }
    }

    switch (l) {
      case "hi":
        return "नमस्ते! मैं फिनोरा (FINORA) सरकारी ऋण योजना AI सहायक हूँ। आप अनुसूचित जाति (SC) उद्यमियों और छात्रों के लिए रियायती सरकारी ऋण योजनाओं (जैसे माइक्रो फाइनेंस, महिला समृद्धि, टर्म लोन, शिक्षा ऋण), मार्जिन मनी (10%), पात्रता नियमों, या बैंक चैनल पार्टनर आवेदन के बारे में कोई भी प्रश्न पूछ सकते हैं।";
      case "ta":
        return "வணக்கம்! நான் உங்கள் FINORA அரசு கடன் திட்ட AI உதவியாளர். பட்டியல் சாதி (SC) தொழில்முனைவோர் மற்றும் மாணவர்களுக்கான அரசு சலுகைக் கடன்கள் (நுண்கடன், மகிளா சம்ரித்தி, காலக் கடன், கல்விக் கடன்), 10% மார்ஜின் தொகை மற்றும் வங்கி விண்ணப்பம் குறித்து ஏதேனும் கேள்விகள் கேட்கலாம்.";
      case "te":
        return "నమస్కారం! నేను మీ FINORA ప్రభుత్వ రుణ పథక AI సహాయకుడిని. షెడ్యూల్డ్ కులాల (SC) పారిశ్రామికవేత్తలు మరియు విద్యార్థుల కోసం రాయితీ ప్రభుత్వ రుణ పథకాలు (మైక్రో ఫైనాన్స్, మహిళా సమృద్ధి, టర్మ్ లోన్లు, విద్యా రుణాలు), 10% మార్జిన్ మనీ మరియు బ్యాంక్ దరఖాస్తు గురించి ఏ ప్రశ్నైనా అడగవచ్చు.";
      case "kn":
        return "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ FINORA ಸರ್ಕಾರಿ ಸಾಲ ಯೋಜನೆ AI ಸಹಾಯಕ. ಪರಿಶಿಷ್ಟ ಜಾತಿ (SC) ಉದ್ಯಮಿಗಳು ಮತ್ತು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ರಿಯಾಯಿತಿ ಸರ್ಕಾರಿ ಸಾಲ ಯೋಜನೆಗಳು (ಕಿರು ಸಾಲ, ಮಹಿಳಾ ಸಮೃದ್ಧಿ, ಅವಧಿ ಸಾಲ, ಶಿಕ್ಷಣ ಸಾಲ), 10% ಮಾರ್ಜಿನ್ ಮನಿ ಮತ್ತು ಬ್ಯಾಂಕ್ ಅರ್ಜಿ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.";
      case "ml":
        return "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ FINORA സർക്കാർ വായ്പാ പദ്ധതി AI സഹായിയാണ്. പട്ടികജാതി (SC) സംരംഭകർക്കും വിദ്യാർത്ഥികൾക്കുമുള്ള സബ്‌സിഡി വായ്പകൾ, 10% മാർജിൻ മണി, അപേക്ഷാ രീതികൾ എന്നിവ സംബന്ധിച്ച് നിങ്ങൾക്ക് ചോദിക്കാം.";
      default:
        return "Hello! I am your FINORA Government Scheme AI Assistant. Ask me anything about concessional government loan schemes (Micro Finance, Mahila Samriddhi, Term Loans, Education Loans), the 10% margin money rule, eligibility criteria, required documents, or bank application procedures.";
    }
  };

  // Create a brand new chat session
  const createNewSession = (overrideScheme = activeScheme) => {
    const defaultTitle = overrideScheme
      ? `${overrideScheme.code.replace("NSFDC-", "")} Q&A`
      : (t.newConversation || "New Conversation");

    const newSession = {
      id: "session_" + Date.now(),
      title: defaultTitle,
      schemeId: overrideScheme ? overrideScheme.id : "all",
      createdAt: Date.now(),
      messages: [
        {
          role: "assistant",
          content: getGreeting(lang, overrideScheme),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]
    };

    const updated = [newSession, ...sessions];
    saveSessionsToStorage(updated);
    setActiveSessionId(newSession.id);
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isTyping]);

  // Handle switching active scheme
  const handleSelectSchemeContext = (schemeId) => {
    const normalized = normalizeSchemeId(schemeId);
    setActiveSchemeId(normalized);
    const chosenScheme = normalized === "all" ? null : SCHEMES.find((s) => s.id === normalized) || null;

    // Add a system announcement message in the current chat
    if (activeSession) {
      const schemeTitle = chosenScheme ? getLocalizedTitle(chosenScheme) : (lang === "hi" ? "सभी योजनाएं" : "All Schemes");
      const switchNotice = {
        role: "assistant",
        content: chosenScheme
          ? (lang === "hi"
              ? `🎯 **योजना फोकस बदला गया: ${schemeTitle}** (${chosenScheme.interestRate}% ब्याज, ₹${chosenScheme.maxLoan >= 100000 ? `${(chosenScheme.maxLoan / 100000).toFixed(1)} लाख` : chosenScheme.maxLoan} अधिकतम ऋण)। अब आपके सभी प्रश्नों के उत्तर इस योजना के आधार पर दिए जाएंगे।`
              : `🎯 **Scheme context switched to: ${schemeTitle}** (${chosenScheme.interestRate}% interest rate, up to ₹${chosenScheme.maxLoan >= 100000 ? `${(chosenScheme.maxLoan / 100000).toFixed(1)} Lakh` : chosenScheme.maxLoan} loan). Answers to your questions will now be specifically tailored to this scheme.`)
          : (lang === "hi"
              ? `🌐 **फोकस: सभी सरकारी ऋण योजनाएं**। अब आप किसी भी सरकारी योजना के बारे में सामान्य प्रश्न पूछ सकते हैं।`
              : `🌐 **Context: All Government Concessional Schemes**. You can now ask questions about any subsidized scheme.`),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      const updatedMessages = [...(activeSession.messages || []), switchNotice];
      const updatedSessions = sessions.map((s) =>
        s.id === activeSession.id ? { ...s, messages: updatedMessages, updatedAt: Date.now() } : s
      );
      saveSessionsToStorage(updatedSessions);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const userText = input.trim();
    if (!userText || loading || !activeSession) return;

    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { role: "user", content: userText, timestamp: timeString };

    // Determine updated session title if it was default
    let newTitle = activeSession.title;
    if (
      activeSession.title === "New Conversation" ||
      activeSession.title === "नई बातचीत" ||
      activeSession.messages.length <= 1
    ) {
      newTitle = userText.length > 28 ? userText.slice(0, 28) + "..." : userText;
    }

    const updatedMessages = [...activeSession.messages, userMsg];

    // Optimistically update session in state and localStorage
    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id
        ? { ...s, title: newTitle, messages: updatedMessages, updatedAt: Date.now() }
        : s
    );
    saveSessionsToStorage(updatedSessions);

    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      // Build specific scheme context object
      const schemeContext = activeScheme
        ? {
            schemeName: activeScheme.title,
            rate: activeScheme.interestRate,
            moratorium: activeScheme.defaultMoratoriumMonths,
            maxCost: activeScheme.maxLoan,
            category: activeScheme.category,
            reasoning: activeScheme.tagline,
            keyBenefits: activeScheme.keyBenefits,
            documentsRequired: activeScheme.documentsRequired
          }
        : selectedScheme
        ? {
            schemeName: selectedScheme.title || selectedScheme.name,
            rate: selectedScheme.interestRate || selectedScheme.rate,
            moratorium: selectedScheme.defaultMoratoriumMonths || selectedScheme.moratorium,
            maxCost: selectedScheme.maxLoan || selectedScheme.maxCost,
            category: selectedScheme.category,
            reasoning: selectedScheme.tagline || selectedScheme.description
          }
        : {};

      const res = await fetch(apiUrl("/api/assistant/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          context: schemeContext,
          language: lang,
          conversationHistory: updatedMessages.slice(-6)
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const replyContent =
        data.reply ||
        (lang === "hi"
          ? "AI सहायक अस्थायी रूप से अनुपलब्ध है — कृपया थोड़ी देर बाद पुनः प्रयास करें।"
          : "AI assistant is temporarily unavailable — please try again shortly.");

      const assistantMsg = {
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        fallback: data.fallback || false
      };

      const finalSessions = updatedSessions.map((s) =>
        s.id === activeSession.id
          ? { ...s, messages: [...updatedMessages, assistantMsg], updatedAt: Date.now() }
          : s
      );
      saveSessionsToStorage(finalSessions);
    } catch (err) {
      console.warn("AI Assistant chat error:", err);
      const fallbackMsg = {
        role: "assistant",
        content:
          lang === "hi"
            ? "AI सहायक अस्थायी रूप से अनुपलब्ध है — कृपया थोड़ी देर बाद पुनः प्रयास करें।"
            : "AI assistant is temporarily unavailable — please try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        fallback: true
      };

      const finalSessions = updatedSessions.map((s) =>
        s.id === activeSession.id
          ? { ...s, messages: [...updatedMessages, fallbackMsg], updatedAt: Date.now() }
          : s
      );
      saveSessionsToStorage(finalSessions);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  // Rename Chat Session
  const handleStartRename = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitleInput(session.title);
  };

  const handleSaveRename = (e, sessionId) => {
    e.stopPropagation();
    const trimmed = editTitleInput.trim();
    if (!trimmed) {
      setEditingSessionId(null);
      return;
    }

    const updated = sessions.map((s) => (s.id === sessionId ? { ...s, title: trimmed } : s));
    saveSessionsToStorage(updated);
    setEditingSessionId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  // Delete Chat Session
  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      // If deleting the only session, reset it to a clean one
      const fresh = [
        {
          id: "session_" + Date.now(),
          title: t.newConversation || "New Conversation",
          schemeId: activeSchemeId,
          createdAt: Date.now(),
          messages: [
            {
              role: "assistant",
              content: getGreeting(lang, activeScheme),
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
          ]
        }
      ];
      saveSessionsToStorage(fresh);
      setActiveSessionId(fresh[0].id);
      return;
    }

    const filtered = sessions.filter((s) => s.id !== sessionId);
    saveSessionsToStorage(filtered);
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0].id);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-6 py-4 sm:py-6">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#D8D2C4]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate("recommend")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F1ECE0] border border-[#D8D2C4] text-[#1F3A5F] text-xs sm:text-sm font-semibold transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("navHome") || "Back to Schemes"}</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1F3A5F] text-[#E8A33D] flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg sm:text-2xl text-[#1F3A5F] tracking-tight">
                {t.aiPageTitle || "FINORA AI Scheme Assistant"}
              </h1>
              <p className="text-[11px] sm:text-xs text-[#6B6558]">
                {t.aiPageSub ||
                  "Ask questions about government loan schemes, eligibility, margin money, or channel partners."}
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Slide Window button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F1ECE0] border border-[#D8D2C4] text-[#1F3A5F] text-xs font-semibold transition cursor-pointer shadow-2xs"
          title="Toggle Chat History Slide Window"
        >
          {isSidebarOpen ? (
            <>
              <PanelLeftClose className="w-4 h-4 text-[#1F3A5F]" />
              <span className="hidden sm:inline">{t.hideHistory || "Hide History"}</span>
            </>
          ) : (
            <>
              <PanelLeft className="w-4 h-4 text-[#1F3A5F]" />
              <span>
                {t.showHistory || "Chat History"} ({sessions.length})
              </span>
            </>
          )}
        </button>
      </div>

      {/* Main Container with Slide Window + Active Chat */}
      <div className="relative flex rounded-xl border border-[#D8D2C4] bg-white shadow-sm overflow-hidden min-h-[620px] max-h-[820px]">
        {/* SLIDE WINDOW (Saved Chat Sessions Sidebar) */}
        <div
          className={`${
            isSidebarOpen ? "w-72 sm:w-80 border-r border-[#D8D2C4]" : "w-0 overflow-hidden"
          } transition-all duration-300 bg-[#FAF7F0] flex flex-col shrink-0 z-20`}
        >
          {/* Slide Window Header */}
          <div className="p-3 sm:p-4 border-b border-[#D8D2C4] flex items-center justify-between gap-2 bg-[#F1ECE0]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F3A5F] uppercase tracking-wider">
              <History className="w-4 h-4 text-[#1F3A5F]" />
              <span>{lang === "hi" ? "सहेजी गई बातचीत" : "Saved Chat Logs"}</span>
            </div>
            <button
              onClick={() => createNewSession(activeScheme)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1F3A5F] hover:bg-[#345178] text-white text-xs font-semibold transition shadow-2xs cursor-pointer"
              title="Start a new chat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingSessionId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    setActiveSessionId(session.id);
                  }}
                  className={`group relative rounded-lg p-2.5 transition text-left cursor-pointer border ${
                    isActive
                      ? "bg-white border-[#1F3A5F] shadow-xs text-[#1F3A5F]"
                      : "bg-[#FAF7F0] hover:bg-white border-transparent text-[#2B2A28]"
                  }`}
                >
                  {isEditing ? (
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(e, session.id);
                          if (e.key === "Escape") handleCancelRename(e);
                        }}
                        autoFocus
                        className="flex-1 px-2 py-1 text-xs border border-[#1F3A5F] rounded bg-white text-[#2B2A28] focus:outline-none"
                      />
                      <button
                        onClick={(e) => handleSaveRename(e, session.id)}
                        className="p-1 hover:bg-emerald-100 text-[#3B6E52] rounded cursor-pointer"
                        title="Save rename"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 hover:bg-red-100 text-[#A6412A] rounded cursor-pointer"
                        title="Cancel rename"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <MessageSquare
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            isActive ? "text-[#1F3A5F]" : "text-[#6B6558]"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate leading-tight">
                            {session.title || "Conversation"}
                          </p>
                          <span className="text-[10px] text-[#6B6558] block mt-0.5">
                            {new Date(session.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric"
                            })}{" "}
                            • {session.messages?.length || 0} messages
                          </span>
                        </div>
                      </div>

                      {/* Rename and Delete Actions */}
                      <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(e, session)}
                          className="p-1 text-[#6B6558] hover:text-[#1F3A5F] hover:bg-[#F1ECE0] rounded cursor-pointer transition"
                          title="Rename chat log"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(e, session.id)}
                          className="p-1 text-[#6B6558] hover:text-[#A6412A] hover:bg-red-50 rounded cursor-pointer transition"
                          title="Delete chat log"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Slide Window Footer */}
          <div className="p-2.5 border-t border-[#D8D2C4] bg-[#F1ECE0] text-center">
            <span className="text-[10px] text-[#6B6558]">
              {lang === "hi" ? "चैट इतिहास आपके डिवाइस पर सुरक्षित है" : "History saved privately in browser"}
            </span>
          </div>
        </div>

        {/* ACTIVE CHAT WORKSPACE (Right Pane) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFFDF9]">
          {/* Workspace Subheader */}
          <div className="p-3 bg-[#FAF7F0] border-b border-[#D8D2C4] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <h2 className="text-xs sm:text-sm font-bold text-[#1F3A5F] truncate">
                {activeSession?.title || "AI Scheme Assistant"}
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => createNewSession(activeScheme)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-[#F1ECE0] border border-[#D8D2C4] text-[#1F3A5F] text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "नया चैट" : "New Chat"}</span>
              </button>
            </div>
          </div>

          {/* SCHEME SELECTOR RIBBON (Allows User to ask questions specifically based on selected scheme) */}
          <div className="bg-[#FAF7F0] border-b border-[#D8D2C4] px-3 sm:px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0 text-[#1F3A5F] text-[11px] font-bold uppercase tracking-wider">
              <Coins className="w-3.5 h-3.5 text-[#B97A1C]" />
              <span>{lang === "hi" ? "योजना चुनें:" : "Scheme Focus:"}</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
              <button
                onClick={() => handleSelectSchemeContext("all")}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeSchemeId === "all"
                    ? "bg-[#1F3A5F] text-white shadow-xs ring-1 ring-[#1F3A5F]"
                    : "bg-white text-[#6B6558] hover:bg-[#F1ECE0] border border-[#D8D2C4]"
                }`}
              >
                🌐 {lang === "hi" ? "सभी योजनाएं" : "All Schemes"}
              </button>

              {SCHEMES.map((s) => {
                const isSelected = activeSchemeId === s.id;
                const shortCode = s.code.replace("NSFDC-", "");
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSchemeContext(s.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      isSelected
                        ? "bg-[#E8A33D] text-[#1F3A5F] font-bold shadow-xs ring-2 ring-[#1F3A5F]"
                        : "bg-white text-[#2B2A28] hover:bg-[#F1ECE0] border border-[#D8D2C4]"
                    }`}
                    title={getLocalizedTitle(s)}
                  >
                    {shortCode} ({s.interestRate}%)
                  </button>
                );
              })}
            </div>
          </div>

          {/* FOCUSED SCHEME DETAIL HIGHLIGHT BANNER */}
          {activeScheme && (
            <div className="bg-[#EBF2FA] border-b border-[#1F3A5F]/20 px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#1F3A5F]">
                  🎯 {getLocalizedTitle(activeScheme)}
                </span>
                <span className="bg-[#3B6E52] text-white font-bold px-2 py-0.5 rounded text-[10px]">
                  {activeScheme.interestRate}% p.a.
                </span>
                <span className="text-[#6B6558]">
                  Max: ₹
                  {activeScheme.maxLoan >= 100000
                    ? `${(activeScheme.maxLoan / 100000).toFixed(1)}L`
                    : activeScheme.maxLoan}{" "}
                  • Grace: {activeScheme.defaultMoratoriumMonths} Mo • Margin: {activeScheme.ownContributionMin}%
                </span>
              </div>
              <button
                onClick={() => handleSelectSchemeContext("all")}
                className="text-[11px] text-[#B97A1C] hover:underline font-semibold cursor-pointer text-left"
              >
                {lang === "hi" ? "साफ करें" : "Reset Focus"}
              </button>
            </div>
          )}

          {/* Messages Thread Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {activeSession?.messages?.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex gap-3 items-start ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#1F3A5F] text-[#E8A33D] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isUser
                        ? "bg-[#1F3A5F] text-white rounded-tr-none"
                        : msg.fallback
                        ? "bg-[#FBEBD2] border border-[#E8A33D]/50 text-[#2B2A28] rounded-tl-none"
                        : "bg-white border border-[#D8D2C4] text-[#2B2A28] rounded-tl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div
                      className={`text-[10px] mt-1.5 text-right ${
                        isUser ? "text-white/70" : "text-[#6B6558]"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#E8A33D] text-[#1F3A5F] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3 items-start justify-start">
                <div className="w-8 h-8 rounded-full bg-[#1F3A5F] text-[#E8A33D] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-[#D8D2C4] rounded-xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#1F3A5F] animate-bounce"></span>
                  <span className="inline-block w-2 h-2 rounded-full bg-[#1F3A5F] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="inline-block w-2 h-2 rounded-full bg-[#1F3A5F] animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] text-[#6B6558] font-medium ml-1">
                    {lang === "hi"
                      ? "योजना नियमों की समीक्षा हो रही है..."
                      : activeScheme
                      ? `Analyzing ${activeScheme.code} guidelines...`
                      : "Consulting official statutory guidelines..."}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Scheme-Specific Question Suggestions */}
          <div className="px-3 sm:px-4 py-2 bg-[#FBF9F4] border-t border-[#D8D2C4] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold uppercase text-[#6B6558] shrink-0">
              {lang === "hi" ? "सुझाव:" : "Quick Qs:"}
            </span>
            {(activeScheme
              ? [
                  `What documents are required for ${activeScheme.title}?`,
                  `How does the ${activeScheme.ownContributionMin}% margin work?`,
                  `What is the grace period for repayment?`,
                  `Which public sector banks offer this loan?`
                ]
              : [
                  "Can SC applicants get loans up to ₹50 Lakhs?",
                  "What is the family annual income ceiling?",
                  "How does the 10% margin money rule work?",
                  "Which public sector banks disburse concessional loans?"
                ]
            ).map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInput(q);
                }}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-[#F1ECE0] border border-[#D8D2C4] text-[11px] text-[#1F3A5F] whitespace-nowrap transition cursor-pointer shrink-0 shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form at Bottom */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 bg-white border-t border-[#D8D2C4] flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeScheme
                  ? lang === "hi"
                    ? `${getLocalizedTitle(activeScheme)} के बारे में कोई भी प्रश्न पूछें...`
                    : `Ask any question about ${activeScheme.title}...`
                  : lang === "hi"
                  ? "सरकारी ऋण योजनाओं, पात्रता, मार्जिन मनी या आवेदन के बारे में पूछें..."
                  : "Ask any question about government loan schemes, eligibility, margin money, bank channels..."
              }
              disabled={loading}
              className="flex-1 px-4 py-2.5 sm:py-3 bg-[#FAF7F0] border border-[#D8D2C4] rounded-lg text-sm text-[#2B2A28] focus:border-[#1F3A5F] focus:bg-white focus:outline-none transition shadow-2xs disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#1F3A5F] hover:bg-[#345178] disabled:bg-gray-300 text-white font-semibold rounded-lg text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <span>{lang === "hi" ? "पूछें" : "Send"}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Transparency Disclaimer Footer */}
          <div className="px-4 py-2 bg-[#FAF7F0] border-t border-[#D8D2C4]/70 text-[11px] text-[#6B6558] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3B6E52] shrink-0" />
            <span>
              {lang === "hi"
                ? "सलाह: AI केवल सत्यापित सरकारी दिशानिर्देशों के आधार पर सहायता प्रदान करता है। आधिकारिक ऋण स्वीकृति अधिकृत बैंक शाखाओं द्वारा की जाती है।"
                : "Note: AI provides answers based on official statutory guidelines for your selected scheme. Final sanctions are conducted by authorized bank branches."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
