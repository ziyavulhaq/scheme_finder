import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { 
  FileCheck, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  HelpCircle,
  Sparkles
} from "lucide-react";

export const DocumentChecklist = () => {
  const { t } = useLanguage();

  const [checkedDocs, setCheckedDocs] = useState({
    aadhaar: true,
    caste: true,
    income: true,
    projectReport: false,
    bankPassbook: true,
    photos: false
  });

  const docs = [
    {
      id: "aadhaar",
      title: "Aadhaar Card (Identity & Address Proof)",
      desc: "Linked with active mobile number for OTP verification during branch processing.",
      issuer: "UIDAI",
      tip: "Ensure name spelling matches your School/Caste certificate exactly."
    },
    {
      id: "caste",
      title: "Scheduled Caste (SC) Certificate",
      desc: "Issued by authorized Revenue Officer (Tehsildar / Sub-Divisional Magistrate).",
      issuer: "State Revenue Dept / e-District",
      tip: "Digital certificate with QR code or DigiLocker verification is preferred."
    },
    {
      id: "income",
      title: "Annual Family Income Certificate (≤ ₹5.00 Lakhs)",
      desc: "Mandatory proof establishing family income within the MoSJE concessional threshold.",
      issuer: "Tahsildar / Village Administrative Officer",
      tip: "Must be valid for current financial year (usually valid for 1-3 years)."
    },
    {
      id: "projectReport",
      title: "Project Proposal / Machinery Quotation",
      desc: "For Micro Credit: basic price quote. For Term Loans: Detailed Project Report (DPR).",
      issuer: "Authorized Vendor / Self-Drafted",
      tip: "Must cover estimated capital cost and expected monthly revenue generation."
    },
    {
      id: "bankPassbook",
      title: "Savings Bank Account Passbook",
      desc: "With applicant name, active account number, and visible IFSC code.",
      issuer: "Any Scheduled Commercial / Rural Bank",
      tip: "Account should be in the applicant's name and KYC-compliant."
    },
    {
      id: "photos",
      title: "Recent Passport Size Photographs (3 copies)",
      desc: "Color photographs with white/light background for physical branch files.",
      issuer: "Applicant",
      tip: "Keep digital copy on phone as well."
    }
  ];

  const totalCount = docs.length;
  const readyCount = Object.values(checkedDocs).filter(Boolean).length;
  const readyPercentage = Math.round((readyCount / totalCount) * 100);

  const toggleDoc = (id) => {
    setCheckedDocs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
          <FileCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Module D • Citizen Readiness Verification</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mandatory Document Readiness Checker
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Ensure you have all necessary papers before visiting your allocated Channel Partner (SCA or Bank) to guarantee zero rejection.
        </p>
      </div>

      {/* Readiness Progress Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Application Readiness Score
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              {readyCount} of {totalCount} Documents Ready ({readyPercentage}%)
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {readyPercentage === 100 
                ? "Excellent! You are 100% prepared to visit the branch." 
                : "Check the missing documents below before submitting your referral slip."}
            </p>
          </div>

          <div className="w-full sm:w-64">
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div 
                className={`h-full transition-all duration-500 ${
                  readyPercentage === 100 ? "bg-emerald-500" : readyPercentage >= 60 ? "bg-blue-600" : "bg-amber-500"
                }`}
                style={{ width: `${readyPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map(doc => {
          const isChecked = checkedDocs[doc.id];
          return (
            <div
              key={doc.id}
              onClick={() => toggleDoc(doc.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-4 shadow-soft hover:shadow-hover ${
                isChecked
                  ? "bg-white border-emerald-300 ring-1 ring-emerald-400/30"
                  : "bg-slate-50/70 border-slate-200 opacity-90"
              }`}
            >
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}} // Handled by parent div
                  className="w-5 h-5 rounded border-slate-300 text-blue-700 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold ${isChecked ? "text-slate-900" : "text-slate-700"}`}>
                    {doc.title}
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {doc.issuer}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {doc.desc}
                </p>

                <div className="mt-2 text-[11px] text-blue-900 bg-blue-50/70 px-2.5 py-1 rounded-lg border border-blue-100 flex items-start gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Tip:</strong> {doc.tip}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
