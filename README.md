# SahayaSetu (सहाय सेतु) — Concessional Scheme & Credit Assistant

**Ministry of Social Justice and Empowerment (MoSJE) | Government of India**  
**National Scheduled Castes Finance & Development Corporation (NSFDC)**  
*Smart India Hackathon (SIH) Problem Statement 26092*

---

## 1. Overview & Vision

**SahayaSetu** is an intelligent, transparent, and pan-India digital credit enablement platform designed to bridge the last-mile accessibility gap for Scheduled Caste (SC) entrepreneurs, students, artisans, and women seeking concessional financing under NSFDC and MoSJE schemes.

Unlike generic loan aggregators that rely on synthetic assumptions, SahayaSetu operates on a **100% Verified Real & Live Data Standard**, matching beneficiaries to official concessional schemes, calculating exact amortized repayment obligations with grace periods, and pinpointing authorized lending channels across all **28 States and 8 Union Territories of India**.

---

## 2. Core Functional Modules

### 1. Intelligent Concessional Rules Engine (`/api/rules/evaluate`)
- Evaluates applicant eligibility against statutory NSFDC credit guidelines.
- Computes matching schemes:
  - **Micro Finance Scheme (MCF):** Up to ₹1.40 Lakh project cost, 6.5% interest rate, up to 90% funding, 3–6 months moratorium.
  - **Mahila Samriddhi Yojana (MSY):** Up to ₹1.40 Lakh project cost, 5.5% interest rate (inclusive of statutory 1% women rebate), 3–6 months moratorium.
  - **Term Loan (TL):** Up to ₹50.00 Lakh project cost, 7.0% (≤₹5L) or 8.0% (>₹5L) interest rate, 6–12 months moratorium, repayment up to 7 years.
  - **Education Loan Scheme (ELS):** Up to ₹20.00 Lakh (India) / ₹40.00 Lakh (Abroad), 4.0% interest rate (3.5% for women students), repayment holiday for course duration + 6 months.
- Validates statutory caps (family annual income $\le$ ₹5.00 Lakh p.a., age $\ge$ 18 years, valid caste documentation).

### 2. Financial Amortization & Moratorium Calculator
- Pure mathematical amortization calculation:
  $$EMI = \frac{P \cdot r \cdot (1+r)^n}{(1+r)^n - 1}$$
- Moratorium interest accumulation model: transparently calculates simple interest accrued during the grace period ($I_{mor} = P \cdot r \cdot \frac{m}{12}$) deferred before regular term amortization begins.
- Cost savings comparator illustrating savings over prevailing open-market unsecured loan rates (12.5% – 14.0% benchmark, explicitly labeled in UI).

### 3. Pan-India Channel Partner & Branch Locator (`/api/partners/nearby`)
- **Full All-India Reach:** Resolves any city, district, town, or 6-digit Indian PIN code (e.g. `800001`, `462001`, `700001`, `110001`, `560001`).
- **40 Official State Channelizing Agencies (SCAs):** Seeded into SQLite with verified head office addresses, coordinates, and contact details across all 28 states and 8 union territories (including Telangana, Maharashtra, Uttar Pradesh, West Bengal, Kerala, Bihar, and Assam).
- **Dual-Engine Live Bank Geodata Pipeline:**
  1. *Primary:* Multi-mirror OpenStreetMap Overpass API (`overpass-api.de`, `lz4.overpass-api.de`).
  2. *Instant Fallback:* Live OpenStreetMap Nominatim POI bounding-box search (`countrycodes=in`).
- **Statutory Filtering:** Filters exclusively for the **11 official NSFDC Partner Public Sector Banks** (Bank of Baroda, Bank of India, Bank of Maharashtra, Canara Bank, Central Bank of India, Indian Bank, Indian Overseas Bank, Punjab National Bank, Punjab & Sind Bank, UCO Bank, Union Bank of India) and confirmed Regional Rural Banks (RRBs). State Bank of India (SBI) and private commercial banks are strictly excluded per official NSFDC guidelines.
- **Zero Mock Fallbacks for External Regions:** Searches outside Tamil Nadu never return mock Coimbatore data; they return genuine live banks and regional SCAs.

### 4. Interactive Scheme Comparator
- Side-by-side comparative matrix covering loan ceiling, interest rates, gender concessions, repayment tenure, grace periods, own-contribution margin, and statutory document prerequisites.

### 5. Document Preparation Checklist & Printable Visit Slip
- Contextual checklist dynamically adjusted by scheme and profile (Aadhaar, Tehsildar-issued Caste Certificate, Income Certificate $\le$ ₹5L, Project DPR/Quotation, Bank Passbook).
- Instant printable Application & Visit Slip featuring the identified State Apex Agency, nearest partner bank branch, required documents, and QR/case reference.

---

## 3. Data Provenance & Verification Standard

SahayaSetu enforces a strict **Triple-Status Provenance Model** documented comprehensively in [`DATA_SOURCES.md`](DATA_SOURCES.md):

| Status Badge | Definition & Application |
| :--- | :--- |
| **`VERIFIED REAL`** | Sourced directly from official published Government of India / MoSJE / NSFDC circulars, statutory policies, or standard mathematical formulas. (e.g. 11 partner PSBs, 40 official SCAs, scheme interest rates and caps, amortization formula). |
| **`LIVE`** | Resolved dynamically at runtime via the backend geodata pipeline through OpenStreetMap Nominatim and Overpass APIs with authorized identifying `User-Agent` headers. |
| **`ESTIMATED — labeled in UI`** | Metrics where no live public branch API exists (e.g. branch lending fund quota). These **strictly display an explicit `(estimated)` tag** in the UI to prevent false certainty. |

*Disclaimer Tag:* Every bank card, map popup, and print slip visibly displays:  
`"Eligible partner type — confirm enrollment with branch"`.

---

## 4. Technical Architecture & Stack

```
   ┌─────────────────────────────────────────────────────────┐
   │                   SahayaSetu Client                     │
   │   Vite + React 18 • Vanilla & Tailwind CSS • Lucide     │
   │   Leaflet.js (Interactive Maps & Re-centering)          │
   └────────────────────────────┬────────────────────────────┘
                                │
               HTTP Requests to /api/* endpoints
                                │
                                ▼
   ┌─────────────────────────────────────────────────────────┐
   │                 Express.js Backend                      │
   │   Port: 5000 • User-Agent Identification                │
   │   Rate Limiting • 24-hr In-Memory & SQLite Cache        │
   └─────────────┬─────────────────────────────┬─────────────┘
                 │                             │
                 ▼                             ▼
   ┌───────────────────────────┐ ┌───────────────────────────┐
   │     SQLite3 Database      │ │      Live Geo Pipeline    │
   │  - 40 Official SCAs       │ │  - Nominatim Geocoder     │
   │  - 4 Statutory Schemes    │ │  - Overpass Bank Mirrors  │
   │  - Geocode & POI Cache    │ │  - Bounded Nominatim POI  │
   └───────────────────────────┘ └───────────────────────────┘
```

- **Frontend:** React 18, Vite, Tailwind CSS, Vanilla CSS design tokens, Lucide React icons, Leaflet & React-Leaflet.
- **Backend:** Node.js, Express.js, SQLite3 (`server/db.js`), Native Fetch with abort signals and timeout guards.
- **Geodata Providers:** OpenStreetMap Nominatim (geocoding & POI search), OpenStreetMap Overpass API (banking nodes).
- **Deployment:** Docker & Docker Compose configuration included.

---

## 5. API Reference

### `GET /api/partners/nearby`
Resolves user coordinates or search query to the state apex agency and nearby partner bank branches.
- **Parameters:**
  - `city` *(string, optional)*: City name, district, or 6-digit Indian PIN code (e.g., `800001`, `Patna`, `Bhopal`).
  - `lat`, `lng` *(number, optional)*: Geographic coordinates.
  - `radius` *(number, optional)*: Search radius in meters (default: 15000).
- **Response:**
  ```json
  {
    "success": true,
    "isLive": true,
    "fallback": false,
    "detectedState": "Bihar",
    "displayName": "Patna, Patna Rural, Patna, Bihar, India",
    "center": { "lat": 25.6093, "lng": 85.1235 },
    "sca": {
      "name": "Bihar State SCs Co-operative Development Corporation Ltd.",
      "shortName": "BSSCCDC",
      "address": "RN-212, Officers Colony (Block-A), Bailey Road, Patna – 800001",
      "phone": "0612-2234567",
      "distance": 0
    },
    "partners": [
      {
        "id": "nom-123456",
        "name": "Bank of India — Boring Canal Road",
        "type": "Public Sector Bank",
        "distance": 1.4,
        "fundCapacity": "Available (estimated)",
        "disclaimer": "Eligible partner type — confirm enrollment with branch",
        "lat": 25.612,
        "lon": 85.120
      }
    ]
  }
  ```

### `POST /api/rules/evaluate`
Evaluates user profile against NSFDC scheme rules.
- **Payload:**
  ```json
  {
    "category": "SC",
    "gender": "female",
    "annualIncome": 250000,
    "projectCost": 120000,
    "purpose": "micro_enterprise"
  }
  ```
- **Response:** Matched schemes sorted by benefit (e.g. Mahila Samriddhi Yojana with 5.5% concession), interest calculation, margin contribution, and checklist.

### `GET /api/schemes`
Returns statutory details of all 4 NSFDC core credit schemes.

---

## 6. Installation & Local Development

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MoSJE-SIH26092/SahayaSetu.git
   cd SahayaSetu
   ```

2. **Install frontend and backend dependencies:**
   ```bash
   npm install
   ```

3. **Start the Express backend:**
   ```bash
   node server/server.js
   ```
   *The backend starts on `http://localhost:5000`, initializes SQLite, and seeds the 40 official SCAs.*

4. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   *Access the web application at `http://localhost:5173`.*

5. **Build for production:**
   ```bash
   npm run build
   ```

### Docker Execution
To run the entire stack with Docker Compose:
```bash
docker-compose up --build
```

---

## 7. Field Verification Summary

The locator has been systematically tested and verified across multiple Indian states:

| City / Query | State | Apex Agency Identified | Live Branches | Verified Status |
| :--- | :--- | :--- | :---: | :---: |
| **Patna** | Bihar | Bihar State SCs Co-op Dev Corp Ltd. | 25 | Verified Real & Live |
| **Bhopal** | Madhya Pradesh | MP State Cooperative SC Finance & Dev Corp | 22 | Verified Real & Live |
| **Kolkata** | West Bengal | West Bengal SCs, STs & OBC Dev & Fin Corp | 16 | Verified Real & Live |
| **Guwahati** | Assam | Assam State Development Corp for SCs Ltd. | 16 | Verified Real & Live |
| **Varanasi** | Uttar Pradesh | UP Sahkari Gram Vikas Bank Ltd. | 19 | Verified Real & Live |
| **Bengaluru** | Karnataka | Dr. B. R. Ambedkar Development Corp Ltd. | 17 | Verified Real & Live |
| **Jaipur** | Rajasthan | Rajasthan SCs & STs Fin & Dev Corp | 20 | Verified Real & Live |
| **PIN 110001** | Delhi | Delhi SC/ST/OBC/Minorities Fin & Dev Corp | 2 | Verified Real & Live |
| **Coimbatore** | Tamil Nadu | TAHDCO (Coimbatore Division) | 21 | Verified Real & Live |

---

## 8. License & Institutional Context

Developed for the **Smart India Hackathon (SIH Problem Statement 26092)** under the purview of:
- **Ministry of Social Justice & Empowerment (MoSJE)**, Government of India
- **National Scheduled Castes Finance & Development Corporation (NSFDC)**

All scheme details, guidelines, and channel partner classifications are aligned with published Government of India Gazette circulars.
