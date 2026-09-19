import React, { useEffect, useState, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import QRCode from "qrcode";
import { 
  X, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  UserCheck, 
  FileText, 
  Phone, 
  QrCode as QrIcon 
} from "lucide-react";
import { formatINR } from "../utils/financialMath";

export const ReferralSlipModal = ({ 
  isOpen, 
  onClose, 
  partner, 
  scheme, 
  beneficiary = {
    name: "Murugan S.",
    category: "Scheduled Caste (SC)",
    income: "₹2,40,000 / annum",
    loanRequired: 140000
  } 
}) => {
  const { t } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState("");
  const slipRef = useRef(null);

  // Generate unique Application Referral Reference ID
  const refId = `MoSJE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  useEffect(() => {
    if (isOpen && partner) {
      // Build QR Payload
      const payload = JSON.stringify({
        refId,
        dept: "MoSJE-NSFDC",
        beneficiary: beneficiary.name,
        category: beneficiary.category,
        scheme: scheme ? scheme.code : "NSFDC-MCF",
        partner: partner.name,
        partnerCode: partner.id,
        timestamp: new Date().toISOString()
      });

      QRCode.toDataURL(payload, { width: 140, margin: 1 })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error("QR generation error", err));
    }
  }, [isOpen, partner, scheme]);

  if (!isOpen || !partner) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Top Header (no-print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base">
              {t("slipTitle")}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t("slipPrintBtn")}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Slip Content */}
        <div id="printable-slip" ref={slipRef} className="p-6 sm:p-8 bg-white text-slate-900">
          {/* Official Emblem & Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex justify-center mb-1.5">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center font-black text-xl shadow">
                SS
              </div>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-slate-900">
              SahayaSetu • Citizen Scheme & Loan Guide
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Government Concessional Loan Referral & Branch Checklist
            </p>
            <div className="mt-2 inline-block px-3 py-1 rounded bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider border border-blue-200">
              Bank Visit & Document Checklist Slip
            </div>
          </div>

          {/* Reference Number & QR Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            <div className="sm:col-span-8 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t("slipReferenceId")}
              </span>
              <div className="text-lg font-extrabold text-blue-900 tracking-wider font-mono">
                {refId}
              </div>
              <p className="text-xs text-slate-600">
                Verified Concessional Scheme Recommendation
              </p>
              <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Eligibility Confirmed: Category Criteria Met • Income ≤ ₹5.00L</span>
              </div>
            </div>

            <div className="sm:col-span-4 flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="Application QR Code" 
                  className="w-24 h-24 border border-slate-300 rounded-lg p-1 bg-white shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 bg-slate-200 animate-pulse rounded-lg"></div>
              )}
              <span className="text-[10px] text-slate-500 font-mono mt-1">Scan to Verify</span>
            </div>
          </div>

          {/* Beneficiary and Scheme Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Beneficiary Details
              </span>
              <div className="font-bold text-slate-900 text-sm">{beneficiary.name}</div>
              <div className="text-slate-600">Category: <strong className="text-slate-800">{beneficiary.category}</strong></div>
              <div className="text-slate-600">Annual Family Income: <strong className="text-slate-800">{beneficiary.income}</strong></div>
              <div className="text-slate-600">Financing Support: <strong className="text-emerald-700">90% Concessional</strong></div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recommended Loan Scheme
              </span>
              <div className="font-bold text-blue-900 text-sm">
                {scheme ? scheme.title : "Micro Credit Finance Scheme (MCF)"}
              </div>
              <div className="text-slate-600">Scheme Code: <strong>{scheme ? scheme.code : "NSFDC-MCF"}</strong></div>
              <div className="text-slate-600">Concessional Rate: <strong className="text-emerald-700">{scheme ? scheme.interestRate : 6.5}% p.a.</strong></div>
              <div className="text-slate-600">Moratorium: <strong>{scheme ? scheme.maxMoratoriumMonths : 6} Months Grace</strong></div>
            </div>
          </div>

          {/* Assigned Channel Partner Branch Details */}
          <div className="p-4 rounded-xl border-2 border-blue-900 bg-blue-50/40 mb-6 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {t("slipBranch")}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                {partner.utilizationStatus || (partner.healthStatus ? `${partner.healthStatus} (estimated)` : "Available (estimated)")}
              </span>
            </div>

            <h4 className="text-sm font-extrabold text-slate-900">
              {partner.name}
            </h4>
            <p className="text-slate-700 font-medium">
              {partner.address}
            </p>

            <div className="text-[10px] text-slate-500 bg-amber-50/80 border border-amber-200/60 rounded px-2 py-1">
              ⚠️ <strong>Note:</strong> {partner.institutionLabel || "Eligible partner type — confirm enrollment with branch"}
            </div>

            <div className="pt-2 border-t border-blue-200/80 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Nodal Credit Desk:</span>
                <div className="font-bold text-slate-900">{partner.officer || "Branch Priority Lending Officer"}</div>
              </div>
              <div>
                <span className="text-slate-500">Official Contact:</span>
                <div className="font-bold text-blue-800">{partner.phone || "Branch Helpline / 1800-series"}</div>
              </div>
            </div>
          </div>

          {/* Document Verification Checklist */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
            <h5 className="font-bold text-xs text-slate-900 mb-2 uppercase tracking-wide">
              Mandatory Documents Checklist (Bring Originals + 2 Photocopies)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Original Aadhaar Card</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>SC Caste Certificate (Authorized Tehsildar)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Income Certificate (≤ ₹5.00 Lakhs per annum)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Business Quotation / Machinery Invoice / DPR</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Bank Account Passbook (Active IFSC code)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Passport Size Photos (2 copies)</span>
              </div>
            </div>
          </div>

          {/* Official Signatory Box */}
          <div className="pt-4 border-t border-slate-300 flex justify-between items-end text-[11px] text-slate-500">
            <div>
              <p>Toll-Free Grievance Helpline: <strong>14566</strong></p>
              <p>Portal: <strong>socialjustice.gov.in</strong></p>
            </div>
            <div className="text-right">
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <p className="font-semibold text-slate-800">Authorized Officer Seal & Sign</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (no-print) */}
        <div className="no-print bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
          >
            {t("slipCloseBtn")}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow transition"
          >
            <Printer className="w-4 h-4" />
            <span>{t("slipPrintBtn")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
