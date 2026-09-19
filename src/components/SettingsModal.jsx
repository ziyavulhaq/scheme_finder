import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  X,
  User,
  Camera,
  Check,
  Globe,
  Volume2,
  VolumeX,
  LogOut,
  Sparkles,
  Edit3,
  Shield,
  Save
} from "lucide-react";

export const SettingsModal = ({ isOpen, onClose, activeSection }) => {
  if (!isOpen) return null;

  const { user, updateProfile, logout } = useAuth();
  const { lang, setLang, t, speak, stopSpeech, isSpeaking } = useLanguage();

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImage || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const fileInputRef = useRef(null);

  // Available languages
  const languageOptions = [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi", native: "हिन्दी" },
    { code: "ta", label: "Tamil", native: "தமிழ்" },
    { code: "te", label: "Telugu", native: "తెలుగు" },
    { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
    { code: "ml", label: "Malayalam", native: "മലയാളം" }
  ];

  const speechGuides = {
    ta: {
      recommend: "திட்டம் கண்டறியும் பகுதிக்கு நல்வரவு. உங்களுக்கான அரசு சலுகைக் கடனை அறிய 4 எளிய கேள்விகளுக்குப் பதிலளிக்கவும்.",
      calculate: "மாதாந்திர தவணை கணக்கீட்டுப் பகுதிக்கு நல்வரவு. திட்டச் செலவு மற்றும் கால அளவைத் தேர்வு செய்து உங்கள் மாத தவணை மற்றும் வட்டி சேமிப்பை அறியவும்.",
      locate: "அருகிலுள்ள வங்கி கிளை தேடலுக்கு நல்வரவு. உங்கள் ஊர் அல்லது அஞ்சல் குறியீட்டைத் தட்டச்சு செய்து அருகிலுள்ள வங்கிக் கிளையைக் கண்டறியவும்.",
      default: "சகாயசேதுவிற்கு நல்வரவு. உங்களுக்கான அரசு சலுகைக் கடன் திட்டத்தை அறியவும், மாதாந்திர தவணையை கணக்கிடவும், மற்றும் அருகிலுள்ள வங்கிக் கிளையைக் கண்டறியவும்."
    },
    hi: {
      recommend: "योजना खोजें में आपका स्वागत है। अपनी सरकारी कम ब्याज ऋण योजना जानने के लिए 4 आसान सवालों के जवाब दें।",
      calculate: "मासिक किस्त यानी ईएमआई कैलकुलेटर में आपका स्वागत है। अपनी परियोजना लागत और समय चुनकर अपनी मासिक किस्त और ब्याज बचत देखें।",
      locate: "नजदीकी अधिकृत बैंक शाखा खोज में आपका स्वागत है। अपना शहर या पिन कोड लिखकर नजदीकी बैंक शाखा खोजें।",
      default: "सहायसेतु में आपका स्वागत है। अपनी सरकारी कम ब्याज ऋण योजना जानने के लिए 4 आसान सवालों के जवाब दें, मासिक किस्त जानें और नजदीकी बैंक शाखा खोजें।"
    },
    te: {
      recommend: "పథకం కనుగొనండి విభాగానికి స్వాగతం. మీ వ్యాపారం లేదా చదువుకు తగిన ప్రభుత్వ రాయితీ రుణాన్ని తెలుసుకోవడానికి 4 సాధారణ ప్రశ్నలకు సమాధానం ఇవ్వండి.",
      calculate: "నెలవారీ వాయిదా కాలిక్యులేటర్‌కు స్వాగతం. మీ ప్రాజెక్ట్ ఖర్చు మరియు కాలపరిమితిని ఎంచుకుని మీ నెలవారీ వాయిదా మరియు వడ్డీ ఆదా వివరాలు చూడండి.",
      locate: "సమీప బ్యాంక్ శాఖ శోధనకు స్వాగతం. మీ నగరం లేదా పిన్‌కోడ్ నమోదు చేసి దరఖాస్తు చేసుకోవడానికి సమీప బ్యాంక్ శాఖను కనుగొనండి.",
      default: "సహాయసేతుకు స్వాగతం. మీ వ్యాపారం లేదా చదువుకు తగిన ప్రభుత్వ రాయితీ రుణాన్ని తెలుసుకోవడానికి 4 సాధారణ ప్రశ్నలకు సమాధానం ఇవ్వండి, నెలవారీ వాయిదా లెక్కించండి మరియు సమీప బ్యాంక్ శాఖను కనుగొనండి."
    },
    kn: {
      recommend: "ಯೋಜನೆ ಹುಡುಕಾಟಕ್ಕೆ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ವ್ಯವಹಾರ ಅಥವಾ ವಿದ್ಯಾಭ್ಯಾಸಕ್ಕೆ ಸೂಕ್ತವಾದ ಸರ್ಕಾರಿ ರಿಯಾಯಿತಿ ಸಾಲವನ್ನು ತಿಳಿಯಲು 4 ಸರಳ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.",
      calculate: "ಮಾಸಿಕ ಕಂತು ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗೆ ಸುಸ್ವಾಗತ. ಯೋಜನಾ ವೆಚ್ಚ ಮತ್ತು ಮರುಪಾವತಿ ಅವಧಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ನಿಮ್ಮ ಮಾಸಿಕ ಕಂತು ಮತ್ತು ಬಡ್ಡಿ ಉಳಿತಾಯವನ್ನು ತಿಳಿಯಿರಿ.",
      locate: "ಹತ್ತಿರದ ಬ್ಯಾಂಕ್ ಶಾಖೆ ಹುಡುಕಾಟಕ್ಕೆ ಸುಸ್ವಾಗತ. ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ನಿಮ್ಮ ನಗರ ಅಥವಾ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ ಹತ್ತಿರದ ಅಧಿಕೃತ ಬ್ಯಾಂಕ್ ಶಾಖೆಯನ್ನು ಹುಡುಕಿ.",
      default: "ಸಹಾಯಸೇತುಗೆ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಸರ್ಕಾರಿ ರಿಯಾಯಿತಿ ಸಾಲ ಯೋಜನೆಯನ್ನು ತಿಳಿಯಲು 4 ಸರಳ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ, ಮಾಸಿಕ ಕಂತು ಲೆಕ್ಕ ಹಾಕಿ ಮತ್ತು ಹತ್ತಿರದ ಬ್ಯಾಂಕ್ ಶಾಖೆಯನ್ನು ಹುಡುಕಿ."
    },
    ml: {
      recommend: "പദ്ധതി കണ്ടെത്തുക എന്ന വിഭാഗത്തിലേക്ക് സ്വാഗതം. സർക്കാർ സബ്‌സിഡി വായ്പ അറിയാൻ 4 ലളിതമായ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക.",
      calculate: "പ്രതിമാസ തവണ (EMI) കാൽക്കുലേറ്ററിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ വായ്പാ തുകയും തിരിച്ചടവ് കാലയളവും നൽകി മാസ തവണയും പലിശ ലാഭവും കാണുക.",
      locate: "അടുത്തുള്ള ബാങ്ക് ശാഖാ തിരയലിലേക്ക് സ്വാഗതം. അപേക്ഷ സമർപ്പിക്കാൻ അടുത്തുള്ള ബാങ്ക് ശാഖ കണ്ടെത്തുക.",
      default: "സഹായസേതുവിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ സർക്കാർ സബ്‌സിഡി വായ്പ അറിയാൻ 4 ലളിതമായ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക, പ്രതിമാസ തവണ കണക്കാക്കുക, അടുത്തുള്ള ബാങ്ക് കണ്ടെത്തുക."
    },
    en: {
      recommend: "Welcome to Find Your Scheme. Answer 4 simple questions about your business or study to find your eligible low-interest government loan.",
      calculate: "Welcome to Monthly Instalment Calculator. Adjust the project cost, interest rate, and repayment time to view your monthly EMI and interest savings.",
      locate: "Welcome to Bank Branch Locator. Type your city, town, or PIN code to find verified government partner branches near you to apply.",
      default: "Welcome to SahayaSetu. Answer 4 simple questions to find your low-interest government loan, calculate your monthly EMI, and find an authorized bank near you."
    }
  };

  // Trigger audio playback
  const handlePlayVoice = (langCode) => {
    setLang(langCode);
    stopSpeech();
    setTimeout(() => {
      const pack = speechGuides[langCode] || speechGuides.en;
      const textToSpeak = pack[activeSection] || pack.default;
      speak(textToSpeak, langCode);
    }, 100);
  };

  // Image upload handler
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read and compress as base64 data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setProfileImagePreview(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setSavingProfile(true);
    setSaveSuccessMsg("");

    const res = await updateProfile({
      name: editName.trim(),
      profileImage: profileImagePreview
    });

    setSavingProfile(false);
    if (res.success) {
      setSaveSuccessMsg("Profile updated successfully!");
      setIsEditingProfile(false);
      setTimeout(() => setSaveSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white border border-[#D8D2C4] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FBF9F4] border-b border-[#D8D2C4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1F3A5F] text-white flex items-center justify-center font-bold text-sm">
              ⚙️
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1F3A5F]">
                Settings &amp; Profile
              </h3>
              <p className="text-[11px] text-[#6B6558]">
                Preferences, language, voice guide &amp; account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B6558] hover:bg-[#F1ECE0] hover:text-[#1F3A5F] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Section 1: User Profile & Photo Upload / Editing */}
          <div className="bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F3A5F] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B97A1C]" />
                <span>Citizen Profile</span>
              </span>
              {!isEditingProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditName(user?.name || "");
                    setProfileImagePreview(user?.profileImage || "");
                    setIsEditingProfile(true);
                  }}
                  className="text-xs font-semibold text-[#1F3A5F] hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="text-xs font-medium text-[#6B6558] hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>

            {saveSuccessMsg && (
              <div className="mb-3 p-2 bg-[#E4EEE7] border border-[#3B6E52]/30 text-[#3B6E52] text-xs rounded-lg flex items-center gap-1.5 font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {!isEditingProfile ? (
              /* View Mode */
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#1F3A5F] bg-[#1F3A5F] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="font-serif font-bold text-base text-[#1F3A5F]">
                    {user?.name || "Citizen Beneficiary"}
                  </div>
                  <div className="text-xs text-[#6B6558] font-mono">
                    📱 {user?.phone} {user?.email ? `• ✉️ ${user.email}` : ""}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E4EEE7] text-[#3B6E52] border border-[#3B6E52]/20">
                      {user?.casteCategory || "Scheduled Caste (SC)"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EBF2FA] text-[#1F3A5F] border border-[#1F3A5F]/20">
                      📍 {user?.state || "Tamil Nadu"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode: Edit Name & Upload Profile Picture */
              <form onSubmit={handleSaveProfile} className="space-y-3.5 pt-1">
                {/* Image Upload Row */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#1F3A5F] bg-[#1F3A5F] text-white flex items-center justify-center font-bold text-xl shrink-0">
                    {profileImagePreview ? (
                      <img src={profileImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>{editName ? editName.charAt(0).toUpperCase() : "U"}</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-[#D8D2C4] text-[#1F3A5F] rounded-lg hover:bg-[#F1ECE0] transition shadow-sm"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#B97A1C]" />
                      <span>Upload Profile Photo</span>
                    </button>
                    <p className="text-[10px] text-[#6B6558] mt-1">
                      PNG or JPG (Max 3MB). Resized automatically.
                    </p>
                  </div>
                </div>

                {/* Name Edit Input */}
                <div>
                  <label className="block text-xs font-bold text-[#1F3A5F] mb-1">
                    Beneficiary Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D8D2C4] rounded-lg text-[#2B2A28] focus:outline-none focus:border-[#1F3A5F]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B6E52] text-white text-xs font-bold rounded-lg hover:bg-[#2d553f] transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingProfile ? "Saving..." : "Save Profile Changes"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section 2: Language Settings */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F3A5F] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#1F3A5F]" />
                <span>Display Language</span>
              </span>
              <span className="text-[11px] text-[#6B6558]">
                Currently: <strong>{languageOptions.find(l => l.code === lang)?.label}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {languageOptions.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLang(opt.code)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    lang === opt.code
                      ? "bg-[#1F3A5F] text-white border-[#1F3A5F] shadow-sm"
                      : "bg-[#FBF9F4] text-[#2B2A28] border-[#D8D2C4] hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold leading-tight">{opt.native}</div>
                    <div className={`text-[10px] ${lang === opt.code ? "text-white/80" : "text-[#6B6558]"}`}>
                      {opt.label}
                    </div>
                  </div>
                  {lang === opt.code && <Check className="w-4 h-4 text-[#E8A33D]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Audio Guide Settings & Voice Controls */}
          <div className="bg-[#F1ECE0]/50 border border-[#D8D2C4] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#1F3A5F] text-white">
                  <Volume2 className="w-4 h-4 text-[#E8A33D]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1F3A5F]">
                    Multilingual Audio Guide
                  </h4>
                  <p className="text-[10px] text-[#6B6558]">
                    Clear spoken instructions for rural &amp; semi-urban citizens
                  </p>
                </div>
              </div>

              {/* Toggle Audio Button */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeech();
                  } else {
                    handlePlayVoice(lang);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  isSpeaking
                    ? "bg-[#B97A1C] text-white animate-pulse"
                    : "bg-[#1F3A5F] text-white hover:bg-[#152842]"
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Play Audio Guide</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick voice trigger pills */}
            <div>
              <span className="text-[10px] font-bold text-[#1F3A5F] block mb-1.5">
                Listen Directly in Any Regional Language:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {languageOptions.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handlePlayVoice(l.code)}
                    className="px-2.5 py-1 bg-white border border-[#D8D2C4] rounded-lg text-xs font-bold text-[#1F3A5F] hover:bg-[#EBF2FA] hover:border-[#1F3A5F] transition cursor-pointer shadow-xs"
                  >
                    🔊 {l.native}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Logout Button */}
          <div className="pt-2 border-t border-[#D8D2C4] flex items-center justify-between">
            <div className="text-[11px] text-[#8C827A]">
              Signed in as <span className="font-semibold text-[#1F3A5F]">{user?.phone}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                stopSpeech();
                logout();
                onClose();
              }}
              className="px-4 py-2 bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] hover:bg-[#FDE8E8] text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
