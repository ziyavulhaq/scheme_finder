/**
 * Specimen Document Generator for Browser Testing
 * 
 * Generates synthetic, non-PII certificate images directly on HTML5 Canvas
 * so citizens and evaluators can safely test all OCR scenarios without uploading real documents:
 * 1. Caste Certificate (SC, Tahsildar)
 * 2. Matching Income Certificate (₹1,80,000)
 * 3. Mismatched Income Certificate (₹3,20,000)
 * 4. Aadhaar / Photo ID (UIDAI)
 * 5. Blurry / Unreadable Document (low confidence < 60%)
 * 6. Detailed Project Report / Proposal
 * 7. University Admission Offer Letter
 */

export const SPECIMEN_TYPES = [
  {
    id: "caste",
    label: "Sample Caste Certificate (SC)",
    desc: "Valid format issued by Tehsildar for Scheduled Caste slot",
    slot: "caste"
  },
  {
    id: "income_match",
    label: "Matching Income Certificate (₹1.80L)",
    desc: "Valid format matching ₹1,80,000 recommender input",
    slot: "income"
  },
  {
    id: "income_mismatch",
    label: "Mismatched Income Certificate (₹3.20L)",
    desc: "Valid format with ₹3,20,000 — tests mismatch warning",
    slot: "income"
  },
  {
    id: "aadhaar",
    label: "Sample Aadhaar ID Card",
    desc: "Photo ID card — tests misclassification when put in Caste slot",
    slot: "aadhaar"
  },
  {
    id: "blurry",
    label: "Blurry / Unreadable Document",
    desc: "Deliberately degraded image — tests < 60% confidence legibility warning",
    slot: "caste"
  },
  {
    id: "project",
    label: "Sample Project Report",
    desc: "Business plan & machinery quotation for Term Loan / Micro Finance",
    slot: "projectReport"
  },
  {
    id: "admission",
    label: "Sample Admission Letter",
    desc: "University course allotment letter for Education Loan",
    slot: "admission"
  }
];

export function renderSpecimenToCanvas(type, canvas) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  ctx.filter = "none";

  // Background
  ctx.fillStyle = "#FCFAF6";
  ctx.fillRect(0, 0, width, height);

  // Border frame
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#1F3A5F";
  ctx.strokeRect(20, 20, width - 40, height - 40);

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#B97A1C";
  ctx.strokeRect(26, 26, width - 52, height - 52);

  // Watermark text in background
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.font = "bold 44px sans-serif";
  ctx.fillStyle = "rgba(232, 163, 61, 0.08)";
  ctx.textAlign = "center";
  ctx.fillText("SPECIMEN ONLY • NON-OFFICIAL SAMPLE", 0, 0);
  ctx.restore();

  if (type === "blurry") {
    // Deliberately heavy blur + low contrast
    ctx.filter = "blur(7px)";
    ctx.fillStyle = "#4A4A4A";
    ctx.font = "bold 24px serif";
    ctx.textAlign = "center";
    ctx.fillText("GOVERNMENT REVENUE DEPARTMENT", width / 2, 80);
    ctx.fillText("COMMUNITY / CASTE CERTIFICATE", width / 2, 120);

    ctx.font = "16px serif";
    ctx.textAlign = "left";
    ctx.fillText("Certificate No: TN-BLUR-9999", 50, 180);
    ctx.fillText("Date: 12/04/2025", 50, 210);
    ctx.fillText("This certificate certifies that applicant is eligible.", 50, 260);
    ctx.fillText("Unclear scan under dim lighting for testing.", 50, 290);
    ctx.fillText("Issued by: Office of the Tehsildar", 50, 360);
    return;
  }

  // Header
  ctx.fillStyle = "#1F3A5F";
  ctx.textAlign = "center";

  if (type === "caste") {
    ctx.font = "bold 26px serif";
    ctx.fillText("GOVERNMENT OF TAMIL NADU", width / 2, 75);
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#6B6558";
    ctx.fillText("REVENUE DEPARTMENT • REVENUE ADMINISTRATION", width / 2, 105);

    ctx.fillStyle = "#B97A1C";
    ctx.font = "bold 22px serif";
    ctx.fillText("COMMUNITY / CASTE CERTIFICATE", width / 2, 150);

    ctx.fillStyle = "#2B2A28";
    ctx.font = "15px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Certificate No: TN-2025/REV/88492", 60, 200);
    ctx.fillText("Date of Issue: 14/08/2025", 60, 225);

    ctx.font = "15px serif";
    const bodyText = [
      "This is to certify that Thiru Murugan S, son of Selvam,",
      "residing at Door No. 14, Gandhi Nagar, Town Hall Post,",
      "Coimbatore South Taluk, Coimbatore District, Tamil Nadu,",
      "belongs to the Adi Dravidar Community, which is recognized as a",
      "Scheduled Caste (SC) under the Constitution (Scheduled Castes) Order, 1950",
      "as amended from time to time.",
      "",
      "This certificate is issued for the purpose of availing educational and",
      "concessional loan assistance under NSFDC / State Government schemes."
    ];

    let y = 275;
    bodyText.forEach(line => {
      ctx.fillText(line, 60, y);
      y += 26;
    });

    // Seal & Signature
    ctx.textAlign = "right";
    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#1F3A5F";
    ctx.fillText("Tahsildar", width - 60, height - 120);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#6B6558";
    ctx.fillText("Coimbatore South Taluk", width - 60, height - 98);
    ctx.fillText("Office of the Tehsildar (Seal)", width - 60, height - 76);

  } else if (type === "income_match" || type === "income_mismatch") {
    const isMatch = type === "income_match";
    const incomeVal = isMatch ? "1,80,000" : "3,20,000";
    const incomeWords = isMatch ? "One Lakh Eighty Thousand" : "Three Lakh Twenty Thousand";

    ctx.font = "bold 26px serif";
    ctx.fillText("GOVERNMENT OF TAMIL NADU", width / 2, 75);
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#6B6558";
    ctx.fillText("REVENUE DEPARTMENT • TALUK OFFICE", width / 2, 105);

    ctx.fillStyle = "#3B6E52";
    ctx.font = "bold 22px serif";
    ctx.fillText("ANNUAL FAMILY INCOME CERTIFICATE", width / 2, 150);

    ctx.fillStyle = "#2B2A28";
    ctx.font = "15px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Certificate No: INC-2026/${isMatch ? "83912" : "99411"}`, 60, 200);
    ctx.fillText("Date of Issue: 05/01/2026", 60, 225);

    ctx.font = "15px serif";
    const bodyText = [
      "This is to certify that upon due inquiry and local revenue verification,",
      "the Annual Family Income from all sources of Thiru Murugan S,",
      "residing at 14 Gandhi Nagar, Coimbatore South, Tamil Nadu,",
      `is Rs. ${incomeVal} (Rupees ${incomeWords} only) per annum.`,
      "",
      "This certificate is valid for the Financial Year 2025-2026.",
      "Annual family income is certified within statutory guidelines for",
      "Government subsidized credit and social welfare programs."
    ];

    let y = 275;
    bodyText.forEach(line => {
      if (line.includes(`Rs. ${incomeVal}`)) {
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#1F3A5F";
      } else {
        ctx.font = "15px serif";
        ctx.fillStyle = "#2B2A28";
      }
      ctx.fillText(line, 60, y);
      y += 26;
    });

    // Seal
    ctx.textAlign = "right";
    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#1F3A5F";
    ctx.fillText("Tahsildar", width - 60, height - 120);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#6B6558";
    ctx.fillText("Coimbatore South Taluk", width - 60, height - 98);
    ctx.fillText("Competent Revenue Authority", width - 60, height - 76);

  } else if (type === "aadhaar") {
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("GOVERNMENT OF INDIA", width / 2, 75);
    ctx.fillStyle = "#A6412A";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("UNIQUE IDENTIFICATION AUTHORITY OF INDIA", width / 2, 102);

    ctx.fillStyle = "#B97A1C";
    ctx.font = "bold 20px serif";
    ctx.fillText("AADHAAR • MERA AADHAAR, MERI PEHCHAN", width / 2, 145);

    ctx.fillStyle = "#2B2A28";
    ctx.font = "15px sans-serif";
    ctx.textAlign = "left";

    // Photo Box Placeholder
    ctx.strokeStyle = "#1F3A5F";
    ctx.strokeRect(60, 185, 110, 130);
    ctx.fillStyle = "#F1ECE0";
    ctx.fillRect(60, 185, 110, 130);
    ctx.fillStyle = "#6B6558";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Photo ID", 115, 255);

    ctx.textAlign = "left";
    ctx.fillStyle = "#2B2A28";
    ctx.font = "15px sans-serif";
    ctx.fillText("Name: Murugan Selvam", 195, 210);
    ctx.fillText("DOB: 12/04/1994", 195, 235);
    ctx.fillText("Gender: Male", 195, 260);
    ctx.fillText("Address: 14 Gandhi Nagar, Coimbatore South, TN", 195, 285);

    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "#1F3A5F";
    ctx.textAlign = "center";
    ctx.fillText("Aadhaar No: 5412 8849 1029", width / 2, 375);

    ctx.font = "13px sans-serif";
    ctx.fillStyle = "#6B6558";
    ctx.fillText("Aadhaar is proof of identity, not of citizenship.", width / 2, 410);

  } else if (type === "project") {
    ctx.font = "bold 24px serif";
    ctx.fillText("PROJECT REPORT & CAPITAL COST ESTIMATE", width / 2, 75);
    ctx.fillStyle = "#6B6558";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("MICRO FINANCE / TERM LOAN BUSINESS PROPOSAL", width / 2, 105);

    ctx.fillStyle = "#2B2A28";
    ctx.font = "15px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Reference No: PR-2026/MF-119", 60, 160);
    ctx.fillText("Date: 18/02/2026", 60, 185);

    ctx.font = "bold 16px sans-serif";
    ctx.fillText("1. Unit Name: Murugan Small Trade & Provision Store", 60, 225);
    ctx.font = "15px serif";
    ctx.fillText("Proposed Activity: Retail Grocery & Organic Staples Vending", 60, 250);
    ctx.fillText("Promoter: Murugan S (SC Community Beneficiary)", 60, 275);

    ctx.font = "bold 16px sans-serif";
    ctx.fillText("2. Capital Cost Estimate & Means of Finance:", 60, 315);
    ctx.font = "15px serif";
    ctx.fillText("• Shop Display Racks & Weighing Scale Quotation: Rs. 65,000", 60, 340);
    ctx.fillText("• Initial Inventory & Working Capital: Rs. 55,000", 60, 365);
    ctx.fillText("• Total Project Cost: Rs. 1,20,000", 60, 390);
    ctx.fillText("• Eligible Loan under NSFDC Micro Finance (90%): Rs. 1,08,000", 60, 415);
    ctx.fillText("• Borrower Margin Money (10% Self-Contribution): Rs. 12,000", 60, 440);

  } else if (type === "admission") {
    ctx.font = "bold 24px serif";
    ctx.fillText("GOVERNMENT COLLEGE OF TECHNOLOGY", width / 2, 75);
    ctx.fillStyle = "#6B6558";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("OFFICE OF THE REGISTRAR & ADMISSIONS", width / 2, 105);

    ctx.fillStyle = "#1F3A5F";
    ctx.font = "bold 20px serif";
    ctx.fillText("PROVISIONAL ADMISSION OFFER LETTER", width / 2, 150);

    ctx.fillStyle = "#2B2A28";
    ctx.font = "15px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Allotment Order No: ADM-2026/GCT/4401", 60, 200);
    ctx.fillText("Date: 22/01/2026", 60, 225);

    ctx.font = "15px serif";
    const bodyText = [
      "We are pleased to inform you that Candidate Murugan S",
      "has been provisionally selected and admitted to the 4-year",
      "Bachelor of Technology (B.Tech) in Electrical & Electronics Engineering",
      "for the Academic Year 2026-2027 under SC Merit Category.",
      "",
      "Total Annual Tuition and Laboratory Fee: Rs. 85,000 per academic year.",
      "This provisional admission letter is issued to facilitate education loan",
      "processing through NSFDC / State Channelizing Agencies."
    ];

    let y = 275;
    bodyText.forEach(line => {
      ctx.fillText(line, 60, y);
      y += 26;
    });

    ctx.textAlign = "right";
    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#1F3A5F";
    ctx.fillText("Dean & Registrar (Admissions)", width - 60, height - 100);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#6B6558";
    ctx.fillText("Government College of Technology", width - 60, height - 78);
  }
}

/**
 * Creates a File / Blob object from specimen type for direct testing
 */
export async function createSpecimenFile(type) {
  const canvas = document.createElement("canvas");
  canvas.width = 750;
  canvas.height = 550;
  renderSpecimenToCanvas(type, canvas);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], `specimen_${type}.png`, { type: "image/png" });
      resolve({ file, dataUrl: canvas.toDataURL("image/png") });
    }, "image/png");
  });
}
