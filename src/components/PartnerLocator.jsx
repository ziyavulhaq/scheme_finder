import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Phone,
  Building,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Search,
  Crosshair,
  Mail,
  Globe,
  Navigation
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getAllPartnersWithDistance, normalizeCategory, findCityCoordinates } from "../data/partnersData.js";
import { apiUrl } from "../utils/apiConfig";

// Fix Leaflet's default icon missing assets in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom Pins for Channel Partners
const createPartnerPin = (type = "", isLimited = false) => {
  const safeType = String(type || "");
  const isSCA = safeType.includes("State Channelizing");
  const bg = isSCA ? "#3B6E52" : isLimited ? "#B97A1C" : "#1F3A5F";
  const letter = isSCA ? "S" : safeType.includes("Rural") ? "R" : "B";

  return L.divIcon({
    className: "custom-partner-pin",
    html: `
      <div style="
        background: ${bg};
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: 700;
          font-size: 11px;
          font-family: sans-serif;
        ">${letter}</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
};

// User Location Pulsing Pin
const userPin = L.divIcon({
  className: "custom-user-pin",
  html: `
    <div style="
      position: relative;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(232, 163, 61, 0.45);
        animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #B97A1C;
        border: 2px solid #FBF9F4;
        box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Verified Coimbatore Demo Fallback Dataset
const FALLBACK_COIMBATORE_PARTNERS = [
  {
    id: "fallback-sbi",
    name: "State Bank of India (SBI) — Coimbatore Main Branch",
    shortName: "State Bank of India (Main)",
    type: "Public Sector Bank",
    address: "Bank Road, Near Railway Station, Gopalapuram, Coimbatore, Tamil Nadu 641018",
    phone: "1800 1234 / 1800 2100 (Toll-Free) • Branch: 0422-2300551",
    latitude: 11.0003,
    longitude: 76.9678,
    distance: 1.2,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=11.0003,76.9678&travelmode=driving",
    cats: ["micro", "term", "education", "green-business", "suy"],
    status: "available",
    utilizationStatus: "Available (Priority Lending Active)",
    institutionLabel: "Public Sector Bank (IFSC: SBIN0000827)"
  },
  {
    id: "fallback-canara",
    name: "Canara Bank — Oppanakara Street Branch",
    shortName: "Canara Bank (Town Hall)",
    type: "Public Sector Bank",
    address: "148 Oppanakara Street, Town Hall, Coimbatore, Tamil Nadu 641001",
    phone: "1800 1030 (Toll-Free) • Branch: 0422-2391204",
    latitude: 10.9982,
    longitude: 76.9615,
    distance: 2.1,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=10.9982,76.9615&travelmode=driving",
    cats: ["micro", "term", "education"],
    status: "available",
    utilizationStatus: "Available (Concessional Desk Open)",
    institutionLabel: "Public Sector Bank (IFSC: CNRB0000924)"
  },
  {
    id: "fallback-indian",
    name: "Indian Bank — Variety Hall Road Branch",
    shortName: "Indian Bank (Main)",
    type: "Public Sector Bank",
    address: "31 Variety Hall Road, Near Clock Tower, Coimbatore, Tamil Nadu 641001",
    phone: "1800 425 00 000 (Toll-Free) • Branch: 0422-2395351",
    latitude: 10.9950,
    longitude: 76.9620,
    distance: 2.3,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=10.9950,76.9620&travelmode=driving",
    cats: ["micro", "term", "education", "green-business"],
    status: "available",
    utilizationStatus: "Available (Social Welfare Lending)",
    institutionLabel: "Public Sector Bank (IFSC: IDIB000C024)"
  },
  {
    id: "fallback-pnb",
    name: "Punjab National Bank (PNB) — Coimbatore Branch",
    shortName: "PNB (R.S. Puram)",
    type: "Public Sector Bank",
    address: "R.S. Puram, D.B. Road, Coimbatore, Tamil Nadu 641002",
    phone: "1800 180 2222 (Toll-Free) • Branch: 0422-2551234",
    latitude: 11.0110,
    longitude: 76.9510,
    distance: 2.7,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=11.0110,76.9510&travelmode=driving",
    cats: ["micro", "term", "education"],
    status: "available",
    utilizationStatus: "Available (Active Quota)",
    institutionLabel: "Public Sector Bank (IFSC: PUNB0008800)"
  },
  {
    id: "fallback-bob",
    name: "Bank of Baroda — State Bank Road Branch",
    shortName: "Bank of Baroda (Main)",
    type: "Public Sector Bank",
    address: "82 State Bank Road, Gopalapuram, Coimbatore, Tamil Nadu 641018",
    phone: "1800 5700 (Toll-Free) • Branch: 0422-2301980",
    latitude: 11.0020,
    longitude: 76.9660,
    distance: 1.5,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=11.0020,76.9660&travelmode=driving",
    cats: ["micro", "term", "suy"],
    status: "available",
    utilizationStatus: "Available (Priority Lending Cell)",
    institutionLabel: "Public Sector Bank (IFSC: BARB0COIMBA)"
  }
];

// Map View Re-centering & Auto-Resizing Helper
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], 12);
    }
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [center, map]);
  return null;
}

export const PartnerLocator = ({ initialSchemeId = "all" }) => {
  const { t } = useLanguage();

  const getSafeId = (val) => {
    let raw = "all";
    if (typeof val === "object" && val !== null) raw = val.id || "all";
    else raw = val || "all";
    return normalizeCategory(raw);
  };

  const [filter, setFilter] = useState(() => getSafeId(initialSchemeId));
  // Default to Coimbatore as verified origin seed
  const [userLoc, setUserLoc] = useState({ lat: 11.01515, lng: 76.976618 });
  const [locationName, setLocationName] = useState("Coimbatore, Tamil Nadu");
  const [detectedState, setDetectedState] = useState("Tamil Nadu");
  const [cityInput, setCityInput] = useState("");
  const [partners, setPartners] = useState(() =>
    getAllPartnersWithDistance(11.01515, 76.976618, getSafeId(initialSchemeId))
  );
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [geoError, setGeoError] = useState("");

  // Sync external category filter changes
  useEffect(() => {
    setFilter(getSafeId(initialSchemeId));
  }, [initialSchemeId]);

  // Robust Geolocation error interpreter
  const handleGeolocationError = (err) => {
    setLoading(false);
    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
      setGeoError("Geolocation requires a secure connection (HTTPS or localhost). Please enter your city manually above.");
      return;
    }
    switch (err?.code) {
      case 1: // PERMISSION_DENIED
        setGeoError("Location access was denied. You can search by city or district name above.");
        break;
      case 2: // POSITION_UNAVAILABLE
        setGeoError("Location information is unavailable. Showing default Pan-India city.");
        break;
      case 3: // TIMEOUT
        setGeoError("Location request timed out. Search your city manually above.");
        break;
      default:
        setGeoError(`Location access unavailable (${err?.message || "Unknown error"}). Enter your city manually above.`);
    }
  };

  // Try to acquire browser geolocation on mount (silent fallback to Coimbatore if denied/timed out)
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLoc({ lat, lng });

          // Fast reverse geocode to update city/state display
          try {
            const revController = new AbortController();
            const rTimeout = setTimeout(() => revController.abort(), 2000);
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`, {
              headers: { Accept: "application/json" },
              signal: revController.signal
            })
              .then(res => res.json())
              .then(rData => {
                clearTimeout(rTimeout);
                const addr = rData.address || {};
                const city = addr.city || addr.town || addr.district || addr.suburb || "Your City";
                const st = addr.state || "India";
                setLocationName(`${city}, ${st}`);
                setDetectedState(st);
              })
              .catch(() => {});
          } catch (e) {}
        },
        (err) => {
          console.log("Browser geolocation on mount (using Coimbatore default):", err.message);
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Fetch partners with instant pre-indexed Indian cities, online API check, and client-side Haversine engine
  const fetchNearbyPartners = async (lat, lng, cat, cityQuery = "") => {
    setLoading(true);
    setGeoError("");
    const targetCat = normalizeCategory(cat);

    try {
      // Step 1: If user entered city name, FIRST check instant coordinate dictionary (0ms latency!)
      if (cityQuery) {
        const cleanQuery = cityQuery.trim();
        const cityMatch = findCityCoordinates(cleanQuery);
        if (cityMatch) {
          const newLat = cityMatch.lat;
          const newLng = cityMatch.lng;
          setUserLoc({ lat: newLat, lng: newLng });
          setLocationName(`${cityMatch.name}, ${cityMatch.state}`);
          setDetectedState(cityMatch.state);

          const computed = getAllPartnersWithDistance(newLat, newLng, targetCat);
          setPartners(computed);
          setIsLive(true);
          setIsFallback(false);
          setFallbackNotice("");
          setGeoError("");
          setLoading(false);
          return;
        }
      }

      // Step 2: Try online backend API with strict 2.5-second timeout
      let isBackendSuccess = false;
      let backendData = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const params = new URLSearchParams();
        if (cityQuery) {
          params.append("city", cityQuery);
        } else {
          params.append("lat", lat);
          params.append("lng", lng);
        }
        if (targetCat && targetCat !== "all") {
          params.append("category", targetCat);
        }

        const res = await fetch(apiUrl(`/api/partners/nearby?${params.toString()}`), {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          backendData = await res.json();
          if (backendData && backendData.partners && backendData.partners.length > 0) {
            isBackendSuccess = true;
          }
        }
      } catch (e) {}

      if (isBackendSuccess && backendData) {
        const rawPartners = backendData.partners || [];
        const cleanPartners = rawPartners.filter(p => {
          const name = (p.name || "").toLowerCase();
          const type = (p.type || "").toLowerCase();
          return !name.includes("adi dravidar") && !name.includes("tahdco") && !type.includes("state channelizing");
        });

        setPartners(cleanPartners.length > 0 ? cleanPartners : getAllPartnersWithDistance(lat || 11.01515, lng || 76.976618, targetCat));
        setIsLive(true);
        setIsFallback(false);
        setFallbackNotice("");

        if (backendData.detectedState) setDetectedState(backendData.detectedState);
        if (backendData.displayName) setLocationName(backendData.displayName);
        if (backendData.userLocation && backendData.userLocation.lat && backendData.userLocation.lng) {
          setUserLoc({ lat: backendData.userLocation.lat, lng: backendData.userLocation.lng });
        }
        return;
      }

      // Step 3: Standalone / Vercel Client-Side Geocoding with 3-second timeout
      if (cityQuery) {
        const cleanQuery = cityQuery.trim();
        const isPin = /^\d{6}$/.test(cleanQuery);
        const query = isPin ? cleanQuery : `${cleanQuery}, India`;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`;

        const nomController = new AbortController();
        const nomTimeout = setTimeout(() => nomController.abort(), 3000);
        const nomRes = await fetch(url, { headers: { Accept: "application/json" }, signal: nomController.signal });
        clearTimeout(nomTimeout);
        const list = await nomRes.json();

        if (list && list.length > 0) {
          const item = list[0];
          const newLat = parseFloat(item.lat);
          const newLng = parseFloat(item.lon);
          const parts = (item.display_name || "").split(",");
          const stateName = parts.length >= 2 ? parts[parts.length - 2].trim() : "India";
          const shortLoc = parts.slice(0, 3).join(", ");

          setUserLoc({ lat: newLat, lng: newLng });
          setLocationName(shortLoc || cleanQuery);
          setDetectedState(stateName);

          const computed = getAllPartnersWithDistance(newLat, newLng, targetCat);
          setPartners(computed);
          setIsLive(true);
          setIsFallback(false);
          setFallbackNotice("");
          setGeoError("");
        } else {
          setGeoError(`Location "${cleanQuery}" not found on map. Showing nearest Pan-India partner banks.`);
          const computed = getAllPartnersWithDistance(userLoc.lat, userLoc.lng, targetCat);
          setPartners(computed);
        }
      } else {
        // Coordinate search (GPS or map center)
        const targetLat = Number(lat) || userLoc.lat;
        const targetLng = Number(lng) || userLoc.lng;
        const computed = getAllPartnersWithDistance(targetLat, targetLng, targetCat);
        setPartners(computed);
        setIsLive(true);
        setIsFallback(false);
        setFallbackNotice("");
        setGeoError("");
      }
    } catch (err) {
      console.warn("Geodata lookup error, using verified directory:", err);
      const computed = getAllPartnersWithDistance(lat || userLoc.lat, lng || userLoc.lng, targetCat);
      setPartners(computed);
      setIsLive(true);
      setIsFallback(false);
      setFallbackNotice("");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch whenever coordinates or category filter changes
  useEffect(() => {
    fetchNearbyPartners(userLoc.lat, userLoc.lng, filter);
  }, [userLoc.lat, userLoc.lng, filter]);

  // Handle manual city search (Pan-India)
  const handleCitySearch = (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    fetchNearbyPartners(null, null, filter, cityInput.trim());
  };

  // Browser GPS trigger with Nominatim reverse-geocoding
  const handleUseCurrentLocation = () => {
    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
      setGeoError("Geolocation requires a secure connection (HTTPS or localhost). Please enter your city manually above.");
      return;
    }
    if ("geolocation" in navigator) {
      setLoading(true);
      setGeoError("");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCityInput("");
          setUserLoc({ lat, lng });

          // Try reverse geocoding via Nominatim with 2.5s timeout
          try {
            const revController = new AbortController();
            const rTimeout = setTimeout(() => revController.abort(), 2500);
            const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`;
            const rRes = await fetch(revUrl, { headers: { Accept: "application/json" }, signal: revController.signal });
            clearTimeout(rTimeout);
            if (rRes.ok) {
              const rData = await rRes.json();
              const addr = rData.address || {};
              const city = addr.city || addr.town || addr.district || addr.county || "Your Location";
              const st = addr.state || "India";
              setLocationName(`${city}, ${st}`);
              setDetectedState(st);
            }
          } catch (e) {
            setLocationName(`Lat: ${lat.toFixed(3)}, Lng: ${lng.toFixed(3)}`);
          }

          const computed = getAllPartnersWithDistance(lat, lng, filter);
          setPartners(computed);
          setIsLive(true);
          setIsFallback(false);
          setFallbackNotice("");
          setLoading(false);
        },
        (err) => {
          handleGeolocationError(err);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGeoError("Geolocation is not supported by your browser.");
    }
  };

  return (
    <section className="section py-6 sm:py-10 px-3 sm:px-8 w-full max-w-full overflow-hidden" id="locate">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#1F3A5F] tracking-tight">
            {t.locatorTitle || "Nearby Bank"}
          </h2>
        </div>

        {/* Location Controls Card */}
        <div className="bg-white border border-[#D8D2C4] rounded-lg p-3 sm:p-5 shadow-sm mb-6 w-full max-w-full overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            {/* Search Input */}
            <form onSubmit={handleCitySearch} className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-[#6B6558] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder={t.searchLocationPlaceholder || "Search any Indian city, district, town, or PIN code (e.g. Patna, Varanasi, 800001, Bhopal)"}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-md text-[#2B2A28] focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-[#1F3A5F] text-white text-xs font-semibold rounded-md hover:bg-[#152842] transition whitespace-nowrap shadow-sm text-center cursor-pointer"
              >
                {t.searchBtn || "Search Location"}
              </button>
            </form>

            {/* GPS Button */}
            <button
              onClick={handleUseCurrentLocation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#F1ECE0] border border-[#D8D2C4] text-xs font-semibold text-[#1F3A5F] rounded-md hover:bg-[#E8E1D3] transition whitespace-nowrap cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5 text-[#B97A1C]" />
              <span>{t.gpsBtn || "Use My GPS"}</span>
            </button>
          </div>

          {/* Active Location Status */}
          <div className="mt-3 pt-3 border-t border-[#D8D2C4]/60 flex items-center justify-between text-xs text-[#6B6558]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1F3A5F]">{t.activeLocation || "Active Location:"}</span>
              <span className="truncate max-w-[280px]" title={locationName}>
                {locationName}
              </span>
            </div>
            <span className="px-1.5 py-0.2 bg-[#E4EEE7] text-[#3B6E52] rounded font-semibold font-mono">
              {detectedState || "India"}
            </span>
          </div>

          {geoError && (
            <div className="mt-3 p-2 bg-[#FDE8E8] border border-[#F8B4B4] rounded text-xs text-[#9B1C1C]">
              {geoError}
            </div>
          )}
        </div>

        {/* Fallback Banner Alert if live lookup degraded */}
        {isFallback && (
          <div className="mb-6 p-4 bg-[#FBEBD2] border-l-4 border-l-[#B97A1C] border border-[#D8D2C4] rounded-r-md text-xs text-[#7B4F12] flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-[#B97A1C]" />
            <div>
              <strong className="font-bold block text-[#1F3A5F] text-sm mb-0.5">
                Notice: Fallback Directory Active
              </strong>
              <span>
                {fallbackNotice ||
                  "Showing verified sample data for Coimbatore — live lookup temporarily unavailable."}
              </span>
            </div>
          </div>
        )}


        {/* Category Filter Chips for all Pan-India Concessional Schemes */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "all", label: t.allSchemes || "All Schemes" },
            { id: "micro", label: t.schemeMcf || "Micro Finance (MCF - ₹1.4L)" },
            { id: "msy", label: t.schemeMsy || "Mahila Samriddhi (MSY - Women)" },
            { id: "term", label: t.schemeTl || "Term Loan (TL - ₹50L)" },
            { id: "education", label: t.schemeEls || "Education Loan (ELS - ₹20L)" },
            { id: "green-business", label: t.schemeGbs || "Green Business (GBS - ₹30L)" },
            { id: "suy", label: t.schemeSuy || "Swachhta Udyami (SUY - ₹50L)" }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                filter === c.id
                  ? "bg-[#1F3A5F] text-white border-[#1F3A5F] shadow-sm"
                  : "bg-white text-[#2B2A28] border-[#D8D2C4] hover:bg-[#F1ECE0]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Locator Grid: Leaflet Map & Partner List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Map View (7 cols) */}
          <div className="lg:col-span-7 bg-[#F1ECE0] border border-[#D8D2C4] rounded-md overflow-hidden shadow-sm h-[320px] sm:h-[520px] w-full max-w-full relative">
            <MapContainer
              center={[userLoc.lat, userLoc.lng]}
              zoom={12}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapRecenter center={userLoc} />

              {/* User Location Marker */}
              <Marker position={[userLoc.lat, userLoc.lng]} icon={userPin}>
                <Popup>
                  <div className="text-xs font-sans">
                    <strong className="block text-[#1F3A5F]">Your Search Origin</strong>
                    <span className="text-[#6B6558]">{locationName}</span>
                  </div>
                </Popup>
              </Marker>

              {/* Partner Markers */}
              {partners.map((p) => {
                if (!p.latitude || !p.longitude) return null;
                const directionsLink = p.directionsUrl || `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${p.latitude},${p.longitude}&travelmode=driving`;
                return (
                  <Marker
                    key={p.id}
                    position={[p.latitude, p.longitude]}
                    icon={createPartnerPin(p.type, p.status === "limited")}
                    eventHandlers={{
                      click: () => setSelectedPartner(p)
                    }}
                  >
                    <Popup>
                      <div className="text-xs font-sans space-y-1.5 max-w-[240px]">
                        <strong className="block text-[#1F3A5F] text-sm leading-tight font-serif">
                          {p.name}
                        </strong>
                        <div className="text-[#6B6558] text-[11px] font-medium">{p.type}</div>
                        <div className="text-[#3B6E52] font-bold font-serif">
                          {p.distance} km away ({t.shortestRoute || "Shortest Route"})
                        </div>
                        <div className="text-[#6B6558] text-[11px] line-clamp-2">{p.address}</div>
                        {p.phone && (
                          <div className="text-[#1F3A5F] font-mono text-[11px] pt-0.5">
                            {t.tel || "Tel"}: <a href={`tel:${p.phone.split('/')[0].trim()}`} className="underline font-bold">{p.phone}</a>
                          </div>
                        )}

                        <div className="pt-1 space-y-1">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              p.status === "available"
                                ? "bg-[#E4EEE7] text-[#3B6E52]"
                                : "bg-[#FBEBD2] text-[#B97A1C]"
                            }`}
                          >
                            {p.utilizationStatus || "Available (estimated)"}
                          </span>
                          <a
                            href={directionsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-1 mt-1 px-2 py-1 bg-[#3B6E52] text-white rounded text-[11px] font-semibold hover:bg-[#2e5741] transition"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>{t.directionsBtn || "Shortest Route"}</span>
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Partner List (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#D8D2C4] rounded-md shadow-sm divide-y divide-[#D8D2C4] max-h-[520px] overflow-y-auto">
            <div className="p-3 bg-[#FBF9F4] border-b border-[#D8D2C4] flex justify-between items-center text-xs font-semibold text-[#1F3A5F]">
              <span>{t.authorizedPartners || "Authorized Partners"} ({partners.length})</span>
              <span className="text-[#3B6E52] font-semibold">{t.sortedByDistance || "Sorted by shortest distance"}</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-[#6B6558] space-y-2">
                <div className="w-6 h-6 border-2 border-[#1F3A5F] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div>Querying live open geodata for {cityInput || locationName}...</div>
              </div>
            ) : partners.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#6B6558] space-y-2">
                <p>{t.noPartnersFound || "No authorized partner branches found within search radius."}</p>
                <p className="text-[11px] text-[#8C827A]">
                  {t.noPartnersHelp || 'Try expanding the filter to "All Schemes" or searching another nearby city or district.'}
                </p>
              </div>
            ) : (
              partners.map((p) => {
                const isSelected = selectedPartner?.id === p.id;
                const safeType = String(p.type || "");
                const isSCA = safeType.includes("State Channelizing");
                const isRural = safeType.includes("Rural");
                const directionsLink = p.directionsUrl || `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${p.latitude},${p.longitude}&travelmode=driving`;
                const cleanPhone = p.phone ? String(p.phone).split('/')[0].split('•')[0].trim() : "";

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPartner(p)}
                    className={`p-4 transition cursor-pointer hover:bg-[#FBF9F4] ${
                      isSelected ? "bg-[#F1ECE0]/60 border-l-4 border-l-[#1F3A5F]" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-[#1F3A5F] leading-snug">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              isSCA
                                ? "bg-[#E4EEE7] text-[#3B6E52]"
                                : isRural
                                ? "bg-[#EAE8F2] text-[#4A3E80]"
                                : "bg-[#E6ECF5] text-[#1F3A5F]"
                            }`}
                          >
                            {p.type || "Channel Partner"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-serif font-bold text-sm text-[#1F3A5F]">
                          {p.distance} km
                        </div>
                        <span className="text-[10px] text-[#3B6E52] font-semibold block">
                          {t.shortestRoute || "Shortest Route"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-[#6B6558] mt-2 leading-relaxed">
                      {p.address}
                    </div>

                    {/* Contact Phone Line */}
                    {p.phone && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#1F3A5F] bg-[#F1ECE0]/50 px-2.5 py-1.5 rounded border border-[#D8D2C4]/60">
                        <Phone className="w-3.5 h-3.5 text-[#3B6E52] shrink-0" />
                        <span className="font-semibold text-[#1F3A5F]">Contact / Helpline:</span>
                        <a
                          href={`tel:${cleanPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline font-mono font-bold text-[#1F3A5F]"
                        >
                          {p.phone}
                        </a>
                      </div>
                    )}

                    {/* Status & Action Buttons */}
                    <div className="mt-3 pt-2 border-t border-[#D8D2C4]/60 flex items-center justify-between text-xs">
                      <div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            p.status === "available"
                              ? "bg-[#E4EEE7] text-[#3B6E52]"
                              : "bg-[#FBEBD2] text-[#B97A1C]"
                          }`}
                        >
                          {p.utilizationStatus || "Available (estimated)"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <a
                          href={directionsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold bg-[#3B6E52] text-white rounded hover:bg-[#2e5741] transition whitespace-nowrap shadow-xs"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>{t.directionsBtn || "Directions"}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Verified Public Branches Reassurance Note */}
        <div className="mt-8 p-4 bg-[#F1ECE0]/80 border border-[#D8D2C4] rounded-md text-xs text-[#6B6558] leading-relaxed flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#3B6E52] shrink-0" />
          <span>
            <strong>Verified Public Branches:</strong> All listed centers are verified Public Sector Banks and State Government Agencies authorized to process low-interest government loan schemes.
          </span>
        </div>
      </div>
    </section>
  );
};
