export const MANDATORY_DOCUMENTS = [
  {
    id: "caste",
    title: "SC Caste Community Certificate",
    subtitle: "Issued by Tahsildar / Revenue Authority",
    description: "Proof of Scheduled Caste category with government stamp or digital QR code.",
    tip: "Digital certificate from e-District or DigiLocker is readily accepted.",
    icon: "shield-checkmark",
    required: true
  },
  {
    id: "income",
    title: "Income Certificate (≤ ₹5.00 Lakhs/yr)",
    subtitle: "Issued by VAO / Tahsildar / Revenue Inspector",
    description: "Family income from all sources must not exceed ₹5,00,000 annually.",
    tip: "Ensure certificate is issued for the current financial year.",
    icon: "cash",
    required: true
  },
  {
    id: "aadhaar",
    title: "Aadhaar Card (Linked with Mobile)",
    subtitle: "Identity and Address Verification",
    description: "Original photo ID card for biometric and OTP verification at branch.",
    tip: "Spelling of name should match your school/caste certificate.",
    icon: "card",
    required: true
  },
  {
    id: "photo",
    title: "Passport-size Photographs (3 Copies)",
    subtitle: "Recent Color Photographs",
    description: "Passport photographs with plain white or light background.",
    tip: "Required for physical loan application docket and passbook.",
    icon: "image",
    required: true
  },
  {
    id: "passbook",
    title: "Bank Account Passbook / Statement",
    subtitle: "Active Savings Account",
    description: "Passbook copy showing Account Number, IFSC code, and branch address.",
    tip: "Must be in the primary applicant's name at any nationalized or rural bank.",
    icon: "book",
    required: true
  }
];

export const SCHEME_SPECIFIC_DOCUMENTS = {
  micro: [
    {
      id: "business_quotation",
      title: "Cost Estimate / Trade Quotation",
      subtitle: "For tools, raw materials, or stock",
      description: "Simple proforma invoice or estimate letter from seller/vendor for goods being purchased.",
      icon: "receipt"
    },
    {
      id: "trade_proof",
      title: "Shop / Vending Proof (Optional)",
      subtitle: "Trade license or Municipal vending card",
      description: "Any existing electricity bill, vendor ID, or local body permission.",
      icon: "storefront"
    }
  ],
  term: [
    {
      id: "project_report",
      title: "Detailed Project Report (DPR)",
      subtitle: "For projects above ₹1.4 Lakhs",
      description: "Summary of machinery, project cost, projected monthly revenue, and working capital needs.",
      icon: "document-attach"
    },
    {
      id: "machinery_quotation",
      title: "Machinery / Equipment Quotations",
      subtitle: "From certified suppliers",
      description: "Competitive price quotes for plant, machinery, or commercial vehicle.",
      icon: "construct"
    }
  ],
  education: [
    {
      id: "admission_letter",
      title: "College / University Admission Letter",
      subtitle: "Confirmed seat allotment",
      description: "Proof of selection into recognized technical, medical, or degree course.",
      icon: "school"
    },
    {
      id: "fee_structure",
      title: "Official College Fee Breakdown",
      subtitle: "Tuition, hostel & exam fees",
      description: "Issued by college on official letterhead covering entire course duration.",
      icon: "list"
    },
    {
      id: "marksheet",
      title: "10th, 12th & Previous Marksheets",
      subtitle: "Academic eligibility proof",
      description: "Attested copies of previous educational certificates.",
      icon: "medal"
    }
  ],
  aajeevika: [
    {
      id: "shg_record",
      title: "Self-Help Group (SHG) Passbook",
      subtitle: "For micro credit via NBFC",
      description: "Record of group membership or previous loan repayment history.",
      icon: "people"
    }
  ]
};
