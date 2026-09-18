import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import db, { initDatabase } from "./db.js";
import { evaluateEligibility } from "./rulesEngine.js";
import { calculateAmortization } from "./financialMath.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database and seed tables
await initDatabase();

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

// 5. GET /api/partners/nearby - Live Location-Aware Channel Partner Directory
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

    // 1. Fetch Official State Channelizing Agency (SCA) for this state
    const sca = await getOfficialStateSCA(detectedState, userLat, userLng);

    // 2. Fetch live bank nodes from Overpass API (multi-mirror) + Nominatim POI fallback
    let rawBanks = [];
    try {
      rawBanks = await fetchLiveBanksAnywhere(userLat, userLng, displayName || city || detectedState);
    } catch (bankErr) {
      console.warn("[Live Banks fetch warning]:", bankErr.message);
    }

    const partners = [];

    // Add SCA if found
    if (sca) {
      const scaDist = calculateDistanceKm(userLat, userLng, sca.latitude, sca.longitude);
      const scaDirections = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${sca.latitude},${sca.longitude}&travelmode=driving`;
      sca.directionsUrl = scaDirections;
      sca.distance = scaDist;

      const scaSchemes = ["mcf", "msy", "term-loan", "els", "green-business", "suy"];
      partners.push({
        id: `sca-${sca.id}`,
        name: sca.name,
        shortName: sca.shortName || sca.name,
        type: "State Channelizing Agency",
        address: sca.address,
        phone: sca.phone,
        email: sca.email,
        website: sca.website,
        latitude: sca.latitude,
        longitude: sca.longitude,
        distance: scaDist,
        directionsUrl: scaDirections,
        cats: ["micro", "term", "education", "mcf", "msy", "term-loan", "els", "green-business", "suy"],
        schemesAvailable: scaSchemes,
        status: "available",
        utilizationStatus: "Available (estimated)",
        institutionLabel: "Official State Channelizing Agency"
      });
    }

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

    // Sort ascending by distance (shortest path first)
    filteredPartners.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      isLive: bankCount > 0,
      fallback: bankCount === 0,
      detectedState,
      displayName,
      userLocation: { lat: userLat, lng: userLng },
      sca,
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
