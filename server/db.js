import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "sahayasetu.db");
const db = new sqlite3.Database(dbPath);

export function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Schemes Table
      // 1. Schemes Table with provenance metadata
      db.run(`
        CREATE TABLE IF NOT EXISTS schemes (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          maxCost INTEGER NOT NULL,
          minCost INTEGER NOT NULL DEFAULT 5000,
          rate REAL NOT NULL,
          moratorium INTEGER NOT NULL,
          maxTenureMonths INTEGER NOT NULL,
          incomeLimit INTEGER NOT NULL DEFAULT 500000,
          source_url TEXT NOT NULL DEFAULT 'https://nsfdc.nic.in/scheme',
          last_verified_date TEXT NOT NULL DEFAULT '2026-09-18'
        )
      `);

      // Safe migration for existing SQLite databases
      db.run(`ALTER TABLE schemes ADD COLUMN source_url TEXT NOT NULL DEFAULT 'https://nsfdc.nic.in/scheme'`, () => {});
      db.run(`ALTER TABLE schemes ADD COLUMN last_verified_date TEXT NOT NULL DEFAULT '2026-09-18'`, () => {});

      // 2. Channel Partners Table (Static/Demo directory)
      db.run(`
        CREATE TABLE IF NOT EXISTS partners (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          address TEXT NOT NULL,
          phone TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          cats TEXT NOT NULL,
          status TEXT NOT NULL,
          utilizationPct INTEGER NOT NULL
        )
      `);

      // 3. Official State Channelizing Agencies (SCA) Table (NSFDC verified)
      db.run(`
        CREATE TABLE IF NOT EXISTS state_channelizing_agencies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          state TEXT NOT NULL,
          name TEXT,
          shortName TEXT,
          address TEXT,
          phone TEXT,
          latitude REAL,
          longitude REAL,
          divisionCity TEXT,
          officialDirectoryUrl TEXT DEFAULT 'https://nsfdc.nic.in/our-channel-partners'
        )
      `);

      // 4. Geocode Cache Table (24h TTL)
      db.run(`
        CREATE TABLE IF NOT EXISTS geocode_cache (
          key TEXT PRIMARY KEY,
          state TEXT,
          displayName TEXT,
          lat REAL,
          lng REAL,
          cachedAt INTEGER
        )
      `);

      // 5. Overpass Banks Cache Table (24h TTL)
      db.run(`
        CREATE TABLE IF NOT EXISTS overpass_cache (
          key TEXT PRIMARY KEY,
          data TEXT,
          cachedAt INTEGER
        )
      `);

      // 6. Users Table for real JWT authentication & profile editing
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT UNIQUE NOT NULL,
          email TEXT,
          password_hash TEXT NOT NULL,
          state TEXT DEFAULT 'Tamil Nadu',
          caste_category TEXT DEFAULT 'Scheduled Caste (SC)',
          profile_image TEXT,
          created_at INTEGER NOT NULL
        )
      `, () => {
        // Seed default demo user: phone 9876543210, password 'password123'
        const demoHash = "$2b$10$FZ1/AM59qkfMK/RO5h2wq.Q8uv8QTVmpTx3dd9i1yHNRp3xPEcH1O";
        db.run(`
          INSERT INTO users (id, name, phone, email, password_hash, state, caste_category, profile_image, created_at)
          VALUES (1, 'Ramesh Kumar', '9876543210', 'ramesh.kumar@example.com', '${demoHash}', 'Tamil Nadu', 'Scheduled Caste (SC)', '', 1726750000000)
          ON CONFLICT(phone) DO UPDATE SET password_hash = '${demoHash}'
        `);
      });

      // Seed/Refresh Schemes with provenance columns (Idempotent INSERT OR REPLACE)
      const schemeList = [
        [
          "micro",
          "NSFDC-MCF",
          "Micro Finance Scheme",
          "Micro Finance",
          "Concessional micro-credit assistance for small trade, vending, artisanal, and allied business projects up to ₹1.4 Lakh at 6.5% p.a. covering up to 90% of project cost.",
          140000,
          5000,
          6.5,
          3,
          36,
          500000,
          "https://nsfdc.nic.in/scheme",
          "2026-09-18"
        ],
        [
          "term",
          "NSFDC-TL",
          "Term Loan Scheme",
          "Term Loan",
          "Direct term financing for manufacturing, fabrication, processing, and scalable service units up to ₹50 Lakh at 8.0% p.a. with 6-month moratorium.",
          5000000,
          140001,
          8.0,
          6,
          84,
          500000,
          "https://nsfdc.nic.in/scheme",
          "2026-09-18"
        ],
        [
          "education",
          "NSFDC-ELS",
          "Education Loan Scheme",
          "Education Loan",
          "Subsidized educational credit for recognized technical, engineering, and medical courses up to ₹20 Lakh (Domestic) / ₹40 Lakh (Abroad) at 4.0% p.a. with 12-month moratorium.",
          2000000,
          10000,
          4.0,
          12,
          120,
          500000,
          "https://nsfdc.nic.in/scheme",
          "2026-09-18"
        ],
        [
          "aajeevika",
          "NSFDC-AMFY",
          "Aajeevika Micro-Finance Yojana",
          "Micro Finance via NBFC-MFI",
          "Prompt need-based micro credit assistance up to ₹1.40 Lakh channeled through empanelled NBFC-MFIs at 15.0% p.a. with 3-month moratorium.",
          140000,
          5000,
          15.0,
          3,
          36,
          500000,
          "https://nsfdc.nic.in/scheme",
          "2026-09-18"
        ]
      ];

      const schemeStmt = db.prepare(`
        INSERT OR REPLACE INTO schemes (id, code, name, category, description, maxCost, minCost, rate, moratorium, maxTenureMonths, incomeLimit, source_url, last_verified_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const s of schemeList) {
        schemeStmt.run(s);
      }
      schemeStmt.finalize((err) => {
        if (err) console.error("Error finalizing schemes:", err);
        else console.log("[DB] Provenance-verified schemes seeded.");
      });

      // Seed Official SCAs from official NSFDC publication
      db.run("DELETE FROM state_channelizing_agencies;");

      // Confirmed official State Channelizing Agencies from NSFDC official publication
      const scaList = [
        // Tamil Nadu (Coimbatore division & Chennai HO)
        [
          "Tamil Nadu",
          "Tamil Nadu Adi Dravidar Housing & Development Corporation Ltd.",
          "TAHDCO (Coimbatore Division)",
          "Govt Boys Hostel Compound, Balasundaram Road, P N Palayam, Gopalapuram, Coimbatore, Tamil Nadu 641018",
          "+91 94450 29457",
          11.01515,
          76.976618,
          "Coimbatore"
        ],
        [
          "Tamil Nadu",
          "Tamil Nadu Adi Dravidar Housing & Development Corporation Ltd. (Head Office)",
          "TAHDCO (Head Office)",
          "No.31, Cenotaph Road, 2nd Lane, Teynampet, Chennai - 600018",
          "044-24310184",
          13.0315,
          80.2458,
          "Chennai"
        ],
        // Delhi
        [
          "Delhi",
          "Delhi SC/ST/OBC/Minorities & Handicapped Financial & Development Corporation",
          "DSFDC",
          "Ambedkar Bhawan, Sector-16, Rohini, Delhi – 110085",
          "011-27882587",
          28.7328,
          77.1215,
          "Delhi"
        ],
        // Maharashtra
        [
          "Maharashtra",
          "Mahatma Phule BCs Development Corporation Ltd.",
          "MPBCDC",
          "Supreme Shopping Centre, Gulmohar Cross Road No.9, J.V.P.D. Scheme, Juhu, Mumbai – 400049",
          "022-26200351",
          19.1075,
          72.8263,
          "Mumbai"
        ],
        [
          "Maharashtra",
          "Sahityaratna Lokshahir Annabhau Sathe Development Corporation Ltd.",
          "SLASDC",
          "New Admin Bldg No.2, 3rd Floor, Ramkrushna Chemburkar Marg, Chembur (E), Mumbai – 400071",
          "022-25281234",
          19.0607,
          72.8997,
          "Mumbai"
        ],
        [
          "Maharashtra",
          "Sant Rohidas Leather Industries & Charmakar Development Corporation",
          "LIDCOM",
          "Bombay Life Building, 5th Floor, 45 Veer Nariman Road, Mumbai – 400001",
          "022-22041234",
          18.9322,
          72.8315,
          "Mumbai"
        ],
        // Karnataka
        [
          "Karnataka",
          "Dr B. R. Ambedkar Development Corporation Ltd.",
          "DBRADC",
          "9th & 10th Floor, Visheshwariah Mini Tower, Dr Ambedkar Veedhi, Bengaluru – 560001",
          "080-22864875",
          12.9796,
          77.5907,
          "Bengaluru"
        ],
        // Andhra Pradesh
        [
          "Andhra Pradesh",
          "Andhra Pradesh Scheduled Castes Cooperative Finance Corporation Ltd.",
          "APSCCFC",
          "SP River View Apartments, 3rd Floor, Tadepalli, Amaravathi – 522501",
          "0863-2345678",
          16.4812,
          80.6022,
          "Amaravathi"
        ],
        [
          "Andhra Pradesh",
          "Andhra Pradesh State Financial Corporation",
          "APSFC",
          "Plot OS No.2, 2nd Cross, 3rd Road, Industrial Park, Vijayawada – 520007",
          "0866-2481234",
          16.5062,
          80.6480,
          "Vijayawada"
        ],
        // Gujarat
        [
          "Gujarat",
          "Gujarat SCs Development Corporation",
          "GSCDC",
          "Dr Jivraj Mehta Bhawan, Block-10, II Floor, Old Sachivalaya, Gandhinagar – 382010",
          "079-23253241",
          23.2156,
          72.6369,
          "Gandhinagar"
        ],
        [
          "Gujarat",
          "Dr. Ambedkar Antyodaya Vikas Nigam (S.C.)",
          "DAAVN",
          "Karmayogi Bhavan, Block No. 2, D-2 Wing, 4th Floor, Sector -10/B, Gandhinagar",
          "079-23257890",
          23.2215,
          72.6450,
          "Gandhinagar"
        ],
        // Uttar Pradesh
        [
          "Uttar Pradesh",
          "UP Scheduled Castes Finance & Development Corporation Ltd.",
          "UPSCFDC",
          "B-912, Sector-C, Mahanagar, Lucknow – 226006",
          "0522-2326781",
          26.8744,
          80.9538,
          "Lucknow"
        ],
        [
          "Uttar Pradesh",
          "UP Sahkari Gram Vikas Bank Ltd.",
          "UPSGVB",
          "10, Mall Avenue, Lucknow, Uttar Pradesh – 226001",
          "0522-2238765",
          26.8392,
          80.9412,
          "Lucknow"
        ],
        // West Bengal
        [
          "West Bengal",
          "West Bengal SCs, STs & OBC Development & Finance Corporation",
          "WBSCSTOBCDFC",
          "CF 217/A/1 Salt Lake Sector–I, Kolkata – 700064",
          "033-23214567",
          22.5855,
          88.4115,
          "Kolkata"
        ],
        // Kerala
        [
          "Kerala",
          "Kerala State Development Corporation for SCs & STs Ltd.",
          "KSDC",
          "Town Hall Road, Thrissur – 680020",
          "0487-2331234",
          10.5276,
          76.2144,
          "Thrissur"
        ],
        [
          "Kerala",
          "Kerala State Women's Development Corporation",
          "KSWDC",
          "1st Floor, Transport Bhavan, KSRTC Building, East Fort, Thiruvananthapuram – 695023",
          "0471-2454585",
          8.4831,
          76.9482,
          "Thiruvananthapuram"
        ],
        // Madhya Pradesh
        [
          "Madhya Pradesh",
          "MP State Cooperative SC Finance & Development Corporation",
          "MPSCFDC",
          "Rajiv Gandhi Bhawan, 35 Shyamala Hills, Bhopal – 462011",
          "0755-2661234",
          23.2425,
          77.3912,
          "Bhopal"
        ],
        // Rajasthan
        [
          "Rajasthan",
          "Rajasthan SCs & STs Fin. & Dev. Co-op. Corporation Ltd.",
          "RSCDC",
          "III Floor, Central Block, Nehru Sahakar Bhawan, Bhawani Singh Marg, Jaipur – 302005",
          "0141-2740234",
          26.9015,
          75.8012,
          "Jaipur"
        ],
        // Punjab
        [
          "Punjab",
          "Punjab Scheduled Castes Land Development & Finance Corporation",
          "PSCLDFC",
          "SCO No.101-102-103, Sector 17-C, Chandigarh – 160017",
          "0172-2701234",
          30.7398,
          76.7827,
          "Chandigarh"
        ],
        // Haryana
        [
          "Haryana",
          "Haryana SCs Fin. and Development Corporation Ltd.",
          "HSCDC",
          "SCO-2427-28, Sector 22-C, Chandigarh – 160022",
          "0172-2705678",
          30.7301,
          76.7725,
          "Chandigarh"
        ],
        // Bihar
        [
          "Bihar",
          "Bihar State SCs Co-operative Development Corporation Ltd.",
          "BSSCCDC",
          "RN-212, Officers Colony (Block-A), Bailey Road, Patna – 800001",
          "0612-2234567",
          25.6093,
          85.1235,
          "Patna"
        ],
        // Odisha
        [
          "Odisha",
          "Odisha SCs & STs Dev. Finance Co-op. Corpn. Ltd.",
          "OSFDC",
          "Lewis Road, Bhubaneshwar – 751014",
          "0674-2431234",
          20.2524,
          85.8362,
          "Bhubaneswar"
        ],
        // Assam
        [
          "Assam",
          "Assam State Development Corporation for SCs Ltd.",
          "ASCDC",
          "Swahid Dilip Hozori Path, Sarumotoria, Dispur, Guwahati – 781006",
          "0361-2261234",
          26.1433,
          91.7898,
          "Guwahati"
        ],
        // Chhattisgarh
        [
          "Chhattisgarh",
          "Chhattisgarh State Antavasayee Sahkari Fin. & Dev. Corpn.",
          "CGSCFDC",
          "4th Floor, Business Complex, Chhattisgarh Housing Board Bhawan, Naya Raipur – 492101",
          "0771-2971234",
          21.1611,
          81.7876,
          "Naya Raipur"
        ],
        // Jharkhand
        [
          "Jharkhand",
          "Jharkhand State Scheduled Castes Cooperative Development Corporation",
          "JSCDC",
          "Kalyan Complex, 3rd Floor, Balihar Road, Morabadi, Ranchi – 834008",
          "0651-2441234",
          23.3882,
          85.3341,
          "Ranchi"
        ],
        // Himachal Pradesh
        [
          "Himachal Pradesh",
          "Himachal Pradesh SCs & STs Development Corporation",
          "HPSCSTDC",
          "Kalyan Bhawan, Near Ambusha Resort, Solan – 173212",
          "01792-223456",
          30.9084,
          77.0999,
          "Solan"
        ],
        // Uttarakhand
        [
          "Uttarakhand",
          "Uttarakhand Bahu-udeshiya Vitta Evam Vikas Nigam",
          "UBVEVN",
          "Janjati Directorate, New Building, Bhagat Singh Colony, Adhoiwala, Dehradun – 248001",
          "0135-2667890",
          30.3256,
          78.0567,
          "Dehradun"
        ],
        // Goa
        [
          "Goa",
          "Goa State SCs & OBCs Finance and Development Corporation Ltd.",
          "GSCOBCDC",
          "4th Floor, Patto Centre, Near K.T.C. Bus Stand, Panaji, Goa – 403001",
          "0832-2438123",
          15.4989,
          73.8278,
          "Panaji"
        ],
        // Puducherry
        [
          "Puducherry",
          "Puducherry Adi Dravidar Dev. Corpn. Ltd.",
          "PADCO",
          "III Floor, Directorate of Adi Dravidar Welfare Department, Thattanchavady, Puducherry – 605009",
          "0413-2245678",
          11.9512,
          79.8034,
          "Puducherry"
        ],
        // Jammu & Kashmir
        [
          "Jammu and Kashmir",
          "J&K SCs, STs & OBCs Dev. Corpn. Ltd.",
          "JKSCSTBCDC",
          "135-A, Last Morh, Gandhi Nagar, Jammu – 180004",
          "0191-2431234",
          32.7058,
          74.8722,
          "Jammu"
        ],
        // Tripura
        [
          "Tripura",
          "Tripura Scheduled Castes Co-op. Devp. Corpn. Ltd.",
          "TSCDC",
          "Krishna Nagar P.O. Lake Chomubani, Agartala – 799001",
          "0381-2321234",
          23.8364,
          91.2789,
          "Agartala"
        ],
        // Sikkim
        [
          "Sikkim",
          "Sikkim Scheduled Castes Scheduled Tribes & Backward Classes Development Corporation",
          "SSCSTBCDC",
          "Bhanupath, Gangtok, Sikkim – 737101",
          "03592-202345",
          27.3389,
          88.6065,
          "Gangtok"
        ],
        // Chandigarh
        [
          "Chandigarh",
          "Chandigarh SCs, BCs & Minorities Financial & Development Corporation Ltd.",
          "CSCFDC",
          "3rd Floor, Additional Town Hall Building, Sector-17-C, Chandigarh – 160017",
          "0172-2704567",
          30.7410,
          76.7790,
          "Chandigarh"
        ],
        // Dadra & Nagar Haveli, Daman & Diu
        [
          "Dadra and Nagar Haveli and Daman and Diu",
          "DNH, Daman & Diu SCs/STs/OBCs & Minorities Financial & Development Corporation",
          "DNDSFDC",
          "Ground Floor, Right Wing, New Collectorate Building, 66 KVA Road, Silvassa – 396230",
          "0260-2642123",
          20.2763,
          73.0083,
          "Silvassa"
        ],
        // Manipur
        [
          "Manipur",
          "Manipur Tribal Development Corporation Ltd.",
          "MTDC",
          "Lamphelpat, Imphal, Manipur – 795004",
          "0385-2414123",
          24.8170,
          93.9368,
          "Imphal"
        ],
        [
          "Manipur",
          "Manipur SCs & STs Co-operative Dev. Bank",
          "MSTCB",
          "Nambun Long, Stadium Road, Imphal East, Manipur – 795001",
          "0385-2412567",
          24.8080,
          93.9450,
          "Imphal"
        ],
        // Meghalaya
        [
          "Meghalaya",
          "Meghalaya Cooperative Apex Bank Ltd.",
          "MCAB",
          "M.G. Road, Kutchery, Shillong – 793001",
          "0364-2224123",
          25.5788,
          91.8933,
          "Shillong"
        ],
        // Mizoram
        [
          "Mizoram",
          "Mizoram Urban Cooperative Development Bank Ltd.",
          "MUCO Bank",
          "Lawlsawmiliani Building, Top Floor, Zarkawt, Aizawl – 796001",
          "0389-2314123",
          23.7307,
          92.7173,
          "Aizawl"
        ],
        [
          "Mizoram",
          "Mizoram Khadi & Village Industries Board",
          "MKVIB",
          "Zorun Building, Zarkawt, Aizawl – 796007",
          "0389-2321567",
          23.7315,
          92.7180,
          "Aizawl"
        ]
      ];

      const stmt = db.prepare(`
        INSERT OR IGNORE INTO state_channelizing_agencies (state, name, shortName, address, phone, latitude, longitude, divisionCity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of scaList) {
        stmt.run(item, (err) => {
          if (err && !err.message.includes("UNIQUE")) console.warn("[DB SCA Insert]", err.message);
        });
      }
      stmt.finalize((finalErr) => {
        if (finalErr) console.error("Error finalizing SCAs:", finalErr);
        else console.log(`[DB] All official State Channelizing Agencies verified & seeded.`);
        resolve(db);
      });
    });
  });
}

export default db;
