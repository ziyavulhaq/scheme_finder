// Master Database of MoSJE & NSFDC Concessional Lending Schemes
export const SCHEMES = [
  {
    id: "mcf",
    code: "NSFDC-MCF",
    title: "Micro Credit Finance Scheme (MCF)",
    titleHi: "सूक्ष्म ऋण वित्त योजना (MCF)",
    titleTa: "குறு கடன் நிதி திட்டம் (MCF)",
    titleTe: "మైక్రో క్రెడిట్ ఫైనాన్స్ పథకం (MCF)",
    titleKn: "ಕಿರು ಸಾಲ ಹಣಕಾಸು ಯೋಜನೆ (MCF)",
    titleMl: "മൈക്രോ ക്രെഡിറ്റ് ഫിനാൻസ് പദ്ധതി (MCF)",
    tagline: "Ultra-low interest micro-capital for petty traders, shopkeepers & small artisans",
    category: "Micro Finance",
    maxLoan: 140000, // ₹1.40 Lakh
    minLoan: 10000,
    interestRate: 6.5, // 6.5% p.a.
    commercialRate: 13.5, // Typical market rate for comparison
    coveragePercent: 90, // Covers up to 90% of project cost
    ownContributionMin: 10,
    maxIncomeLimit: 500000, // ₹5.00 Lakhs
    maxMoratoriumMonths: 6,
    defaultMoratoriumMonths: 3,
    maxTenureMonths: 36,
    defaultTenureMonths: 36,
    eligibleActivities: ["Retail Store", "Mobile Cart", "Tailoring", "Handicrafts", "Repair Shop", "Small Dairy", "Vegetable/Fruit Vending"],
    icon: "Store",
    badge: "Most Popular for Small Business",
    color: "emerald",
    keyBenefits: [
      "No collateral required for loans up to ₹1.40 Lakh",
      "Concessional 6.5% interest rate vs 13.5% open market rate",
      "90% of project financed directly through Channel Partner",
      "3 to 6 months repayment holiday to establish cashflow"
    ],
    documentsRequired: [
      "Aadhaar Card",
      "Caste Certificate (SC)",
      "Income Certificate (≤ ₹5.00 Lakhs/annum)",
      "Basic Project Quotation / Price Estimate",
      "Bank Account Passbook"
    ]
  },
  {
    id: "msy",
    code: "NSFDC-MSY",
    title: "Mahila Samriddhi Yojana (MSY)",
    titleHi: "महिला समृद्धि योजना (MSY)",
    titleTa: "மகளிர் சம்ரித்தி யோஜனா (MSY)",
    titleTe: "మహిళా సమృద్ధి యోజన (MSY)",
    titleKn: "ಮಹಿಳಾ ಸಮೃದ್ಧಿ ಯೋಜನೆ (MSY)",
    titleMl: "മഹിളാ സമൃദ്ധി യോജന (MSY)",
    tagline: "Dedicated women-empowerment micro-credit with extra concessional interest",
    category: "Women Entrepreneurship",
    maxLoan: 140000, // ₹1.40 Lakh
    minLoan: 10000,
    interestRate: 5.5, // Highly concessional for women
    commercialRate: 14.0,
    coveragePercent: 90,
    ownContributionMin: 10,
    maxIncomeLimit: 500000,
    maxMoratoriumMonths: 6,
    defaultMoratoriumMonths: 3,
    maxTenureMonths: 36,
    defaultTenureMonths: 36,
    genderRequirement: "Female",
    eligibleActivities: ["Boutique & Sewing", "Beauty Parlour", "Food Processing", "Papad/Pickle Unit", "Handloom", "Retail"],
    icon: "HeartHandshake",
    badge: "Extra 1% Subsidy for SC Women",
    color: "rose",
    keyBenefits: [
      "Special 5.5% interest rate reserved for women entrepreneurs & SHGs",
      "Quick branch-level appraisal through SCAs and NBFC-MFIs",
      "Full 90% capital support with just 10% self-contribution",
      "Moratorium period of up to 6 months"
    ],
    documentsRequired: [
      "Aadhaar Card of Applicant",
      "SC Caste Certificate",
      "Family Income Certificate (≤ ₹5 Lakhs)",
      "Business Quotation",
      "Active Bank Passbook (Self or SHG)"
    ]
  },
  {
    id: "term-loan",
    code: "NSFDC-TL",
    title: "NSFDC Term Loan Scheme",
    titleHi: "सावधि ऋण योजना (Term Loan)",
    titleTa: "காலக் கடன் திட்டம் (Term Loan)",
    titleTe: "టర్మ్ లోన్ పథకం (Term Loan)",
    titleKn: "ಅವಧಿ ಸಾಲ ಯೋಜನೆ (Term Loan)",
    titleMl: "ടേം ലോൺ പദ്ധതി (Term Loan)",
    tagline: "Substantial capital for manufacturing, service units, transport & medium enterprises",
    category: "Term Loan",
    maxLoan: 5000000, // ₹50.00 Lakh
    minLoan: 150000,
    interestRate: 8.0, // 8.0% for loans > 5L, 7% for <= 5L
    commercialRate: 12.5,
    coveragePercent: 90,
    ownContributionMin: 10,
    maxIncomeLimit: 500000,
    maxMoratoriumMonths: 12,
    defaultMoratoriumMonths: 6,
    maxTenureMonths: 84, // Up to 7 years
    defaultTenureMonths: 60,
    eligibleActivities: ["Commercial Vehicle", "Manufacturing Unit", "Automobile Workshop", "IT & Cyber Cafe", "Agro Processing", "Diagnostic Lab"],
    icon: "Briefcase",
    badge: "Up to ₹50 Lakhs for Scaled Ventures",
    color: "blue",
    keyBenefits: [
      "High capital threshold up to ₹50.00 Lakh for serious enterprise scaling",
      "Long tenure up to 7 years (84 months) for manageable installments",
      "Generous moratorium up to 12 months for plant setup & gestation",
      "Available across all Public Sector Banks & State Channelizing Agencies"
    ],
    documentsRequired: [
      "Aadhaar & PAN Card",
      "Caste Certificate (SC)",
      "Income Certificate (≤ ₹5.00 Lakhs)",
      "Detailed Project Report (DPR) with cashflow forecast",
      "Machinery / Vehicle Quotation from authorized dealer",
      "Bank Account Statement (6 months)"
    ]
  },
  {
    id: "els",
    code: "NSFDC-ELS",
    title: "Educational Loan Scheme (ELS)",
    titleHi: "शिक्षा ऋण योजना (ELS)",
    titleTa: "கல்விக் கடன் திட்டம் (ELS)",
    titleTe: "విద్యా రుణం పథకం (ELS)",
    titleKn: "ಶಿಕ್ಷಣ ಸಾಲ ಯೋಜನೆ (ELS)",
    titleMl: "വിദ്യാഭ്യാസ വായ്പാ പദ്ധതി (ELS)",
    tagline: "Concessional loans covering tuition, living & travel for higher technical & professional studies",
    category: "Education Loan",
    maxLoan: 2000000, // ₹20 Lakhs (India) / ₹40 Lakhs (Abroad)
    minLoan: 50000,
    interestRate: 7.5, // 7.0% for female students
    commercialRate: 11.5,
    coveragePercent: 90,
    ownContributionMin: 10,
    maxIncomeLimit: 500000,
    maxMoratoriumMonths: 12, // Course duration + 6-12 months
    defaultMoratoriumMonths: 12,
    maxTenureMonths: 120, // 10 years
    defaultTenureMonths: 84,
    eligibleActivities: ["Engineering & B.Tech", "Medical / MBBS / BDS", "MBA / Management", "Law", "Aviation", "Study Abroad (STEM)"],
    icon: "GraduationCap",
    badge: "0.5% Rebate for Girl Students",
    color: "purple",
    keyBenefits: [
      "Covers 90% of admission fees, books, equipment, hostel & airfare",
      "Zero repayment during course duration + 1 year after graduation or 6 months after getting job",
      "0.5% interest concession specifically for female SC students (7.0% p.a.)",
      "Long repayment tenure of up to 10 years"
    ],
    documentsRequired: [
      "Aadhaar & Student ID",
      "Caste Certificate (SC)",
      "Family Income Certificate (≤ ₹5.00 Lakhs)",
      "Admission Offer Letter & Fee Schedule from recognized Institute",
      "Mark sheets of qualifying exams (10th, 12th, Degree)"
    ]
  },
  {
    id: "green-business",
    code: "NSFDC-GBS",
    title: "Green Business Scheme (GBS)",
    titleHi: "हरित व्यापार योजना (GBS)",
    titleTa: "பசுமை வணிகத் திட்டம் (GBS)",
    titleTe: "గ్రీన్ బిజినెస్ పథకం (GBS)",
    titleKn: "ಹಸಿರು ವ್ಯಾಪಾರ ಯೋಜನೆ (GBS)",
    titleMl: "ഗ്രീൻ ബിസിനസ്സ് സ്കീം (GBS)",
    tagline: "Eco-friendly loans for E-Rickshaws, solar setups, polyhouse farming & waste recycling",
    category: "Green Enterprise",
    maxLoan: 3000000, // ₹30 Lakhs
    minLoan: 100000,
    interestRate: 7.0,
    commercialRate: 13.0,
    coveragePercent: 90,
    ownContributionMin: 10,
    maxIncomeLimit: 500000,
    maxMoratoriumMonths: 6,
    defaultMoratoriumMonths: 6,
    maxTenureMonths: 60,
    defaultTenureMonths: 48,
    eligibleActivities: ["E-Rickshaw / E-Auto", "Rooftop Solar Installation", "Polyhouse Farming", "Plastic / Electronic Waste Recycling", "Organic Compost Unit"],
    icon: "Leaf",
    badge: "Sustainable Clean Tech Focus",
    color: "teal",
    keyBenefits: [
      "Promotes modern sustainable livelihoods with verified environmental impact",
      "Covers up to 90% cost of battery-operated vehicles or solar equipment",
      "Concessional interest rate of 7.0% p.a.",
      "Fast-track processing at designated Regional Rural Banks & SCAs"
    ],
    documentsRequired: [
      "Aadhaar Card",
      "Caste Certificate (SC)",
      "Income Certificate (≤ ₹5.00 Lakhs)",
      "Green technology vendor quotation (BIS/MNRE approved)",
      "Driving license (for E-Rickshaw/vehicles)"
    ]
  },
  {
    id: "suy",
    code: "NSFDC-SUY",
    title: "Swachhta Udyami Yojana (SUY)",
    titleHi: "स्वच्छता उद्यमी योजना (SUY)",
    titleTa: "சுவச்சதா உத்யமி யோஜனா (SUY)",
    titleTe: "స్వచ్ఛత ఉద్యమి యోజన (SUY)",
    titleKn: "ಸ್ವಚ್ಛತಾ ಉದ್ಯಮಿ ಯೋಜನೆ (SUY)",
    titleMl: "സ്വച്ഛതാ ഉദ്യമി യോജന (SUY)",
    tagline: "Mechanized sanitation equipment loans to eliminate hazardous manual cleaning & empower operators",
    category: "Sanitation Automation",
    maxLoan: 5000000, // ₹50 Lakhs
    minLoan: 200000,
    interestRate: 6.0,
    commercialRate: 12.0,
    coveragePercent: 90,
    ownContributionMin: 10,
    maxIncomeLimit: 500000,
    maxMoratoriumMonths: 12,
    defaultMoratoriumMonths: 6,
    maxTenureMonths: 84,
    defaultTenureMonths: 60,
    eligibleActivities: ["Suction / Jetting Machines", "Garbage Compactors", "Septic Tank Vacuum Trucks", "Community Sanitary Complexes"],
    icon: "Truck",
    badge: "Direct Capital Subsidy up to ₹5 Lakhs",
    color: "amber",
    keyBenefits: [
      "Includes upfront capital subsidy of up to 50% for liberated sanitation workers",
      "Ultra-concessional 6.0% interest rate",
      "Municipal tie-up guidance for guaranteed operational contracts",
      "Supports modern mechanized cleaning equipment to ensure worker safety"
    ],
    documentsRequired: [
      "Aadhaar & PAN Card",
      "Caste Certificate (SC) or Safai Karamchari ID",
      "Income Certificate (≤ ₹5.00 Lakhs)",
      "Sanitation Equipment Technical Quotation",
      "Driving License for heavy vehicle / tractor if applicable"
    ]
  }
];
