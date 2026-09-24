import React, { useState, useEffect, useRef } from "react";
import { 
  FileCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Camera, 
  Upload, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Lock, 
  HelpCircle, 
  ExternalLink, 
  Sparkles, 
  Save, 
  Eye, 
  Info,
  Calculator,
  MapPin,
  FileText
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getSchemeDocumentChecklist } from "../data/schemeDocuments";
import { 
  analyzeDocumentImage, 
  OCR_CONFIDENCE_THRESHOLD, 
  STATUTORY_INCOME_LIMIT 
} from "../utils/ocrService";
import { createSpecimenFile, SPECIMEN_TYPES } from "../utils/specimenGenerator";

export const DocumentChecklist = ({ 
  initialScheme = null, 
  recommenderIncome = 180000,
  onRouteToCalculator,
  onRouteToLocator,
  onRouteToRecommender
}) => {
  const { t } = useLanguage();

  // Active scheme selection (defaults to initialScheme from Recommender or "micro")
  const [selectedSchemeId, setSelectedSchemeId] = useState(() => {
    if (initialScheme) {
      if (typeof initialScheme === "object") return initialScheme.id || "micro";
      return initialScheme;
    }
    return "micro";
  });

  // Current scheme checklist definition
  const schemeChecklist = getSchemeDocumentChecklist(selectedSchemeId);
  const { schemeName, documents } = schemeChecklist;

  // Analysis State per document ID
  // documentId -> { status: "complete" | "needs_review" | "wrong_type", ... }
  const [docStates, setDocStates] = useState(() => {
    // Load persisted pass/fail status ONLY from localStorage if citizen previously opted to save
    try {
      const saved = localStorage.getItem("sahayasetu_doc_status");
      if (saved) {
        const parsed = JSON.parse(saved);
        const initial = {};
        Object.entries(parsed).forEach(([key, val]) => {
          if (val === true) {
            initial[key] = {
              status: "complete",
              statusLabel: "Looks complete (saved progress)",
              confidence: 90,
              isLegible: true,
              extractedFields: {},
              primaryReason: "Previously marked ready."
            };
          }
        });
        return initial;
      }
    } catch (e) {
      // Ignore storage read errors
    }
    return {};
  });

  // Image previews (stored strictly in ephemeral component state, NEVER uploaded)
  const [imagePreviews, setImagePreviews] = useState({});

  // Loading / processing states per document ID
  const [processingDocs, setProcessingDocs] = useState({});

  // Progress message / stage during OCR
  const [ocrProgressMsg, setOcrProgressMsg] = useState({});

  // Expanded inspection drawer per document ID
  const [expandedDocs, setExpandedDocs] = useState({});

  // Save progress feedback notification
  const [saveNotification, setSaveNotification] = useState(null);

  // Hidden file input references
  const fileInputRefs = useRef({});

  // Calculate Progress
  const totalCount = documents.length;
  const readyCount = documents.filter(doc => docStates[doc.id]?.status === "complete").length;
  const reviewCount = documents.filter(doc => docStates[doc.id]?.status === "needs_review").length;
  const errorCount = documents.filter(doc => docStates[doc.id]?.status === "wrong_type").length;
  const readyPercentage = Math.round((readyCount / totalCount) * 100);

  // Update selected scheme if prop changes
  useEffect(() => {
    if (initialScheme) {
      const id = typeof initialScheme === "object" ? initialScheme.id || "micro" : initialScheme;
      setSelectedSchemeId(id);
    }
  }, [initialScheme]);

  // Run On-Device OCR Analysis for an image
  const processImageFile = async (docId, file) => {
    setProcessingDocs(prev => ({ ...prev, [docId]: true }));
    setOcrProgressMsg(prev => ({ ...prev, [docId]: "Initializing on-device OCR engine..." }));

    // Create local object URL for preview (client-side only)
    const previewUrl = URL.createObjectURL(file);
    setImagePreviews(prev => ({ ...prev, [docId]: previewUrl }));

    try {
      const result = await analyzeDocumentImage({
        imageSource: file,
        expectedSlot: docId,
        recommenderIncome: recommenderIncome,
        onProgress: (m) => {
          if (m.status === "recognizing text") {
            const pct = Math.round((m.progress || 0) * 100);
            setOcrProgressMsg(prev => ({
              ...prev,
              [docId]: `Analyzing text in browser (${pct}%)...`
            }));
          }
        }
      });

      setDocStates(prev => ({
        ...prev,
        [docId]: result
      }));

      // Automatically expand card to show details
      setExpandedDocs(prev => ({ ...prev, [docId]: true }));
    } catch (err) {
      console.error("Client-side OCR processing error:", err);
      setDocStates(prev => ({
        ...prev,
        [docId]: {
          status: "needs_review",
          statusLabel: "Needs review",
          confidence: 0,
          isLegible: false,
          extractedFields: {},
          primaryReason: "Failed to parse document image. Please upload a clear JPG, PNG, or WebP image."
        }
      }));
    } finally {
      setProcessingDocs(prev => ({ ...prev, [docId]: false }));
      setOcrProgressMsg(prev => ({ ...prev, [docId]: "" }));
    }
  };

  // Handle standard user file upload or camera capture
  const handleFileChange = (docId, e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(docId, file);
    }
  };

  // Handle Specimen Generation for instant in-browser test evaluation
  const handleLoadSpecimen = async (docId, specimenType) => {
    setProcessingDocs(prev => ({ ...prev, [docId]: true }));
    setOcrProgressMsg(prev => ({ ...prev, [docId]: "Generating synthetic test specimen..." }));

    try {
      const { file } = await createSpecimenFile(specimenType);
      await processImageFile(docId, file);
    } catch (err) {
      console.error("Specimen generation error:", err);
      setProcessingDocs(prev => ({ ...prev, [docId]: false }));
    }
  };

  // Persist pass/fail checklist status strictly (zero text or images saved)
  const handleSaveProgress = () => {
    try {
      const simpleStatus = {};
      documents.forEach(doc => {
        simpleStatus[doc.id] = docStates[doc.id]?.status === "complete";
      });
      localStorage.setItem("sahayasetu_doc_status", JSON.stringify(simpleStatus));
      setSaveNotification("Checklist status saved to your device. No images or personal text are stored.");
      setTimeout(() => setSaveNotification(null), 4000);
    } catch (err) {
      console.error("Failed to save checklist status:", err);
    }
  };

  // Toggle detail expansion
  const toggleExpand = (docId) => {
    setExpandedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  // Reset a document slot
  const handleResetDoc = (docId) => {
    setDocStates(prev => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
    setImagePreviews(prev => {
      const copy = { ...prev };
      if (copy[docId]) URL.revokeObjectURL(copy[docId]);
      delete copy[docId];
      return copy;
    });
    if (fileInputRefs.current[docId]) {
      fileInputRefs.current[docId].value = "";
    }
  };

  return (
    <div className="py-6 sm:py-8 px-3 sm:px-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden" id="documents">
      {/* Module Title */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#1F3A5F] tracking-tight">
          {t.docVerifierTitle || "Document Readiness & Verification Checker"}
        </h1>
        <p className="mt-2 text-xs sm:text-base text-[#6B6558]">
          {t.docVerifierSub || "Upload or photograph your required certificates for instant completeness & legibility feedback — ensuring zero rejection or return trips at your channel partner bank."}
        </p>
      </div>

      {/* Scheme Selector Pills */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#D8D2C4] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-full">
        <div className="text-xs font-semibold uppercase text-[#6B6558] tracking-wider text-center sm:text-left">
          {t.selectedSchemeChecklist || "Selected Scheme Checklist:"}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSchemeId("micro")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedSchemeId === "micro" || selectedSchemeId === "mcf" || selectedSchemeId === "msy"
                ? "bg-[#1F3A5F] text-white shadow-xs"
                : "bg-[#F1ECE0] text-[#2B2A28] hover:bg-[#E8A33D]/20"
            }`}
          >
            Micro Finance (₹1.40L)
          </button>

          <button
            onClick={() => setSelectedSchemeId("term")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedSchemeId === "term" || selectedSchemeId === "term-loan"
                ? "bg-[#1F3A5F] text-white shadow-xs"
                : "bg-[#F1ECE0] text-[#2B2A28] hover:bg-[#E8A33D]/20"
            }`}
          >
            Term Loan (₹50.00L)
          </button>

          <button
            onClick={() => setSelectedSchemeId("education")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedSchemeId === "education" || selectedSchemeId === "els"
                ? "bg-[#1F3A5F] text-white shadow-xs"
                : "bg-[#F1ECE0] text-[#2B2A28] hover:bg-[#E8A33D]/20"
            }`}
          >
            Education Loan (₹20.00L)
          </button>
        </div>
      </div>

      {/* READINESS PROGRESS SUMMARY CARD */}
      <div className="bg-white rounded-2xl border border-[#D8D2C4] p-5 sm:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6558]">
              {t.selectedSchemeChecklist || "Documents you'll need for the"} {schemeName}
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1F3A5F] mt-1">
              {readyCount} / {totalCount} {t.docsValid || "Documents Valid"}
            </div>
            <p className="text-xs text-[#6B6558] mt-1">
              {readyCount === totalCount
                ? (t.docsAllValid || "All mandatory documents are valid. You are ready to visit the branch.")
                : (t.docsRemaining || `Please upload or photograph the remaining ${totalCount - readyCount} document(s) below.`)}
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2">
            <div className="w-full bg-[#F1ECE0] rounded-full h-3.5 overflow-hidden border border-[#D8D2C4]">
              <div 
                className={`h-full transition-all duration-500 ${
                  readyCount === totalCount 
                    ? "bg-[#3B6E52]" 
                    : readyCount > 0 
                      ? "bg-[#1F3A5F]" 
                      : "bg-[#E8A33D]"
                }`}
                style={{ width: `${(readyCount / totalCount) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-[#6B6558]">
              <span>Valid: <strong className="text-[#3B6E52]">{readyCount}</strong></span>
              <span>Needs Re-upload: <strong className="text-[#B97A1C]">{reviewCount + errorCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Save Progress Button */}
        <div className="mt-4 pt-4 border-t border-[#D8D2C4]/60 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleSaveProgress}
            className="px-3.5 py-1.5 bg-[#F1ECE0] hover:bg-white border border-[#D8D2C4] text-[#1F3A5F] rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5 text-[#3B6E52]" />
            <span>Save Progress to Browser</span>
          </button>

          {saveNotification && (
            <span className="text-xs font-semibold text-[#3B6E52] animate-fade-in">
              ✅ {saveNotification}
            </span>
          )}

        </div>
      </div>



      {/* DOCUMENT CHECKLIST ROWS */}
      <div className="space-y-4">
        {documents.map((doc, index) => {
          const state = docStates[doc.id];
          const isProcessing = processingDocs[doc.id];
          const progressMsg = ocrProgressMsg[doc.id];
          const isExpanded = expandedDocs[doc.id];
          const previewUrl = imagePreviews[doc.id];

          // Status determination
          const status = state?.status;
          const isComplete = status === "complete";
          const isReview = status === "needs_review";
          const isWrongType = status === "wrong_type";

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-xs ${
                isComplete
                  ? "border-[#3B6E52] ring-1 ring-[#3B6E52]/20"
                  : isWrongType
                    ? "border-[#A6412A] ring-1 ring-[#A6412A]/20"
                    : isReview
                      ? "border-[#E8A33D] ring-1 ring-[#E8A33D]/30"
                      : "border-[#D8D2C4] hover:border-[#1F3A5F]/40"
              }`}
            >
              {/* Main Document Row Header */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: Document Info */}
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="mt-0.5 flex-none">
                    {isProcessing ? (
                      <div className="w-6 h-6 border-2 border-[#1F3A5F] border-t-transparent rounded-full animate-spin"></div>
                    ) : isComplete ? (
                      <CheckCircle2 className="w-6 h-6 text-[#3B6E52] fill-[#E4EEE7]" />
                    ) : isWrongType ? (
                      <XCircle className="w-6 h-6 text-[#A6412A] fill-[#F4E3DD]" />
                    ) : isReview ? (
                      <AlertTriangle className="w-6 h-6 text-[#B97A1C] fill-[#FBEBD2]" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-[#D8D2C4] flex items-center justify-center text-xs font-bold text-[#6B6558]">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-serif font-bold text-[#1F3A5F]">
                        {doc.title}
                      </h2>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1ECE0] text-[#6B6558] border border-[#D8D2C4]">
                        {doc.issuer}
                      </span>
                    </div>

                    <p className="text-xs text-[#6B6558] leading-relaxed">
                      {doc.desc}
                    </p>


                    {/* Active Status Badge & Summary Reason */}
                    {state && (
                      <div className="pt-2">
                        {isComplete && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#E4EEE7] text-[#3B6E52] border border-[#3B6E52]/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Valid</span>
                          </div>
                        )}

                        {isReview && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#FBEBD2] text-[#B97A1C] border border-[#B97A1C]/30">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Re-upload Document ({state.shortReason || "Image blurry or info not clear"})</span>
                          </div>
                        )}

                        {isWrongType && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#F4E3DD] text-[#A6412A] border border-[#A6412A]/30">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Re-upload Document (Wrong type)</span>
                          </div>
                        )}

                        {state.primaryReason && (
                          <p className={`text-xs mt-1.5 font-medium ${
                            isComplete ? "text-[#3B6E52]" : isWrongType ? "text-[#A6412A]" : "text-[#B97A1C]"
                          }`}>
                            {state.primaryReason}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Processing message */}
                    {isProcessing && (
                      <div className="text-xs text-[#1F3A5F] font-semibold flex items-center gap-2 pt-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{progressMsg || "Processing on device..."}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions (Camera / Upload / Details) */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#D8D2C4]/60">
                  <div className="flex items-center gap-2">
                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      id={`file-input-${doc.id}`}
                      ref={el => fileInputRefs.current[doc.id] = el}
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleFileChange(doc.id, e)}
                      className="hidden"
                    />

                    {/* Upload / Camera Button */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => fileInputRefs.current[doc.id]?.click()}
                      className="px-3.5 py-2 bg-[#1F3A5F] hover:bg-[#345178] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4 text-[#E8A33D]" />
                      <span>{previewUrl ? "Retake / Re-upload" : "Photo / Upload"}</span>
                    </button>

                    {/* Quick specimen loader for this slot */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleLoadSpecimen(doc.id, doc.slotType || doc.id)}
                      className="px-2.5 py-2 bg-[#F1ECE0] hover:bg-white border border-[#D8D2C4] text-[#1F3A5F] rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer"
                      title="Load sample specimen for testing"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#E8A33D]" />
                      <span className="hidden sm:inline">Sample</span>
                    </button>
                  </div>

                  {/* Expand / Details Toggle */}
                  {state && (
                    <button
                      onClick={() => toggleExpand(doc.id)}
                      className="text-xs text-[#1F3A5F] hover:text-[#B97A1C] font-semibold flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>{isExpanded ? "Hide Details" : "View Inspection"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* EXPANDABLE INSPECTION DRAWER */}
              {isExpanded && state && (
                <div className="bg-[#FBF9F4] border-t border-[#D8D2C4] p-4 sm:p-5 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Left: Document Thumbnail Preview */}
                    {previewUrl && (
                      <div className="md:col-span-4 space-y-1">
                        <span className="font-semibold text-[#1F3A5F] block">
                          Captured Image Preview (On-Device):
                        </span>
                        <div className="rounded-lg overflow-hidden border border-[#D8D2C4] bg-white max-h-48 flex items-center justify-center">
                          <img 
                            src={previewUrl} 
                            alt={doc.title} 
                            className="max-h-48 w-auto object-contain" 
                          />
                        </div>
                        <span className="text-[10px] text-[#6B6558] block">
                          Local memory buffer only. Never transmitted over HTTP.
                        </span>
                      </div>
                    )}

                    {/* Right: Extracted Field Metadata & Cross-Check */}
                    <div className={previewUrl ? "md:col-span-8 space-y-3" : "md:col-span-12 space-y-3"}>
                      <span className="font-bold text-[#1F3A5F] uppercase tracking-wider text-[11px] block">
                        Client-Side OCR Field Extraction &amp; Quality Audit:
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Authority */}
                        <div className="bg-white p-2.5 rounded border border-[#D8D2C4]">
                          <span className="text-[#6B6558] block text-[11px]">Issuing Authority:</span>
                          <span className="font-semibold text-[#2B2A28] text-xs">
                            {state.extractedFields?.authority || "Could not automatically isolate"}
                          </span>
                        </div>

                        {/* Reference Number */}
                        <div className="bg-white p-2.5 rounded border border-[#D8D2C4]">
                          <span className="text-[#6B6558] block text-[11px]">Certificate / ID Number:</span>
                          <span className="font-mono font-bold text-[#1F3A5F] text-xs">
                            {state.extractedFields?.referenceNumber || "Not confirmed via regex"}
                          </span>
                        </div>

                        {/* Issue Date */}
                        <div className="bg-white p-2.5 rounded border border-[#D8D2C4]">
                          <span className="text-[#6B6558] block text-[11px]">Issue Date:</span>
                          <span className="font-semibold text-[#2B2A28] text-xs">
                            {state.extractedFields?.issueDate || "Not confirmed via regex"}
                          </span>
                        </div>

                        {/* Legibility Status */}
                        <div className="bg-white p-2.5 rounded border border-[#D8D2C4]">
                          <span className="text-[#6B6558] block text-[11px]">Legibility Status:</span>
                          <span className={`font-bold text-xs ${
                            state.isLegible ? "text-[#3B6E52]" : "text-[#B97A1C]"
                          }`}>
                            {state.isLegible ? "Valid • Clear & Legible" : "Re-upload: Image is blurry / unclear"}
                          </span>
                        </div>
                      </div>

                      {/* Special Cross-Check Display for Income Certificate */}
                      {doc.id === "income" && (
                        <div className="bg-white p-3 rounded-lg border border-[#D8D2C4] space-y-2">
                          <span className="font-bold text-[#1F3A5F] text-xs block">
                            Cross-Check: Recommender Declaration vs. Certified Amount
                          </span>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-2 bg-[#F1ECE0] rounded">
                              <span className="text-[11px] text-[#6B6558] block">Declared in Recommender:</span>
                              <span className="font-serif font-bold text-[#1F3A5F] text-sm">
                                ₹{Number(recommenderIncome).toLocaleString("en-IN")}
                              </span>
                            </div>

                            <div className={`p-2 rounded ${
                              state.crossCheck?.matches ? "bg-emerald-50" : "bg-amber-50"
                            }`}>
                              <span className="text-[11px] text-[#6B6558] block">OCR Extracted from Certificate:</span>
                              <span className="font-serif font-bold text-sm text-[#2B2A28]">
                                {state.extractedFields?.incomeAmount 
                                  ? `₹${state.extractedFields.incomeAmount.toLocaleString("en-IN")}`
                                  : "Could not isolate exact amount"}
                              </span>
                            </div>
                          </div>

                          {state.crossCheck && (
                            <div className="text-[11px]">
                              {state.crossCheck.matches ? (
                                <span className="text-[#3B6E52] font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Income figure matches recommender declaration and is within ₹5,00,000 limit.</span>
                                </span>
                              ) : (
                                <span className="text-[#B97A1C] font-semibold flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Income disparity detected. Please confirm which figure matches your official documentation.</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Warnings list if any */}
                      {state.warnings && state.warnings.length > 0 && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-[#B97A1C] space-y-1">
                          {state.warnings.map((w, wi) => (
                            <div key={wi} className="flex items-start gap-1.5">
                              <span>•</span>
                              <span>{w}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions: Clear slot */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleResetDoc(doc.id)}
                          className="text-xs text-[#A6412A] hover:underline font-semibold cursor-pointer"
                        >
                          Clear &amp; Re-verify Slot
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Post-Checklist Route Actions */}
      <div className="bg-[#FAF7F0] border border-[#D8D2C4] rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-full">
        <div>
          <h3 className="font-serif font-bold text-base sm:text-lg text-[#1F3A5F]">
            Ready to Take the Next Step?
          </h3>
          <p className="text-xs text-[#6B6558] mt-0.5">
            Calculate your exact monthly repayment with grace period, or locate your nearest authorized bank branch.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {onRouteToCalculator && (
            <button
              onClick={onRouteToCalculator}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#1F3A5F] hover:bg-[#345178] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Calculator className="w-4 h-4 text-[#E8A33D]" />
              <span>{t.calcEmiBtn || "Calculate EMI"}</span>
            </button>
          )}

          {onRouteToLocator && (
            <button
              onClick={onRouteToLocator}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#E8A33D] hover:bg-[#B97A1C] text-[#2B2A28] hover:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <MapPin className="w-4 h-4" />
              <span>{t.locatePartnerBtn || "Find Nearby Bank"}</span>
            </button>
          )}

          {onRouteToRecommender && (
            <button
              onClick={onRouteToRecommender}
              className="w-full sm:w-auto px-3.5 py-2.5 bg-white hover:bg-[#F1ECE0] border border-[#D8D2C4] text-[#1F3A5F] text-xs font-semibold rounded-lg transition cursor-pointer text-center"
            >
              Change Answers
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
