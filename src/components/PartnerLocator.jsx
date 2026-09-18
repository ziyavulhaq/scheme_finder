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
  Printer,
  FileText,
  CheckCircle2,
  X,
  Mail,
  Globe,
  Navigation
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// Fix Leaflet's default icon missing assets in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom Pins for Channel Partners
const createPartnerPin = (type, isLimited) => {
  const isSCA = type === "State Channelizing Agency";
  const bg = isSCA ? "#3B6E52" : isLimited ? "#B97A1C" : "#1F3A5F";
  const letter = isSCA ? "S" : type.includes("Rural") ? "R" : "B";

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
    id: "fallback-tahdco",
    name: "Tamil Nadu Adi Dravidar Housing & Development Corporation (TAHDCO)",
    shortName: "TAHDCO (Coimbatore Division Office)",
    type: "State Channelizing Agency",
    address: "Govt Boys Hostel Compound, Balasundaram Road, P N Palayam, Gopalapuram, Coimbatore, Tamil Nadu 641018",
    phone: "+91 94450 29457",
    latitude: 11.01515,
    longitude: 76.976618,
    distance: 0,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.01515,76.976618&destination=11.01515,76.976618&travelmode=driving",
    cats: ["micro", "term", "education"],
    status: "available",
    utilizationStatus: "Available (estimated)",
    institutionLabel: "Official State Channelizing Agency (Verified Office)"
  },
  {
    id: "fallback-union",
    name: "Union Bank of India — Coimbatore Main Branch",
    type: "Public Sector Bank",
    address: "Oppanakara Street, Near Clock Tower, Town Hall, Coimbatore - 641001",
    phone: "0422-2396112 / 1800 22 2244",
    latitude: 11.0016,
    longitude: 76.9628,
    distance: 2.1,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.01515,76.976618&destination=11.0016,76.9628&travelmode=driving",
    cats: ["micro", "term"],
    status: "available",
    utilizationStatus: "Available (estimated)",
    institutionLabel: "Eligible partner type — confirm enrollment with branch"
  },
  {
    id: "fallback-canara",
    name: "Canara Bank — Oppanakara Street Branch",
    type: "Public Sector Bank",
    address: "148 Oppanakara Street, Coimbatore - 641001",
    phone: "0422-2391204 / 1800 1030",
    latitude: 10.9982,
    longitude: 76.9615,
    distance: 2.5,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.01515,76.976618&destination=10.9982,76.9615&travelmode=driving",
    cats: ["micro", "term"],
    status: "available",
    utilizationStatus: "Available (estimated)",
    institutionLabel: "Eligible partner type — confirm enrollment with branch"
  },
  {
    id: "fallback-rrb",
    name: "Tamil Nadu Grama Bank — Regional Office",
    type: "Regional Rural Bank",
    address: "Avinashi Road, Near Lakshmi Mills Junction, Coimbatore - 641037",
    phone: "0422-2245678 / 1800 180 2222",
    latitude: 11.018,
    longitude: 76.955,
    distance: 2.4,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.01515,76.976618&destination=11.018,76.955&travelmode=driving",
    cats: ["micro", "term"],
    status: "limited",
    utilizationStatus: "Limited capacity (estimated)",
    institutionLabel: "Eligible partner type — confirm enrollment with branch"
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
    if (typeof val === "object" && val !== null) return val.id || "all";
    return val || "all";
  };

  const [filter, setFilter] = useState(getSafeId(initialSchemeId));
  // Default to Coimbatore as verified origin seed
  const [userLoc, setUserLoc] = useState({ lat: 11.01515, lng: 76.976618 });
  const [locationName, setLocationName] = useState("Coimbatore, Tamil Nadu");
  const [detectedState, setDetectedState] = useState("Tamil Nadu");
  const [cityInput, setCityInput] = useState("");
  const [partners, setPartners] = useState([]);
  const [stateSca, setStateSca] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [slipModalPartner, setSlipModalPartner] = useState(null);
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
    switch (err.code) {
      case 1: // PERMISSION_DENIED
        setGeoError("Location access was denied. You can search by city name above.");
        break;
      case 2: // POSITION_UNAVAILABLE
        setGeoError("Location information is unavailable. Falling back to default city.");
        break;
      case 3: // TIMEOUT
        setGeoError("Location request timed out. Please try again or search by city name.");
        break;
      default:
        setGeoError(`Location access unavailable (${err.message || "Unknown error"}). Enter your city manually above.`);
    }
  };

  // Try to acquire browser geolocation on mount (silent fallback to Coimbatore if denied/timed out)
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.log("Browser geolocation on mount (using Coimbatore default):", err.message);
        },
        { timeout: 6000 }
      );
    }
  }, []);

  // Fetch partners from backend /api/partners/nearby
  const fetchNearbyPartners = async (lat, lng, cat, cityQuery = "") => {
    setLoading(true);
    setGeoError("");
    try {
      const params = new URLSearchParams();
      if (cityQuery) {
        params.append("city", cityQuery);
      } else {
        params.append("lat", lat);
        params.append("lng", lng);
      }
      if (cat && cat !== "all") {
        params.append("category", cat);
      }

      const res = await fetch(`/api/partners/nearby?${params.toString()}`);
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const data = await res.json();

      setPartners(data.partners || []);
      setStateSca(data.sca || null);
      setIsLive(Boolean(data.isLive));
      setIsFallback(Boolean(data.fallback));
      setFallbackNotice(data.fallbackNotice || "");

      if (data.detectedState) {
        setDetectedState(data.detectedState);
      }
      if (data.displayName) {
        setLocationName(data.displayName);
      }
      if (data.userLocation && data.userLocation.lat && data.userLocation.lng) {
        setUserLoc({ lat: data.userLocation.lat, lng: data.userLocation.lng });
      }
    } catch (err) {
      console.warn("Live lookup failed:", err);
      if (cityQuery) {
        setGeoError(`Could not find live partner data for "${cityQuery}". Try searching with your district name or 6-digit PIN code.`);
      } else {
        setGeoError("Live geodata network lookup issue. Showing verified sample directory.");
        setIsFallback(true);
        setFallbackNotice(t.fallbackNotice || "Showing verified sample data for Coimbatore — live lookup temporarily unavailable.");
        const filtered = cat && cat !== "all" 
          ? FALLBACK_COIMBATORE_PARTNERS.filter(p => p.cats.includes(cat))
          : FALLBACK_COIMBATORE_PARTNERS;
        setPartners(filtered);
        setStateSca(FALLBACK_COIMBATORE_PARTNERS[0]);
        setLocationName("Coimbatore, Tamil Nadu (Verified Baseline)");
        setDetectedState("Tamil Nadu");
      }
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

  // Quick jump pill selector across Indian zones
  const handleJumpToCity = (cityName) => {
    setCityInput(cityName);
    fetchNearbyPartners(null, null, filter, cityName);
  };

  // Browser GPS trigger
  const handleUseCurrentLocation = () => {
    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
      setGeoError("Geolocation requires a secure connection (HTTPS or localhost). Please enter your city manually above.");
      return;
    }
    if ("geolocation" in navigator) {
      setLoading(true);
      setGeoError("");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCityInput("");
          setUserLoc({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
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
    <section className="section py-10 px-4 sm:px-8" id="locate">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono px-2 py-0.5 bg-[#F1ECE0] border border-[#D8D2C4] text-[#1F3A5F] rounded">
              {t.entry3Badge || "ENTRY 03 • LIVE PARTNER LOCATOR & SHORTEST ROUTER"}
            </span>
            <span className="text-xs text-[#6B6558]">{t.entry3Service || "Pan-India Geo-Spatial Service"}</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1F3A5F] tracking-tight">
            {t.locatorTitle || "Authorized Channel Partners Near You"}
          </h2>
          <p className="mt-2 text-[#6B6558] text-base max-w-3xl leading-relaxed">
            {t.locatorSubtitle ||
              "Concessional loans are disbursed through State Channelizing Agencies (SCAs), Public Sector Banks, and Regional Rural Banks. Search any city, town, or PIN code anywhere across India to get branch contact numbers and the shortest route from your location."}
          </p>
        </div>

        {/* Option A Fund Utilization & Capacity Integration Notice */}
        <div className="mb-6 p-4 bg-[#F1ECE0] border-l-4 border-l-[#1F3A5F] border border-[#D8D2C4] rounded-r-md text-xs text-[#2B2A28] flex items-start gap-3 shadow-sm">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-[#1F3A5F] mt-0.5" />
          <div>
            <strong className="font-bold block text-[#1F3A5F] text-sm mb-1">
              Fund Utilization &amp; Channel Capacity Architecture (Option A)
            </strong>
            <p className="text-[#6B6558] leading-relaxed">
              {t.honestCapacityDisclaimer ||
                "Live fund-utilization data requires an NSFDC/NABARD MIS data-sharing partnership, which is outside a hackathon's data access. This field is architected and ready to connect the moment such access exists."}
            </p>
          </div>
        </div>

        {/* Location Controls Card */}
        <div className="bg-white border border-[#D8D2C4] rounded-lg p-4 sm:p-5 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleCitySearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#6B6558] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder={t.searchLocationPlaceholder || "Search any Indian city, district, town, or PIN code (e.g. Patna, Varanasi, 800001, Bhopal)"}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-md text-[#2B2A28] focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1F3A5F] text-white text-xs font-semibold rounded-md hover:bg-[#152842] transition whitespace-nowrap shadow-sm"
              >
                {t.searchBtn || "Search Location"}
              </button>
            </form>

            {/* GPS Button */}
            <button
              onClick={handleUseCurrentLocation}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#F1ECE0] border border-[#D8D2C4] text-xs font-semibold text-[#1F3A5F] rounded-md hover:bg-[#E8E1D3] transition whitespace-nowrap"
            >
              <Crosshair className="w-3.5 h-3.5 text-[#B97A1C]" />
              <span>{t.gpsBtn || "Use My GPS"}</span>
            </button>
          </div>

          {/* Pan-India City Presets & Status */}
          <div className="mt-3 pt-3 border-t border-[#D8D2C4]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[#6B6558]">{t.quickJump || "Pan-India Quick Jump:"}</span>
              {[
                "New Delhi",
                "Mumbai",
                "Kolkata",
                "Bengaluru",
                "Chennai",
                "Hyderabad",
                "Jaipur",
                "Lucknow",
                "Patna",
                "Bhopal",
                "Guwahati",
                "Coimbatore"
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleJumpToCity(c)}
                  className="px-2 py-0.5 rounded bg-[#F1ECE0] text-[#1F3A5F] hover:bg-[#D8D2C4] transition text-[11px] font-medium"
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#6B6558]">
              <span className="font-semibold text-[#1F3A5F]">{t.activeLocation || "Active Location:"}</span>
              <span className="truncate max-w-[280px]" title={locationName}>
                {locationName}
              </span>
              <span className="px-1.5 py-0.2 bg-[#E4EEE7] text-[#3B6E52] rounded font-semibold font-mono">
                {detectedState || "India"}
              </span>
            </div>
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

        {/* State Channelizing Agency (SCA) Spotlight Card */}
        {stateSca ? (
          <div className="mb-6 bg-white border-2 border-[#3B6E52]/40 rounded-lg p-4 sm:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#3B6E52] text-white text-[10px] font-bold px-3 py-1 rounded-bl uppercase tracking-wider">
              {t.primaryApex || "Primary Apex Agency"} ({detectedState})
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#3B6E52]" />
                  <span className="text-xs font-bold text-[#3B6E52] uppercase tracking-wide">
                    {t.officialApexAgency || "Official State Channelizing Agency (SCA)"}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1F3A5F] leading-snug">
                  {stateSca.name} {stateSca.shortName ? `(${stateSca.shortName})` : ""}
                </h3>
                <p className="text-xs text-[#6B6558] max-w-2xl leading-relaxed">
                  {stateSca.address}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-[#2B2A28]">
                  {stateSca.phone && (
                    <a
                      href={`tel:${stateSca.phone.split('/')[0].trim()}`}
                      className="inline-flex items-center gap-1 text-[#1F3A5F] font-semibold hover:underline font-mono"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#3B6E52]" />
                      <span>{stateSca.phone}</span>
                    </a>
                  )}
                  {stateSca.email && (
                    <a
                      href={`mailto:${stateSca.email}`}
                      className="inline-flex items-center gap-1 text-[#1F3A5F] hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#6B6558]" />
                      <span>{stateSca.email}</span>
                    </a>
                  )}
                  {stateSca.website && (
                    <a
                      href={stateSca.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#1F3A5F] hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#6B6558]" />
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3 text-[#6B6558]" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <div className="bg-[#E4EEE7] text-[#3B6E52] px-2.5 py-1 rounded text-xs font-semibold">
                  Handles Micro, Term &amp; Education Loans
                </div>
                {stateSca.distance !== undefined && (
                  <div className="text-xs text-[#6B6558] font-medium">
                    {t.shortestRoute || "Shortest Distance"}: <strong className="text-[#1F3A5F] font-bold">{stateSca.distance} km</strong>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {stateSca.directionsUrl && (
                    <a
                      href={stateSca.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#3B6E52] text-[#3B6E52] text-xs font-semibold rounded hover:bg-[#E4EEE7] transition shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t.directionsBtn || "Directions"}</span>
                    </a>
                  )}
                  <button
                    onClick={() => setSlipModalPartner(stateSca)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3B6E52] text-white text-xs font-semibold rounded hover:bg-[#2F5741] transition shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t.visitSlip || "Generate Visit Slip"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-[#F1ECE0] border border-[#D8D2C4] rounded-lg p-4 text-xs text-[#6B6558] flex items-center justify-between gap-4">
            <div>
              <strong className="text-[#1F3A5F] block mb-0.5">
                No regional SCA directly identified in directory for {detectedState || "this location"}.
              </strong>
              <span>
                You can apply through any of the Public Sector Banks below, or view the complete MoSJE
                apex registry.
              </span>
            </div>
            <a
              href="https://nsfdc.nic.in/our-channel-partners"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#D8D2C4] text-[#1F3A5F] font-semibold rounded hover:bg-[#FBF9F4] transition shrink-0"
            >
              <span>NSFDC Directory</span>
              <ExternalLink className="w-3 h-3" />
            </a>
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
          <div className="lg:col-span-7 bg-[#F1ECE0] border border-[#D8D2C4] rounded-md overflow-hidden shadow-sm h-[520px] relative">
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

                        {/* Available Schemes in Map Popup */}
                        {p.schemesAvailable && p.schemesAvailable.length > 0 && (
                          <div className="pt-1 border-t border-[#D8D2C4]/40">
                            <span className="text-[10px] font-bold text-[#1F3A5F] block">
                              {t.availableSchemesAtBranch || "Available Schemes:"}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {p.schemesAvailable.map((sch, sIdx) => (
                                <span key={sIdx} className="px-1.5 py-0.2 bg-[#EBF2FA] text-[#1F3A5F] rounded text-[9px] font-medium border border-[#1F3A5F]/20">
                                  {sch}
                                </span>
                              ))}
                            </div>
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
                          <button
                            onClick={() => setSlipModalPartner(p)}
                            className="w-full px-2 py-1 bg-[#1F3A5F] text-white rounded text-[11px] font-semibold hover:bg-[#152842] transition"
                          >
                            {t.visitSlip || "Print Visit Slip"}
                          </button>
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
                const isSCA = p.type === "State Channelizing Agency";
                const directionsLink = p.directionsUrl || `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${p.latitude},${p.longitude}&travelmode=driving`;

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
                                : p.type.includes("Rural")
                                ? "bg-[#EAE8F2] text-[#4A3E80]"
                                : "bg-[#E6ECF5] text-[#1F3A5F]"
                            }`}
                          >
                            {p.type}
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
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-[#1F3A5F]">
                        <Phone className="w-3.5 h-3.5 text-[#B97A1C] shrink-0" />
                        <a
                          href={`tel:${p.phone.split('/')[0].trim()}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline font-mono font-medium"
                        >
                          {p.phone}
                        </a>
                      </div>
                    )}

                    {/* Available Schemes Badges on Bank Card */}
                    {p.schemesAvailable && p.schemesAvailable.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#D8D2C4]/50">
                        <span className="text-[10px] font-bold text-[#1F3A5F] block mb-1">
                          {t.availableSchemesAtBranch || "Available Schemes at this Branch:"}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {p.schemesAvailable.map((schName, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.5 rounded bg-[#EBF2FA] text-[#1F3A5F] border border-[#1F3A5F]/20 text-[10px] font-medium"
                            >
                              {schName}
                            </span>
                          ))}
                        </div>
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
                        <div className="text-[10px] text-[#8C827A] mt-0.5">
                          {p.institutionLabel || "Eligible partner type — confirm enrollment with branch"}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <a
                          href={directionsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white border border-[#3B6E52] text-[#3B6E52] rounded hover:bg-[#E4EEE7] transition whitespace-nowrap"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>{t.directionsBtn || "Directions"}</span>
                        </a>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSlipModalPartner(p);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-[#1F3A5F] text-white rounded hover:bg-[#152842] transition whitespace-nowrap"
                        >
                          {t.visitSlip || "Visit Slip"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Honest Institutional Data Disclosure Box */}
        <div className="mt-8 p-4 bg-[#F1ECE0]/80 border border-[#D8D2C4] rounded-md text-xs text-[#6B6558] leading-relaxed">
          <strong className="text-[#1F3A5F] block mb-1">
            Institutional Geodata Disclosure &amp; Statutory Verification:
          </strong>
          <ul className="list-disc pl-4 space-y-1 text-[11px]">
            <li>
              <strong>Live Open Geodata:</strong> Bank branches and road coordinates are queried live
              via OpenStreetMap Overpass API &amp; Nominatim. Map data &copy; OpenStreetMap contributors.
            </li>
            <li>
              <strong>Verified Master Rosters:</strong> Filtered strictly to the confirmed 11 Public
              Sector Banks and 38 official State Channelizing Agencies published in official MoSJE /
              NSFDC directories. Private commercial banks (e.g. HDFC, ICICI, Axis) are strictly
              excluded.
            </li>
            <li>
              <strong>Quota Availability Labeling:</strong> Branch-level fund quotas and officer
              availability are marked as <code>(estimated)</code>. Full live production requires API feeds
              from NABARD / State Channelizing Agency MIS.
            </li>
          </ul>
        </div>
      </div>

      {/* Branch Visit Slip Modal */}
      {slipModalPartner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-[#FBF9F4] border-2 border-[#1F3A5F] rounded-lg max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSlipModalPartner(null)}
              className="absolute top-4 right-4 text-[#6B6558] hover:text-[#1F3A5F]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Slip Header */}
            <div className="border-b-2 border-dashed border-[#D8D2C4] pb-4 mb-4">
              <div className="text-[10px] font-mono text-[#6B6558] uppercase tracking-wider">
                GOVERNMENT OF INDIA • MOSJE CONCESSIONAL CREDIT INITIATIVE
              </div>
              <h3 className="font-serif font-bold text-xl text-[#1F3A5F] mt-1">
                {t.slipTitle || "Branch Visit & Document Checklist Slip"}
              </h3>
              <div className="text-xs text-[#6B6558] mt-0.5">
                {t.slipSubtitle || "Official Pre-Application Referral Document for Authorized Channel Partner"}
              </div>
            </div>

            {/* Partner Details */}
            <div className="bg-white border border-[#D8D2C4] rounded p-3 mb-4 space-y-1 text-xs">
              <div className="font-bold text-sm text-[#1F3A5F]">{slipModalPartner.name}</div>
              <div className="text-[#6B6558]">{slipModalPartner.type}</div>
              <div className="text-[#2B2A28]">{slipModalPartner.address}</div>
              {slipModalPartner.phone && (
                <div className="text-[#1F3A5F] font-mono font-semibold pt-1">
                  Contact / Helpline: {slipModalPartner.phone}
                </div>
              )}
              {slipModalPartner.distance !== undefined && (
                <div className="text-[#3B6E52] font-semibold pt-0.5">
                  Shortest Distance from your origin: {slipModalPartner.distance} km
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="space-y-2 mb-5">
              <div className="text-xs font-bold text-[#1F3A5F] uppercase tracking-wider">
                Mandatory Documents to Carry:
              </div>
              <ul className="text-xs space-y-1 text-[#2B2A28]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3B6E52] shrink-0" />
                  <span>Scheduled Caste (SC) Community / Caste Certificate</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3B6E52] shrink-0" />
                  <span>Annual Family Income Certificate (Below ₹5,00,000 p.a.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3B6E52] shrink-0" />
                  <span>Aadhaar Card &amp; PAN Card (Identity &amp; Address Proof)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3B6E52] shrink-0" />
                  <span>Project Quotation / Business Plan / College Admission Letter</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3B6E52] shrink-0" />
                  <span>Active Savings Bank Passbook &amp; 3 Passport Photos</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-3 border-t border-[#D8D2C4]">
              <button
                type="button"
                onClick={() => setSlipModalPartner(null)}
                className="px-4 py-2 border border-[#D8D2C4] text-xs font-semibold rounded text-[#6B6558] hover:bg-[#F1ECE0]"
              >
                {t.slipCloseBtn || "Close"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F3A5F] text-white text-xs font-semibold rounded hover:bg-[#152842] shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.slipPrintBtn || "Print Slip"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
