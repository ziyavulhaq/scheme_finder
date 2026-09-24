import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db, { initDatabase } from "./db.js";
import { evaluateEligibility } from "./rulesEngine.js";
import { calculateAmortization } from "./financialMath.js";
import { assessSchemeAndLender } from "../src/utils/verifierEngine.js";
import { generateSchemeExplanation, handleAssistantChat } from "./llmService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Safe auto-loading of .env in local development
const possibleEnvPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, ".env"),
  path.resolve(__dirname, "../.env")
];
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    try {
      if (process.loadEnvFile) {
        process.loadEnvFile(envPath);
      }
      break;
    } catch (e) {
      // Ignore if loadEnvFile encounters issues
    }
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "sahayasetu_secure_jwt_token_2026";

// Explicit CORS configuration for Vercel production deployment and local development
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
  "https://scheme-finder.vercel.app",
  "https://scheme-finder-six.vercel.app",
  process.env.CLIENT_ORIGIN
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "10mb" }));

// Health check endpoint for cloud monitoring (Render / Railway / Fly)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "FINORA SahayaSetu Backend",
    timestamp: new Date().toISOString()
  });
});

// Initialize SQLite database and seed tables
await initDatabase();

// Auth Middleware: Verify Bearer JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, error: "Access denied. No authentication token provided." });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: "Invalid or expired session token." });
    }
    req.user = decoded;
    next();
  });
}

// 0. AUTH ENDPOINTS: Real JWT Authentication & Profile Management
// POST /api/auth/register - Register Citizen Account
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, phone, email, password, state, casteCategory } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, error: "Name, phone number, and password are required." });
    }

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: "Please provide a valid 10-digit mobile number." });
    }

    db.get("SELECT id FROM users WHERE phone = ?", [cleanPhone], async (err, existing) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      if (existing) {
        return res.status(409).json({ success: false, error: "An account with this phone number already exists. Please sign in." });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const createdAt = Date.now();

      db.run(
        `INSERT INTO users (name, phone, email, password_hash, state, caste_category, profile_image, created_at)
         VALUES (?, ?, ?, ?, ?, ?, '', ?)`,
        [name.trim(), cleanPhone, (email || "").trim(), passwordHash, state || "Tamil Nadu", casteCategory || "Scheduled Caste (SC)", createdAt],
        function (insertErr) {
          if (insertErr) return res.status(500).json({ success: false, error: insertErr.message });
          
          const userId = this.lastID;
          const userPayload = {
            id: userId,
            name: name.trim(),
            phone: cleanPhone,
            email: (email || "").trim(),
            state: state || "Tamil Nadu",
            casteCategory: casteCategory || "Scheduled Caste (SC)",
            profileImage: ""
          };

          const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });
          res.json({ success: true, token, user: userPayload });
        }
      );
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/auth/login - Sign In with Phone/Email & Password
app.post("/api/auth/login", (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: "Please provide your registered mobile number and password." });
    }

    const cleanIdentifier = identifier.trim().replace(/\D/g, "");
    const query = "SELECT * FROM users WHERE phone = ? OR email = ?";
    
    db.get(query, [cleanIdentifier || identifier.trim(), identifier.trim()], async (err, user) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      if (!user) {
        return res.status(401).json({ success: false, error: "Account not found. Please check your phone number or create an account." });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: "Incorrect password. Please try again." });
      }

      const userPayload = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        state: user.state,
        casteCategory: user.caste_category,
        profileImage: user.profile_image || ""
      };

      const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });
      res.json({ success: true, token, user: userPayload });
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/auth/me - Verify current session & return user
app.get("/api/auth/me", authenticateToken, (req, res) => {
  db.get("SELECT id, name, phone, email, state, caste_category, profile_image FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ success: false, error: "User session not found." });
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        state: user.state,
        casteCategory: user.caste_category,
        profileImage: user.profile_image || ""
      }
    });
  });
});

// PUT /api/auth/profile - Update User Name & Profile Picture
app.put("/api/auth/profile", authenticateToken, (req, res) => {
  const { name, profileImage } = req.body;
  const userId = req.user.id;

  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user) return res.status(404).json({ success: false, error: "User not found." });

    const newName = name !== undefined && name.trim() ? name.trim() : user.name;
    const newImage = profileImage !== undefined ? profileImage : user.profile_image;

    db.run(
      "UPDATE users SET name = ?, profile_image = ? WHERE id = ?",
      [newName, newImage, userId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        const updatedUser = {
          id: user.id,
          name: newName,
          phone: user.phone,
          email: user.email,
          state: user.state,
          casteCategory: user.caste_category,
          profileImage: newImage || ""
        };

        const newToken = jwt.sign(updatedUser, JWT_SECRET, { expiresIn: "7d" });
        res.json({ success: true, token: newToken, user: updatedUser });
      }
    );
  });
});

import {
  calculateDistanceKm,
  reverseGeocodeState,
  forwardGeocodeCity,
  queryOverpassBanks,
  fetchLiveBanksAnywhere,
  classifyInstitution,
  getOfficialStateSCA,
  getPanIndiaVerifiedFallback,
  getVerifiedCoimbatoreFallback
} from "./geoService.js";

// Helper: Haversine distance in kilometers
function getDistanceKm(lat1, lon1, lat2, lon2) {
  return calculateDistanceKm(lat1, lon1, lat2, lon2);
}

// 1. GET /api/schemes - Master Scheme List from DB
app.get("/api/schemes", (req, res) => {
  db.all("SELECT * FROM schemes", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to retrieve schemes", details: err.message });
    }
    res.json({ success: true, schemes: rows });
  });
});

// 2. POST /api/recommend - Pure Deterministic Rules Engine
app.post("/api/recommend", (req, res) => {
  const { projectType, projectCost, annualIncome, casteProof } = req.body;

  if (projectCost === undefined || annualIncome === undefined) {
    return res.status(400).json({ error: "projectCost and annualIncome are required." });
  }

  // Fetch schemes map from DB
  db.all("SELECT * FROM schemes", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    const schemesMap = {};
    for (const s of rows) {
      schemesMap[s.id] = s;
    }

    const result = evaluateEligibility(
      { projectType, projectCost, annualIncome, casteProof },
      schemesMap
    );

    res.json({ success: true, ...result });
  });
});

// 2b. POST /api/explain - Groq LLM Warm Plain-Language Rephrasing (With Fact Validation)
app.post("/api/explain", async (req, res) => {
  try {
    const {
      scheme,
      eligibleLoanAmount,
      marginMoney,
      rate,
      moratorium,
      reasoning,
      language = "en",
      cost = 0,
      annualIncome = 0
    } = req.body;

    const result = await generateSchemeExplanation({
      scheme,
      eligibleLoanAmount,
      marginMoney,
      rate,
      moratorium,
      reasoning,
      language,
      cost,
      annualIncome
    });

    res.json(result);
  } catch (err) {
    console.error("[Explain Endpoint Error]:", err.message);
    res.json({
      success: true,
      explanation: req.body.reasoning || "Eligible for concessional government loan scheme.",
      source: "deterministic_fallback",
      error: err.message
    });
  }
});

// 2c. POST /api/assistant/chat - Constrained Follow-Up Q&A Assistant (Groq LLM)
app.post("/api/assistant/chat", async (req, res) => {
  try {
    const { message, context, language = "en", conversationHistory = [] } = req.body;
    const result = await handleAssistantChat({
      message,
      context,
      language,
      conversationHistory
    });

    res.json(result);
  } catch (err) {
    console.error("[Assistant Chat Endpoint Error]:", err.message);
    res.json({
      success: false,
      reply: "AI assistant is temporarily unavailable — please try again shortly.",
      fallback: true,
      error: err.message
    });
  }
});

// 3. POST /api/calculate-emi - Shared Financial Math Endpoint
app.post("/api/calculate-emi", (req, res) => {
  const { principal, annualRate, tenureMonths, moratoriumMonths, applyMoratorium } = req.body;

  if (!principal || !annualRate || !tenureMonths) {
    return res.status(400).json({ error: "principal, annualRate, and tenureMonths are required." });
  }

  const result = calculateAmortization({
    principal: Number(principal),
    annualRate: Number(annualRate),
    tenureMonths: Number(tenureMonths),
    moratoriumMonths: Number(moratoriumMonths) || 0,
    applyMoratorium: applyMoratorium !== false
  });

  res.json({ success: true, ...result });
});

// 4. GET /api/geocode - Forward Geocode city or district name
app.get("/api/geocode", async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: "city query parameter is required" });
  }
  try {
    const geo = await forwardGeocodeCity(city);
    res.json({ success: true, ...geo });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// 5. GET /api/tts - Audio proxy for native Indic language speech (ta, kn, ml, te, hi, en)
app.get("/api/tts", async (req, res) => {
  try {
    const { tl = "en", q = "" } = req.query;
    if (!q) return res.status(400).send("Text query is required");
    const cleanText = q.slice(0, 250);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
    const ttsRes = await fetch(googleTtsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!ttsRes.ok) {
      return res.status(ttsRes.status).send("TTS audio fetch failed");
    }
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    const arrayBuffer = await ttsRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("TTS endpoint error:", err.message);
    res.status(500).send(err.message);
  }
});

// 6. GET /api/partners/nearby - Live Location-Aware Bank Directory
app.get("/api/partners/nearby", async (req, res) => {
  let userLat = parseFloat(req.query.lat);
  let userLng = parseFloat(req.query.lng);
  const city = req.query.city ? req.query.city.trim() : "";
  const categoryFilter = (req.query.category || "all").toLowerCase().trim();

  let detectedState = null;
  let displayName = null;

  try {
    // If city is specified and coordinates are not valid numbers
    if (city && (isNaN(userLat) || isNaN(userLng))) {
      const geo = await forwardGeocodeCity(city);
      userLat = geo.lat;
      userLng = geo.lng;
      detectedState = geo.state;
      displayName = geo.displayName;
    } else if (isNaN(userLat) || isNaN(userLng)) {
      // Default to Coimbatore center
      userLat = 11.01515;
      userLng = 76.976618;
    }

    // If detectedState not yet determined, reverse geocode user coordinates
    if (!detectedState) {
      const rev = await reverseGeocodeState(userLat, userLng);
      detectedState = rev.state;
      displayName = rev.displayName;
    }

    // Fetch live bank nodes from Overpass API (multi-mirror) + Nominatim POI fallback
    let rawBanks = [];
    try {
      rawBanks = await fetchLiveBanksAnywhere(userLat, userLng, displayName || city || detectedState);
    } catch (bankErr) {
      console.warn("[Live Banks fetch warning]:", bankErr.message);
    }

    const partners = [];

    // Process and classify real bank nodes (filtered strictly to 12 confirmed PSUs + RRBs)
    const seenBankLocations = new Set();
    for (const node of rawBanks) {
      const lat = node.lat || node.center?.lat;
      const lon = node.lon || node.center?.lon;
      if (!lat || !lon) continue;

      const tags = node.tags || {};
      const rawName = tags.name || tags["name:en"] || tags.operator || tags.brand || "";
      const classification = classifyInstitution(rawName);
      if (!classification) continue; // Skip private banks and unmatched institutions

      // Spatial deduplication (~100m)
      const locKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
      if (seenBankLocations.has(locKey)) continue;
      seenBankLocations.add(locKey);

      const distance = calculateDistanceKm(userLat, userLng, lat, lon);
      const branchName = tags["addr:street"]
        ? `${classification.matchedName} — ${tags["addr:street"]}`
        : tags.branch
        ? `${classification.matchedName} — ${tags.branch}`
        : `${classification.matchedName} Branch`;

      const address = [
        tags["addr:street"],
        tags["addr:suburb"],
        tags["addr:city"] || tags["addr:district"] || detectedState,
        tags["addr:postcode"]
      ].filter(Boolean).join(", ") || `${classification.matchedName}, near ${detectedState || "Branch"}`;

      const phone = tags.phone || tags["contact:phone"] || classification.helpline || "Toll-free: 1800 1800";
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lon}&travelmode=driving`;

      const isRRB = classification.type === "Regional Rural Bank";
      const schemesAvailable = classification.schemesAvailable || (isRRB
        ? ["mcf", "msy", "term-loan", "green-business"]
        : ["mcf", "msy", "term-loan", "els", "green-business", "suy"]);
      const cats = isRRB
        ? ["micro", "term", "mcf", "msy", "term-loan", "green-business"]
        : ["micro", "term", "education", "mcf", "msy", "term-loan", "els", "green-business", "suy"];

      partners.push({
        id: `live-${node.id}`,
        name: branchName,
        type: classification.type,
        address,
        phone,
        latitude: lat,
        longitude: lon,
        distance,
        directionsUrl,
        cats,
        schemesAvailable,
        status: "available",
        utilizationStatus: "Available (estimated)",
        institutionLabel: "Eligible partner type — confirm enrollment with branch"
      });
    }

    // If live nodes yielded only the SCA or 0 banks, supplement with verified regional directory
    const bankCount = partners.filter(p => p.type !== "State Channelizing Agency").length;
    if (bankCount === 0) {
      const fallbackResult = await getPanIndiaVerifiedFallback(userLat, userLng, detectedState, displayName || city, "all");
      for (const fbPartner of fallbackResult.partners) {
        if (!partners.some(p => p.name === fbPartner.name)) {
          partners.push(fbPartner);
        }
      }
    }

    // Category filter normalization
    const normalizeCategory = (cat) => {
      if (!cat || cat === "all") return "all";
      const l = cat.toLowerCase();
      if (l === "micro" || l === "mcf") return ["micro", "mcf"];
      if (l === "term" || l === "term-loan" || l === "tl") return ["term", "term-loan"];
      if (l === "education" || l === "els" || l === "edu") return ["education", "els"];
      if (l === "msy" || l === "mahila" || l === "women") return ["msy", "women"];
      if (l === "green" || l === "green-business" || l === "gbs") return ["green", "green-business", "gbs"];
      if (l === "suy" || l === "sanitation") return ["suy", "sanitation"];
      if (l === "aajeevika" || l === "amfy") return ["aajeevika", "amfy"];
      return [l];
    };

    let filteredPartners = partners;
    if (categoryFilter !== "all") {
      const targetCats = normalizeCategory(categoryFilter);
      filteredPartners = partners.filter(p => {
        const partnerCats = [...(p.cats || []), ...(p.schemesAvailable || [])];
        return targetCats.some(tc => partnerCats.includes(tc));
      });
    }

    // Ensure strictly no Adi Dravidar / TAHDCO / SCA is included
    filteredPartners = filteredPartners.filter(p => {
      const name = (p.name || "").toLowerCase();
      return !name.includes("adi dravidar") && !name.includes("tahdco") && p.type !== "State Channelizing Agency";
    });

    // Sort ascending by distance (shortest path first)
    filteredPartners.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      isLive: bankCount > 0,
      fallback: bankCount === 0,
      detectedState,
      displayName,
      userLocation: { lat: userLat, lng: userLng },
      sca: null,
      officialScaDirectory: "https://nsfdc.nic.in/our-channel-partners",
      total: filteredPartners.length,
      partners: filteredPartners,
      attribution: "© OpenStreetMap contributors • NSFDC Channel Directory"
    });
  } catch (err) {
    console.error("Live partner lookup error:", err.message);
    try {
      const fallback = await getPanIndiaVerifiedFallback(
        userLat || 11.01515,
        userLng || 76.976618,
        detectedState || "Tamil Nadu",
        city || displayName,
        categoryFilter
      );
      return res.json(fallback);
    } catch (fbErr) {
      res.status(500).json({
        success: false,
        error: `Could not retrieve partner data for this location: ${err.message}.`
      });
    }
  }
});

// 6. GET /api/partners - Legacy / Static Fallback compatibility endpoint
app.get("/api/partners", (req, res) => {
  const userLat = parseFloat(req.query.lat) || 11.01515;
  const userLng = parseFloat(req.query.lng) || 76.976618;
  const categoryFilter = (req.query.category || "all").toLowerCase().trim();
  res.json(getVerifiedCoimbatoreFallback(userLat, userLng, categoryFilter));
});

// 7. POST /api/verify-scheme - Scheme & Lender Verification Checker (Module 5)
app.post("/api/verify-scheme", (req, res) => {
  try {
    const {
      schemeName = "",
      websiteUrl = "",
      lenderName = "",
      upfrontFeeAsked = false,
      urgencyTactics = false,
      otpOrPinRequested = false,
      unverifiableDepartment = false
    } = req.body;

    const result = assessSchemeAndLender({
      schemeName,
      websiteUrl,
      lenderName,
      upfrontFeeAsked: Boolean(upfrontFeeAsked),
      urgencyTactics: Boolean(urgencyTactics),
      otpOrPinRequested: Boolean(otpOrPinRequested),
      unverifiableDepartment: Boolean(unverifiableDepartment)
    });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve frontend in production container
const clientDistPath = path.resolve(__dirname, "../dist");
app.use(express.static(clientDistPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
    if (err) {
      res.status(404).send("Front-end build not found. Running in API-only mode.");
    }
  });
});

app.listen(PORT, () => {
  console.log(`[SahayaSetu Server] Running on http://localhost:${PORT}`);
});
