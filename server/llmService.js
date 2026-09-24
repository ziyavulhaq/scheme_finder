import https from "https";

// Groq API Configuration (OpenAI-compatible)
const GROQ_BASE_URL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
// Using Groq's active production models on this key
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_INDIC_MODEL = process.env.GROQ_INDIC_MODEL || "qwen/qwen3.8-27b";
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || "openai/gpt-oss-20b";

// In-memory cache for explanation requests (TTL: 15 minutes)
const explanationCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

// Language code to human-readable name mapping
const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
  kn: "Kannada (ಕನ್ನಡ)"
};

/**
 * Format number as Indian Rupee string
 */
function formatINR(amount) {
  const num = Math.round(Number(amount) || 0);
  return "₹" + num.toLocaleString("en-IN");
}

/**
 * Normalize text numbers: converts Devanagari numerals to ASCII digits
 */
function normalizeNumerals(str) {
  if (!str) return "";
  const devanagari = "०१२३४५६७८९";
  return String(str).replace(/[०-९]/g, (ch) => devanagari.indexOf(ch));
}

/**
 * Extract numbers, monetary figures, and percentages from text for fact validation
 */
export function extractFiguresFromText(rawText) {
  if (!rawText) return [];
  const text = normalizeNumerals(rawText);
  const figures = [];

  // 1. Matches with currency symbol: ₹ 1,08,000 or Rs. 1,08,000 or INR 1,08,000
  const currencyRegex = /(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)\s*(lakhs?|lacs?|crores?|cr|k|hazar|हजार|लाख|करोड़)?/gi;
  let match;
  while ((match = currencyRegex.exec(text)) !== null) {
    const rawVal = match[1].replace(/,/g, "");
    let val = parseFloat(rawVal);
    const unit = (match[2] || "").toLowerCase();
    if (unit.startsWith("lakh") || unit.startsWith("lac") || unit === "लाख") val *= 100000;
    else if (unit.startsWith("crore") || unit === "cr" || unit === "करोड़") val *= 10000000;
    else if (unit === "k" || unit === "hazar" || unit === "हजार") val *= 1000;

    figures.push({
      type: "currency",
      raw: match[0].trim(),
      value: val
    });
  }

  // 2. Matches for lakh / crore mentions without currency symbol: 1.08 lakh, 20 Lakhs, 50,000
  const lakhRegex = /\b([\d,]+(?:\.\d+)?)\s*(lakhs?|lacs?|crores?|हजार|लाख|करोड़)\b/gi;
  while ((match = lakhRegex.exec(text)) !== null) {
    const rawVal = match[1].replace(/,/g, "");
    let val = parseFloat(rawVal);
    const unit = match[2].toLowerCase();
    if (unit.startsWith("lakh") || unit.startsWith("lac") || unit === "लाख") val *= 100000;
    else if (unit.startsWith("crore") || unit === "करोड़") val *= 10000000;
    else if (unit === "हजार") val *= 1000;

    // Avoid duplicate if already caught by currency
    if (!figures.some((f) => Math.abs(f.value - val) < 0.01)) {
      figures.push({
        type: "currency_words",
        raw: match[0].trim(),
        value: val
      });
    }
  }

  // 3. Matches for percentages: 6.5%, 8%, 90%, 10%
  const percentRegex = /([\d]+(?:\.[\d]+)?)\s*(?:%|percent|प्रतिशत)/gi;
  while ((match = percentRegex.exec(text)) !== null) {
    const val = parseFloat(match[1]);
    figures.push({
      type: "percentage",
      raw: match[0].trim(),
      value: val
    });
  }

  // 4. Matches for tenure/moratorium months: 3 months, 6 months, 12 months, 3 महीने
  const monthRegex = /\b(\d+)\s*(?:months?|महीने|माह)\b/gi;
  while ((match = monthRegex.exec(text)) !== null) {
    const val = parseInt(match[1], 10);
    figures.push({
      type: "tenure",
      raw: match[0].trim(),
      value: val
    });
  }

  return figures;
}

/**
 * Validate LLM generated text against input facts.
 * If the LLM introduced any financial figure or percentage not present in the input facts,
 * return valid: false so the backend can discard it.
 */
export function validateExplanationAgainstFacts(llmText, contextFacts) {
  if (!llmText) return { valid: false, reason: "empty_text" };

  const extractedFigures = extractFiguresFromText(llmText);

  // Derive all allowed numerical values from input facts
  const allowedNumbers = new Set();

  const addAllowed = (n) => {
    if (n !== undefined && n !== null && !isNaN(n)) {
      const num = Number(n);
      allowedNumbers.add(num);
      // Also allow 2 decimal rounding if float
      allowedNumbers.add(Math.round(num * 100) / 100);
      allowedNumbers.add(Math.round(num));
    }
  };

  // Add source facts
  addAllowed(contextFacts.eligibleLoanAmount);
  addAllowed(contextFacts.marginMoney);
  addAllowed(contextFacts.rate);
  addAllowed(contextFacts.moratorium);
  addAllowed(contextFacts.cost);
  addAllowed(contextFacts.projectCost);
  addAllowed(contextFacts.maxCost);
  addAllowed(contextFacts.annualIncome);
  addAllowed(contextFacts.maxSanctionAmount);

  // Standard percentages allowed in loan rules
  addAllowed(90); // 90% loan coverage
  addAllowed(10); // 10% margin share
  addAllowed(95); // some schemes 95%
  addAllowed(5);  // some schemes 5%
  addAllowed(100); // 100% project cost or 100 words prompt instruction
  addAllowed(500000); // 5 Lakh income ceiling standard
  addAllowed(2000000); // Domestic education cap
  addAllowed(4000000); // Study abroad cap

  // Check each extracted figure against allowed values
  for (const figure of extractedFigures) {
    let matched = false;
    for (const allowed of allowedNumbers) {
      if (Math.abs(figure.value - allowed) < 0.01) {
        matched = true;
        break;
      }
    }

    if (!matched) {
      console.warn(
        `[LLM Fact Validation FAILED] Hallucinated/unverified figure found: "${figure.raw}" (value: ${figure.value}). Not in allowed facts: [${Array.from(allowedNumbers).join(", ")}]`
      );
      return {
        valid: false,
        reason: "hallucinated_number",
        mismatchedFigure: figure.raw,
        mismatchedValue: figure.value,
        allowedValues: Array.from(allowedNumbers)
      };
    }
  }

  return { valid: true };
}

/**
 * Call Groq Chat Completions API with OpenAI-compatible REST endpoint
 */
async function callGroqChat(messages, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_key_here") {
    throw new Error("GROQ_API_KEY is not configured on server.");
  }

  const isIndic = options.language && options.language !== "en";
  const defaultModel = isIndic ? GROQ_INDIC_MODEL : GROQ_MODEL;
  const model = options.model || defaultModel;
  const fallbackModel = options.fallbackModel || (model === GROQ_INDIC_MODEL ? GROQ_MODEL : (model === GROQ_MODEL ? GROQ_INDIC_MODEL : GROQ_FALLBACK_MODEL));
  const timeoutMs = options.timeoutMs || 8000;

  const url = `${GROQ_BASE_URL.replace(/\/$/, "")}/chat/completions`;
  const bodyData = JSON.stringify({
    model,
    messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.max_tokens ?? 500
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`
      },
      body: bodyData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      // If primary model hits rate limit or unavailable, try fallback model once
      if (model !== fallbackModel && (res.status === 429 || res.status === 503 || res.status === 404)) {
        console.warn(`[Groq API] Primary model ${model} returned ${res.status}. Retrying with ${fallbackModel}...`);
        return await callGroqChat(messages, { ...options, model: fallbackModel, fallbackModel: GROQ_FALLBACK_MODEL });
      }
      throw new Error(`Groq API returned HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const content = (data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "").trim();
    if (!content) {
      if (model !== fallbackModel) {
        console.warn(`[Groq API] Empty content from ${model}. Retrying with ${fallbackModel}...`);
        return await callGroqChat(messages, { ...options, model: fallbackModel, fallbackModel: GROQ_FALLBACK_MODEL });
      }
      throw new Error("Empty response from Groq API");
    }
    return content;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(`Groq API request timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}

/**
 * Feature 1: Natural-language explanation of scheme match
 * Rephrases deterministic rules output into warm, plain-language explanation.
 * Strictly validated against facts before returning.
 */
export async function generateSchemeExplanation({
  scheme,
  eligibleLoanAmount,
  marginMoney,
  rate,
  moratorium,
  reasoning,
  language = "en",
  cost = 0,
  annualIncome = 0
}) {
  const schemeName = scheme?.name || "Matched Scheme";
  const numRate = Number(rate !== undefined ? rate : scheme?.rate || 0);
  const numMoratorium = Number(moratorium !== undefined ? moratorium : scheme?.moratorium || 0);
  const numEligible = Number(eligibleLoanAmount || 0);
  const numMargin = Number(marginMoney || 0);
  const langKey = (language || "en").toLowerCase();
  const langName = LANGUAGE_NAMES[langKey] || "English";

  // Check in-memory cache for identical requests to stay within free-tier limits
  const cacheKey = `${scheme?.id || schemeName}_${numEligible}_${numMargin}_${numRate}_${langKey}`;
  const cached = explanationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      success: true,
      explanation: cached.explanation,
      source: "cache",
      verified: true
    };
  }

  // Fallback string if Groq unavailable or validation fails
  const fallbackReasoning = reasoning || "Eligible for concessional government loan scheme.";

  // If no API key configured, gracefully fall back immediately
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_key_here") {
    return {
      success: true,
      explanation: fallbackReasoning,
      source: "deterministic_fallback",
      reason: "API key not configured",
      verified: true
    };
  }

  const systemPrompt = `You are explaining a loan-scheme match to a first-time applicant in ${langName}.
Use ONLY the facts given below — do not calculate, estimate, or add any number,
rate, or limit that is not explicitly provided. If asked about something not in
these facts, say the user should confirm with their channel partner. Keep it under
100 words, warm and simple, no jargon.

Facts:
- Scheme: ${schemeName}
- Eligible loan amount: ${formatINR(numEligible)}
- Margin money required: ${formatINR(numMargin)}
- Interest rate: ${numRate}% p.a.
- Moratorium: ${numMoratorium} months
- Reasoning: ${fallbackReasoning}`;

  const userPrompt = `Please explain my loan scheme match in warm, simple ${langName} in under 100 words using ONLY the given facts. Do not add any new numbers.`;

  try {
    const rawExplanation = await callGroqChat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      { language: langKey, max_tokens: 450 }
    );

    // Post-response validation: verify that no unvetted figures were introduced
    const validationFacts = {
      schemeName,
      eligibleLoanAmount: numEligible,
      marginMoney: numMargin,
      rate: numRate,
      moratorium: numMoratorium,
      cost: Number(cost || 0),
      projectCost: Number(cost || 0),
      maxCost: Number(scheme?.maxCost || 0),
      annualIncome: Number(annualIncome || 0)
    };

    const validation = validateExplanationAgainstFacts(rawExplanation, validationFacts);

    if (!validation.valid) {
      console.warn(
        `[LLM Guardrail Triggered] Discarding LLM explanation due to unverified figure "${validation.mismatchedFigure}". Falling back to deterministic rules reasoning.`
      );
      return {
        success: true,
        explanation: fallbackReasoning,
        source: "deterministic_fallback",
        guardrailTriggered: true,
        fallbackReason: `LLM hallucination prevented: unverified figure '${validation.mismatchedFigure}' detected.`,
        verified: true
      };
    }

    // Cache the verified response
    explanationCache.set(cacheKey, {
      explanation: rawExplanation,
      timestamp: Date.now()
    });

    return {
      success: true,
      explanation: rawExplanation,
      source: "groq",
      verified: true
    };
  } catch (err) {
    console.warn(`[Groq Explanation Error] Falling back to rules engine reasoning:`, err.message);
    return {
      success: true,
      explanation: fallbackReasoning,
      source: "deterministic_fallback",
      error: err.message,
      verified: true
    };
  }
}

/**
 * Feature 2: Open-ended follow-up assistant
 * Answers questions about the match with strict domain and fact constraints.
 */
export async function handleAssistantChat({
  message,
  context = {},
  language = "en",
  conversationHistory = []
}) {
  if (!message || !message.trim()) {
    return {
      success: false,
      reply: "Please provide a question about your loan scheme match."
    };
  }

  const langKey = (language || "en").toLowerCase();
  const langName = LANGUAGE_NAMES[langKey] || "English";

  const schemeName = context.schemeName || context.scheme?.name || context.scheme?.title || "";
  const numRate = context.rate !== undefined ? context.rate : (context.scheme?.interestRate || context.scheme?.rate || 0);
  const numEligible = context.eligibleLoanAmount !== undefined ? context.eligibleLoanAmount : (context.maxCost || context.scheme?.maxLoan || 0);
  const numMargin = context.marginMoney !== undefined ? context.marginMoney : (context.ownContributionMin || 10);
  const numMoratorium = context.moratorium !== undefined ? context.moratorium : (context.scheme?.defaultMoratoriumMonths || context.scheme?.moratorium || 0);
  const reasoning = context.reasoning || context.reason || context.tagline || "";
  const category = context.category || context.scheme?.category || "";
  const keyBenefits = Array.isArray(context.keyBenefits) ? context.keyBenefits.join("; ") : (context.keyBenefits || "");
  const docs = Array.isArray(context.documentsRequired) ? context.documentsRequired.join(", ") : (context.documentsRequired || "");

  // Guardrail check if API key is present
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_key_here") {
    return {
      success: false,
      reply: "AI assistant is temporarily unavailable — please try again shortly.",
      fallback: true
    };
  }

  const hasSpecificScheme = Boolean(schemeName);
  let factsSection = "";
  if (hasSpecificScheme) {
    factsSection = `
Scheme Facts for Selected Scheme:
- Scheme Name: ${schemeName}
- Category: ${category || "Scheduled Caste Welfare / Concessional Loan"}
- Maximum Loan Limit: ${numEligible > 0 ? (typeof numEligible === "number" ? formatINR(numEligible) : numEligible) : "Evaluated based on project scale"}
- Required Margin Money: ${numMargin > 0 ? (typeof numMargin === "number" && numMargin <= 100 ? `${numMargin}% borrower contribution` : formatINR(numMargin)) : "10% borrower contribution"}
- Subsidized Interest Rate: ${numRate > 0 ? `${numRate}% p.a.` : "Concessional statutory rate"}
- Moratorium Grace Period: ${numMoratorium > 0 ? `${numMoratorium} months` : "As per scheme schedule"}
${reasoning ? `- Scheme Purpose & Description: ${reasoning}` : ""}
${keyBenefits ? `- Key Benefits: ${keyBenefits}` : ""}
${docs ? `- Required Verification Documents: ${docs}` : ""}

Instruction for this inquiry:
Answer specifically in the context of the user's selected scheme (${schemeName}). Cite its official interest rate, grace period, required margin money, and documents accurately based on the facts provided above.`;
  } else {
    factsSection = `
Official NSFDC & Government Concessional Lending Schemes Knowledge:
1. Micro Finance Scheme (MCF): Project cost up to ₹1,40,000; interest rate 6.5% p.a.; 3-month moratorium grace period; 90% loan coverage, 10% own contribution (margin money).
2. Mahila Samriddhi Yojana (MSY): For SC women entrepreneurs; project cost up to ₹1,40,000; concessional rate of 5.5% p.a. (1% special interest rebate); 3-month moratorium; 10% margin money.
3. Term Loan Scheme (TL): Project cost up to ₹50,00,000; interest rate 8.0% p.a. for loans above ₹5 Lakhs, 7.0% p.a. for loans up to ₹5 Lakhs; 6 to 12 months moratorium; 90% loan coverage, 10% margin money.
4. Education Loan Scheme (ELS): Up to ₹20,00,000 for domestic professional courses, and up to ₹40,00,000 for study abroad; interest rate 4.0% p.a. (3.5% p.a. for female students); moratorium covers course duration plus 6 months.
5. Green Business Scheme (GBS): Up to ₹30,00,000 for eco-friendly businesses (solar, e-rickshaw, recycling) at 7.0% p.a.
6. Swachhta Udyami Yojana (SUY): Up to ₹50,00,000 for mechanized sanitation equipment at 6.0% p.a. with up to 50% capital subsidy.
7. Statutory Income Eligibility: Annual family income must be up to ₹5,00,000 per year.
8. Target Beneficiaries: Scheduled Caste (SC) category entrepreneurs and students (competent caste certificate required before final sanction).
9. Lending Channel Partners: State Channelizing Agencies (SCAs in all 28 states & UTs) and 11 confirmed Public Sector Partner Banks (including Canara Bank, Indian Overseas Bank, Bank of Baroda, Punjab National Bank, Punjab & Sind Bank, etc.).`;
  }

  const systemPrompt = `You are Finora's AI Scheme Assistant for Scheduled Caste (SC) entrepreneurs and citizens.
You help explain government concessional loan schemes based ONLY on verified statutory guidelines. You are not a financial advisor and cannot make official sanction decisions — the app's deterministic rules engine and authorized bank channel partners do that.
If asked something outside the official facts (e.g. hypothetical income changes, combining schemes, other schemes not listed here), give general factual guidance but always direct the user to confirm with their channel partner or the official NSFDC portal (https://nsfdc.nic.in).
Never state a specific rate, limit, or figure that wasn't given to you.
Respond in ${langName} matching the user's language toggle.
Decline anything unrelated to this government scheme / loan domain politely.
${factsSection}`;

  // Limit conversation history to last 6 messages to stay concise and within limits
  const safeHistory = (conversationHistory || [])
    .slice(-6)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 500) }));

  const messages = [
    { role: "system", content: systemPrompt },
    ...safeHistory,
    { role: "user", content: message.trim().slice(0, 500) }
  ];

  try {
    const reply = await callGroqChat(messages, {
      language: langKey,
      temperature: 0.2,
      max_tokens: 450
    });

    return {
      success: true,
      reply,
      source: "groq"
    };
  } catch (err) {
    console.warn("[Groq Assistant Error]:", err.message);
    return {
      success: false,
      reply: "AI assistant is temporarily unavailable — please try again shortly.",
      fallback: true,
      error: err.message
    };
  }
}
