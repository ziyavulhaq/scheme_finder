import assert from "assert";
import { evaluateEligibility } from "./rulesEngine.js";

console.log("=================================================");
console.log("  SahayaSetu Rules Engine — Statutory Unit Tests ");
console.log("=================================================\n");

const testCases = [
  {
    id: 1,
    description: "Case 1: Small trade | ₹1,20,000 | ₹1,80,000",
    input: {
      projectType: "trade",
      projectCost: 120000,
      annualIncome: 180000,
      casteProof: "yes"
    },
    expectedStatus: "match",
    expectedSchemeId: "micro",
    expectedCapped: false
  },
  {
    id: 2,
    description: "Case 2: Manufacturing | ₹8,00,000 | ₹3,00,000",
    input: {
      projectType: "manufacturing",
      projectCost: 800000,
      annualIncome: 300000,
      casteProof: "yes"
    },
    expectedStatus: "match",
    expectedSchemeId: "term",
    expectedCapped: false
  },
  {
    id: 3,
    description: "Case 3: Higher education | ₹6,00,000 | ₹2,50,000",
    input: {
      projectType: "education",
      projectCost: 600000,
      annualIncome: 250000,
      casteProof: "yes"
    },
    expectedStatus: "match",
    expectedSchemeId: "education",
    expectedCapped: false
  },
  {
    id: 4,
    description: "Case 4: Services | ₹2,00,000 | ₹6,50,000 (Income > 5L)",
    input: {
      projectType: "services",
      projectCost: 200000,
      annualIncome: 650000,
      casteProof: "yes"
    },
    expectedStatus: "ineligible",
    expectedReasonType: "income"
  },
  {
    id: 5,
    description: "Case 5: Manufacturing | ₹65,00,000 | ₹4,00,000 (Cost > 50L)",
    input: {
      projectType: "manufacturing",
      projectCost: 6500000,
      annualIncome: 400000,
      casteProof: "yes"
    },
    expectedStatus: "ineligible",
    expectedReasonType: "over_limit"
  },
  {
    id: 6,
    description: "Case 6: Higher education | ₹25,00,000 | ₹2,00,000 (Cost > 20L Domestic Cap)",
    input: {
      projectType: "education",
      projectCost: 2500000,
      annualIncome: 200000,
      casteProof: "yes"
    },
    expectedStatus: "match",
    expectedSchemeId: "education",
    expectedCapped: true,
    expectedMaxSanction: 2000000
  }
];

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  try {
    const result = evaluateEligibility(tc.input);

    assert.strictEqual(
      result.status,
      tc.expectedStatus,
      `[${tc.description}] Status mismatch. Expected ${tc.expectedStatus}, got ${result.status}`
    );

    if (tc.expectedStatus === "match") {
      assert.strictEqual(
        result.schemeId,
        tc.expectedSchemeId,
        `[${tc.description}] Scheme ID mismatch. Expected ${tc.expectedSchemeId}, got ${result.schemeId}`
      );
      assert.strictEqual(
        result.capped,
        tc.expectedCapped,
        `[${tc.description}] Capped flag mismatch. Expected ${tc.expectedCapped}, got ${result.capped}`
      );
      if (tc.expectedMaxSanction) {
        assert.strictEqual(
          result.maxSanctionAmount,
          tc.expectedMaxSanction,
          `[${tc.description}] Max sanction mismatch.`
        );
      }
      assert.ok(result.reason && result.reason.length > 10, `[${tc.description}] Reason string missing`);
    } else {
      assert.strictEqual(
        result.reasonType,
        tc.expectedReasonType,
        `[${tc.description}] Ineligibility reason type mismatch.`
      );
      assert.ok(result.suggestedAlternative, `[${tc.description}] Suggested alternative missing.`);
    }

    console.log(`PASS: ${tc.description}`);
    console.log(`   -> Outcome: ${result.status.toUpperCase()} ${result.schemeId ? `(${result.schemeId})` : `(${result.reasonType})`}`);
    console.log(`   -> Explanation: "${result.reason}"\n`);
    passed++;
  } catch (err) {
    console.error(`FAIL: ${tc.description}`);
    console.error(`   -> Error: ${err.message}\n`);
    failed++;
  }
}

// =======================================================
// Section 4 & 8: Explicit 90% Margin Money Test Cases
// =======================================================
console.log("\n=================================================");
console.log("  Section 4 & 8 — 90% Margin Money Verification  ");
console.log("=================================================\n");

import { calculateMarginMoney } from "./rulesEngine.js";

const marginTestCases = [
  {
    name: "Margin Case 1: ₹1,00,000 Micro Finance",
    cost: 100000,
    schemeMax: 140000,
    expectedLoan: 90000,
    expectedMargin: 10000
  },
  {
    name: "Margin Case 2: ₹10,00,000 Term Loan",
    cost: 1000000,
    schemeMax: 5000000,
    expectedLoan: 900000,
    expectedMargin: 100000
  },
  {
    name: "Margin Case 3: ₹55,00,000 Term Loan (Capped)",
    cost: 5500000,
    schemeMax: 5000000,
    expectedLoan: 5000000,
    expectedMargin: 500000
  }
];

for (const mt of marginTestCases) {
  try {
    const res = calculateMarginMoney(mt.cost, mt.schemeMax);
    assert.strictEqual(
      res.eligibleLoanAmount,
      mt.expectedLoan,
      `[${mt.name}] Loan mismatch. Expected ${mt.expectedLoan}, got ${res.eligibleLoanAmount}`
    );
    assert.strictEqual(
      res.marginMoney,
      mt.expectedMargin,
      `[${mt.name}] Margin mismatch. Expected ${mt.expectedMargin}, got ${res.marginMoney}`
    );

    console.log(`PASS: ${mt.name}`);
    console.log(`   -> Total Cost: ₹${mt.cost.toLocaleString("en-IN")}`);
    console.log(`   -> Eligible Loan (90% cap): ₹${res.eligibleLoanAmount.toLocaleString("en-IN")}`);
    console.log(`   -> Required Margin Money: ₹${res.marginMoney.toLocaleString("en-IN")}`);
    console.log(`   -> Verification: ${res.eligibleLoanAmount} + ${res.marginMoney} === ${mt.cost} (100% matched)\n`);
    passed++;
  } catch (err) {
    console.error(`FAIL: ${mt.name}`);
    console.error(`   -> Error: ${err.message}\n`);
    failed++;
  }
}

console.log("=================================================");
console.log(`  Tests Completed: ${passed} Passed, ${failed} Failed`);
console.log("=================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("All statutory rules and margin-money calculations verified successfully!");
}

