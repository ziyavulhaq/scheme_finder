import { SCHEMES } from "../data/schemes";

/**
 * Intelligent Multi-Parameter Eligibility & Scoring Engine
 * Incorporates MoSJE guidelines, income ceiling (≤ ₹5.00L), caste status, and project suitability
 */
export function matchSchemes(userInput) {
  const {
    casteCategory = "SC",
    annualIncome = 250000,
    gender = "Male",
    education = "Graduate",
    projectType = "Micro",
    projectCost = 120000,
    state = "Tamil Nadu"
  } = userInput;

  const results = SCHEMES.map(scheme => {
    let score = 0;
    const reasons = [];
    const caveats = [];
    let isEligible = true;

    // 1. Income Ceiling Check (MoSJE guideline: <= ₹5.00 Lakhs)
    if (annualIncome <= scheme.maxIncomeLimit) {
      score += 30;
      reasons.push(`Annual income of ₹${(annualIncome / 100000).toFixed(2)}L satisfies the MoSJE concessional ceiling of ≤ ₹5.00 Lakhs.`);
    } else {
      isEligible = false;
      score -= 40;
      caveats.push(`Income exceeds the ₹5.00 Lakhs limit. Standard commercial rates apply.`);
    }

    // 2. Caste Status Check (MoSJE Scheduled Caste empowerment focus)
    if (casteCategory === "SC") {
      score += 25;
      reasons.push(`Verified SC category qualifies for maximum 90% project cost assistance and concessional interest rates.`);
    } else {
      isEligible = false;
      score -= 30;
      caveats.push(`This scheme is reserved for Scheduled Caste (SC) empowerment.`);
    }

    // 3. Project Type & Alignment Check
    if (projectType === "Micro") {
      if (scheme.id === "mcf") {
        score += 35;
        reasons.push(`Direct match for micro-enterprises, small vending, artisanal works, or local shops.`);
      } else if (scheme.id === "msy" && gender === "Female") {
        score += 40;
        reasons.push(`Specially designed for women micro-entrepreneurs with an extra 1.0% interest concession.`);
      } else if (scheme.id === "green-business") {
        score += 15;
      }
    } else if (projectType === "Business") {
      if (scheme.id === "term-loan") {
        score += 40;
        reasons.push(`Tailor-made for manufacturing, industrial service units, and commercial transport scaling up to ₹50 Lakhs.`);
      } else if (scheme.id === "green-business") {
        score += 20;
      }
    } else if (projectType === "HigherEdu") {
      if (scheme.id === "els") {
        score += 45;
        reasons.push(`Comprehensive coverage for professional degree/diploma tuition, books, hostel and study expenses.`);
        if (gender === "Female") {
          score += 5;
          reasons.push(`0.5% special interest rebate applied for female SC students.`);
        }
      }
    } else if (projectType === "Green") {
      if (scheme.id === "green-business") {
        score += 45;
        reasons.push(`High priority green finance for solar power, E-rickshaws, polyhouse, and recycling units.`);
      } else if (scheme.id === "term-loan") {
        score += 20;
      }
    } else if (projectType === "Sanitation") {
      if (scheme.id === "suy") {
        score += 45;
        reasons.push(`Swachhta Udyami Scheme offers up to 50% capital subsidy on mechanized sewer/cleaning equipment.`);
      } else if (scheme.id === "term-loan") {
        score += 20;
      }
    }

    // 4. Project Cost Compatibility
    const cost = Number(projectCost);
    if (cost <= scheme.maxLoan) {
      score += 10;
      reasons.push(`Project cost (₹${cost.toLocaleString("en-IN")}) is within the scheme ceiling of ₹${scheme.maxLoan.toLocaleString("en-IN")}.`);
    } else {
      score -= 15;
      caveats.push(`Project cost exceeds the maximum scheme ceiling of ₹${scheme.maxLoan.toLocaleString("en-IN")}.`);
    }

    // 5. Gender Specific Adjustments
    if (scheme.id === "msy") {
      if (gender === "Female") {
        score += 10;
      } else {
        isEligible = false;
        score = Math.min(score, 30);
        caveats.push(`Mahila Samriddhi Yojana is exclusively reserved for women entrepreneurs.`);
      }
    }

    // Normalize final score between 0 and 100
    const finalScore = Math.max(10, Math.min(99, score));

    // Calculate maximum loan & own contribution
    const financedAmount = Math.min(scheme.maxLoan, Math.round((cost * scheme.coveragePercent) / 100));
    const ownContribution = Math.round(cost - financedAmount);

    return {
      ...scheme,
      matchScore: finalScore,
      isEligible: isEligible && finalScore >= 50,
      reasons,
      caveats,
      calculatedLoan: financedAmount,
      calculatedContribution: Math.max(0, ownContribution)
    };
  });

  // Sort by highest match score first
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
