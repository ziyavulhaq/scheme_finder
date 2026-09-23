import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Lock, Phone, User, ShieldCheck, ArrowRight, Eye, EyeOff, CheckCircle2, Sparkles, Building2 } from "lucide-react";

export const AuthPage = () => {
  const { login, register, demoLogin, authError, setAuthError } = useAuth();
  const { t } = useLanguage();

  const [tab, setTab] = useState("login"); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regState, setRegState] = useState("Tamil Nadu");
  const [regCategory, setRegCategory] = useState("Scheduled Caste (SC)");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [formValidationMsg, setFormValidationMsg] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormValidationMsg("");
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setFormValidationMsg("Please enter both your mobile number and password.");
      return;
    }
    setSubmitting(true);
    const res = await login(loginIdentifier.trim(), loginPassword.trim());
    setSubmitting(false);
    if (!res.success) {
      setFormValidationMsg(res.error || "Login failed");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormValidationMsg("");
    if (!regName.trim()) {
      setFormValidationMsg("Please enter your full name.");
      return;
    }
    const cleanPhone = regPhone.trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setFormValidationMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (regPassword.length < 6) {
      setFormValidationMsg("Password must be at least 6 characters.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setFormValidationMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setSubmitting(true);
    const res = await register({
      name: regName.trim(),
      phone: cleanPhone,
      email: regEmail.trim(),
      state: regState,
      casteCategory: regCategory,
      password: regPassword
    });
    setSubmitting(false);
    if (!res.success) {
      setFormValidationMsg(res.error || "Registration failed");
    }
  };

  const handleQuickDemoLogin = async () => {
    setFormValidationMsg("");
    setSubmitting(true);
    await demoLogin();
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="max-w-md w-full mx-auto text-center">
        <div className="inline-flex items-center justify-center h-16 px-3 py-1.5 rounded-2xl bg-white border border-[#D8D2C4] shadow-md mb-3">
          <img src="/logo.png" alt="FINORA Logo" className="h-full w-auto object-contain" />
        </div>
        <h1 className="font-serif font-bold text-3xl text-[#1F3A5F] tracking-tight">
          FINORA
        </h1>
        <p className="text-xs font-semibold text-[#6B6558] uppercase tracking-wider mt-1">
          Citizen Low-Interest Loan &amp; Scheme Portal
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-6 bg-white border border-[#D8D2C4] rounded-2xl shadow-md overflow-hidden">
        {/* Navigation Tabs: Sign In / Create Account */}
        <div className="grid grid-cols-2 border-b border-[#D8D2C4] bg-[#FBF9F4]/70">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setFormValidationMsg("");
              setAuthError("");
            }}
            className={`py-3.5 text-xs font-bold transition flex items-center justify-center gap-2 ${
              tab === "login"
                ? "bg-white text-[#1F3A5F] border-b-2 border-[#1F3A5F]"
                : "text-[#6B6558] hover:text-[#1F3A5F] hover:bg-[#F1ECE0]/50"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setFormValidationMsg("");
              setAuthError("");
            }}
            className={`py-3.5 text-xs font-bold transition flex items-center justify-center gap-2 ${
              tab === "register"
                ? "bg-white text-[#1F3A5F] border-b-2 border-[#1F3A5F]"
                : "text-[#6B6558] hover:text-[#1F3A5F] hover:bg-[#F1ECE0]/50"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* Validation / Auth Error Alert */}
          {(formValidationMsg || authError) && (
            <div className="mb-5 p-3 rounded-lg bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] text-xs flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>{formValidationMsg || authError}</span>
            </div>
          )}

          {tab === "login" ? (
            /* ================= SIGN IN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1F3A5F] mb-1">
                  Mobile Number or Email
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#6B6558] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FBF9F4] border border-[#D8D2C4] rounded-lg text-[#2B2A28] focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3A5F] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B6558] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#FBF9F4] border border-[#D8D2C4] rounded-lg text-[#2B2A28] focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6558] hover:text-[#1F3A5F]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 bg-[#1F3A5F] text-white text-xs font-bold rounded-lg hover:bg-[#152842] transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#D8D2C4]"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2 text-[#6B6558] font-semibold">Or Quick Demo</span>
                </div>
              </div>

              {/* 1-Click Demo Login Button */}
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={submitting}
                className="w-full py-2.5 px-3 bg-[#EBF2FA] border border-[#1F3A5F]/20 text-[#1F3A5F] text-xs font-bold rounded-lg hover:bg-[#d9e8f7] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B97A1C]" />
                <span>1-Click Demo Login (Ramesh Kumar - SC Beneficiary)</span>
              </button>
            </form>
          ) : (
            /* ================= CREATE ACCOUNT FORM ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1F3A5F] mb-1">
                  Full Name (as in Aadhaar)
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 text-xs bg-[#FBF9F4] border border-[#D8D2C4] rounded-lg text-[#2B2A28] focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3A5F] mb-1">
                  10-Digit Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 text-xs bg-[#FBF9F4] border border-[#D8D2C4] rounded-lg text-[#2B2A28] focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F3A5F] mb-1">
                    State / UT
                  </label>
                  <select
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[#FBF9F4] border border-[#D8D2C4] rounded-lg text-[#2B2A28] focus:outline-none focus:border-[#1F3A5F]"
                  >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Bihar">Bihar</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F3A5F] mb-1">
                    Community Category
                  </label>
                  <select
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[#FBF9F4] border border-[#D8D2C4] rounded-lg text-[#2B2A28] focus:outline-none focus:border-[#1F3A5F]"
                  >
                    <option value="Scheduled Caste (SC)">Scheduled Caste (SC)</option>
                    <option value="Other">Other Category</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3A5F] mb-1">
                  Create Password (min. 6 chars)
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-3 py-2 text-xs bg-[#FBF9F4] border border-[#D8D2C4] rounded-lg text-[#2B2A28] focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3A5F] mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 text-xs bg-[#FBF9F4] border border-[#D8D2C4] rounded-lg text-[#2B2A28] focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 bg-[#3B6E52] text-white text-xs font-bold rounded-lg hover:bg-[#2d553f] transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account &amp; Proceed</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-[#8C827A] space-y-1">
        <p>© FINORA • Low-interest concessional credit guidance</p>
      </div>
    </div>
  );
};
