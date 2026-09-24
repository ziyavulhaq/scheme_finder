import {
  extractFiguresFromText,
  validateExplanationAgainstFacts,
  generateSchemeExplanation,
  handleAssistantChat
} from "./llmService.js";

console.log("=== RUNNING FINORA LLM LAYER & GUARDRAIL TESTS ===\n");

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
  }
}

// 1. Test Figure Extraction
console.log("--- 1. Testing Figure Extraction ---");
const testText1 = "Eligible for ₹1,08,000 at 6.5% interest with ₹12,000 margin money and 3 months grace period.";
const figures1 = extractFiguresFromText(testText1);
console.log("Extracted figures from testText1:", figures1);
assert(
  figures1.some((f) => f.value === 108000),
  "Extracts ₹1,08,000 currency amount correctly"
);
assert(
  figures1.some((f) => f.value === 6.5),
  "Extracts 6.5% interest rate correctly"
);
assert(
  figures1.some((f) => f.value === 12000),
  "Extracts ₹12,000 margin money correctly"
);
assert(
  figures1.some((f) => f.value === 3),
  "Extracts 3 months tenure/moratorium correctly"
);

// 2. Test Hindi Figure Extraction
console.log("\n--- 2. Testing Hindi Figure Extraction ---");
const hindiText = "आपको ₹1,08,000 का ऋण 6.5% ब्याज दर पर मिलेगा और ₹12,000 आपकी मार्जिन राशि होगी, 3 महीने की छूट के साथ।";
const figuresHindi = extractFiguresFromText(hindiText);
console.log("Extracted figures from hindiText:", figuresHindi);
assert(
  figuresHindi.some((f) => f.value === 108000),
  "Extracts currency amount from Hindi text"
);
assert(
  figuresHindi.some((f) => f.value === 6.5),
  "Extracts percentage from Hindi text"
);

// 3. Test Fact Validator with Compliant Facts
console.log("\n--- 3. Testing Fact Validation on Compliant Text ---");
const compliantFacts = {
  schemeName: "Micro Finance Scheme",
  eligibleLoanAmount: 108000,
  marginMoney: 12000,
  rate: 6.5,
  moratorium: 3,
  cost: 120000,
  maxCost: 140000
};

const validText = "Congratulations! Under the Micro Finance Scheme, you qualify for a subsidized government loan of ₹1,08,000 at an interest rate of 6.5% p.a. You only need to provide ₹12,000 as your 10% margin money, and you will receive a 3 months repayment holiday.";
const validationResult1 = validateExplanationAgainstFacts(validText, compliantFacts);
assert(
  validationResult1.valid === true,
  "Compliant explanation passes fact validation check"
);

// 4. Test Fact Validator Catching Hallucinated Number (Rate Hallucination)
console.log("\n--- 4. Testing Fact Validation Catching Rate Hallucination ---");
const hallucinatedRateText = "Under the Micro Finance Scheme, you qualify for a loan of ₹1,08,000 at an extra special 2% interest rate.";
const validationResult2 = validateExplanationAgainstFacts(hallucinatedRateText, compliantFacts);
console.log("Validation result on hallucinated rate:", validationResult2);
assert(
  validationResult2.valid === false,
  "Catches hallucinated 2% rate"
);
assert(
  validationResult2.reason === "hallucinated_number" && validationResult2.mismatchedValue === 2,
  "Identifies mismatched value as 2%"
);

// 5. Test Fact Validator Catching Hallucinated Number (Amount Hallucination)
console.log("\n--- 5. Testing Fact Validation Catching Amount Hallucination ---");
const hallucinatedAmountText = "Under the Micro Finance Scheme, you get ₹1,08,000 loan and an additional bonus subsidy of ₹50,000 from the government.";
const validationResult3 = validateExplanationAgainstFacts(hallucinatedAmountText, compliantFacts);
console.log("Validation result on hallucinated amount:", validationResult3);
assert(
  validationResult3.valid === false,
  "Catches hallucinated ₹50,000 figure"
);
assert(
  validationResult3.reason === "hallucinated_number" && validationResult3.mismatchedValue === 50000,
  "Identifies mismatched figure as 50000"
);

// 6. Test Fallback Behavior when API Key is Missing / Groq is Offline
console.log("\n--- 6. Testing Graceful Fallbacks when Groq is Offline / Key Missing ---");
async function testFallbacks() {
  const originalKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY; // Simulate offline/missing key

  const deterministicReason = "Matched Micro Finance Scheme because project cost ₹1,20,000 is within ₹1,40,000 limit.";
  const explainRes = await generateSchemeExplanation({
    scheme: { id: "micro", name: "Micro Finance Scheme", rate: 6.5, moratorium: 3 },
    eligibleLoanAmount: 108000,
    marginMoney: 12000,
    reasoning: deterministicReason,
    language: "en"
  });

  assert(
    explainRes.success === true,
    "generateSchemeExplanation succeeds gracefully without throwing"
  );
  assert(
    explainRes.explanation === deterministicReason,
    "Falls back directly to deterministic rules reasoning string"
  );
  assert(
    explainRes.source === "deterministic_fallback",
    "Marks source as deterministic_fallback"
  );

  const chatRes = await handleAssistantChat({
    message: "What if my income changes next year?",
    context: { schemeName: "Micro Finance Scheme" },
    language: "en"
  });

  assert(
    chatRes.fallback === true,
    "Assistant chat returns fallback flag when offline"
  );
  assert(
    chatRes.reply.includes("temporarily unavailable"),
    "Returns user-friendly temporary unavailability message"
  );

  // Restore key if any
  if (originalKey) process.env.GROQ_API_KEY = originalKey;
}

testFallbacks().then(() => {
  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed}/${total} assertions passed.`);
  console.log(`========================================\n`);
  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});
