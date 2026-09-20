/**
 * NSFDC Statutory Document Requirements Per Scheme
 * 
 * Verified against:
 * 1. NSFDC Eligibility Requirements (https://nsfdc.nic.in/eligibility-requirements)
 * 2. NSFDC How to Apply (https://nsfdc.nic.in/how-to-apply-2)
 * 3. NSFDC Term Loan Application Form (https://nsfdc.nic.in/storage/uploads-file/media/20260114_092056_9DWIVL.pdf)
 * 4. NSFDC Education Loan Application Form (https://nsfdc.nic.in/storage/uploads-file/media/20260114_092157_GN3YdZ.pdf)
 */

export const COMMON_DOCUMENTS = [
  {
    id: "caste",
    title: "Scheduled Caste (SC) Community Certificate",
    desc: "Legally valid certificate issued by competent revenue authority (Tahsildar / Sub-Divisional Magistrate).",
    issuer: "State Revenue Department / e-District",
    tip: "Digital certificate with verifiable QR code or DigiLocker copy is preferred by SCAs.",
    mandatory: true,
    slotType: "caste"
  },
  {
    id: "income",
    title: "Annual Family Income Certificate (≤ ₹5,00,000)",
    desc: "Proof that total family income from all sources does not exceed ₹5.00 Lakhs per annum.",
    issuer: "Tahsildar / Revenue Inspector / VAO",
    tip: "Must be valid for current financial year (effective Jan 7, 2026 MoSJE uniform limit).",
    mandatory: true,
    slotType: "income"
  },
  {
    id: "aadhaar",
    title: "Aadhaar Card / Government Photo ID",
    desc: "Identity & residential address proof linked with active mobile number for branch processing.",
    issuer: "UIDAI / Election Commission / Govt of India",
    tip: "Ensure name spelling matches your School/Caste certificate exactly.",
    mandatory: true,
    slotType: "aadhaar"
  },
  {
    id: "photo",
    title: "Recent Passport-size Photographs (3 copies)",
    desc: "Color photographs with white/light background for physical branch files.",
    issuer: "Applicant",
    tip: "Keep at least 3 identical copies ready for the physical loan docket.",
    mandatory: true,
    slotType: "photo"
  },
  {
    id: "bankPassbook",
    title: "Savings Bank Account Passbook / Statement",
    desc: "Showing active account number, applicant name as primary holder, and branch IFSC code.",
    issuer: "Any Scheduled Commercial / Rural Bank",
    tip: "Must be in the applicant's name and KYC-compliant at an NSFDC channel partner bank.",
    mandatory: true,
    slotType: "bankPassbook"
  }
];

export const MICRO_AND_TERM_DOCUMENTS = [
  {
    id: "projectReport",
    title: "Project Report / Business Plan Proposal",
    desc: "Profile of proposed trade/enterprise, capital cost, expected monthly revenue, and operating expenses.",
    issuer: "Applicant / Technical Consultant",
    tip: "For Micro Credit: basic self-drafted 1-page plan. For Term Loans: Detailed Project Report (DPR).",
    mandatory: true,
    slotType: "projectReport"
  },
  {
    id: "quotation",
    title: "Cost Estimate / Machinery Quotation",
    desc: "Formal price quotation from authorized dealer/vendor for machinery, vehicle, or initial inventory.",
    issuer: "Authorized Vendor / Equipment Supplier",
    tip: "Must include vendor GSTIN, model details, unit cost, and total taxes.",
    mandatory: true,
    slotType: "quotation"
  }
];

export const EDUCATION_LOAN_DOCUMENTS = [
  {
    id: "admission",
    title: "Admission Offer / Selection Letter",
    desc: "Proof of secured admission to a recognized professional/technical course (in India or abroad).",
    issuer: "Recognized College / University / Institute",
    tip: "Must state degree/diploma name, department, and academic session.",
    mandatory: true,
    slotType: "admission"
  },
  {
    id: "feeStructure",
    title: "Fee Structure / Course Cost Breakdown",
    desc: "Official institutional fee schedule detailing tuition, lab, library, exam, and hostel charges.",
    issuer: "Institution Finance / Registrar Office",
    tip: "Must cover the entire duration of the course to sanction the full 90% loan component.",
    mandatory: true,
    slotType: "feeStructure"
  },
  {
    id: "marksheet",
    title: "Academic Records / Mark Sheets",
    desc: "Statement of marks of qualifying examinations (Class 10th, 12th, or undergraduate degree).",
    issuer: "State / Central Examination Board / University",
    tip: "Carry attested copies along with original mark sheets during branch verification.",
    mandatory: true,
    slotType: "marksheet"
  }
];

export function getSchemeDocumentChecklist(schemeInput) {
  let schemeId = "micro";
  let schemeName = "Micro Finance Scheme";
  let maxCost = 140000;

  if (typeof schemeInput === "string") {
    schemeId = schemeInput.toLowerCase();
  } else if (schemeInput && typeof schemeInput === "object") {
    schemeId = (schemeInput.id || schemeInput.category || "micro").toLowerCase();
    schemeName = schemeInput.name || schemeInput.title || schemeName;
    maxCost = schemeInput.maxCost || schemeInput.maxLoan || maxCost;
  }

  const isEdu = schemeId.includes("edu") || schemeId.includes("els");
  const isTerm = schemeId.includes("term") || schemeId.includes("tl") || schemeId.includes("suy");

  if (isEdu) {
    return {
      schemeId: "education",
      schemeName: "Education Loan Scheme",
      category: "Education Loan",
      documents: [...COMMON_DOCUMENTS, ...EDUCATION_LOAN_DOCUMENTS]
    };
  } else if (isTerm) {
    return {
      schemeId: "term",
      schemeName: "Term Loan Scheme",
      category: "Term Loan",
      documents: [...COMMON_DOCUMENTS, ...MICRO_AND_TERM_DOCUMENTS]
    };
  } else {
    return {
      schemeId: "micro",
      schemeName: "Micro Finance Scheme",
      category: "Micro Finance",
      documents: [...COMMON_DOCUMENTS, ...MICRO_AND_TERM_DOCUMENTS]
    };
  }
}
