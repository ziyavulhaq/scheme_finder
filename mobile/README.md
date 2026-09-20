# Samarth Setu — Mobile Application (Expo React Native)

Official mobile application version of **Samarth Setu** built using **Expo (React Native)** and **Expo Router**, tailored for low-digital-literacy citizens seeking low-interest government loan schemes.

---

## Features & Highlights

1. **Light-Themed High-Usability Design:**
   - Soft off-white background (`#FBF9F4`) with high-contrast typography (`#1F3A5F`).
   - Large tap targets (minimum 54px touch height) and icon-driven options.
   - Statutory 90% loan vs 10% borrower margin breakdown cards.

2. **"No Disturbance" Viewport Architecture:**
   - **Safe Area Management:** Every screen wrapped in `SafeAreaView` from `react-native-safe-area-context` to avoid notch, status bar, and home-bar collisions.
   - **Scroll Padding:** Every `ScrollView` features `contentContainerStyle={{ paddingBottom: 120 }}` so content is never obscured by the fixed navigation bar.
   - **Keyboard Avoidance:** `KeyboardAvoidingView` on all intake and calculation forms ensures input fields are never blocked by virtual keyboards.

3. **Persistent Fixed Bottom Navigation (4 Tabs):**
   - **Find Scheme** (`/(tabs)`): 4-step eligibility questionnaire with instant NSFDC scheme recommendation.
   - **Calculate EMI** (`/(tabs)/calculator`): Dynamic monthly instalment calculator with interest rate comparisons and moratorium grace period indicators.
   - **Verify Docs** (`/(tabs)/documents`): Highlighted golden-orange action button with interactive checklist, readiness progress meter, and issuing authority tips.
   - **Nearby Banks** (`/(tabs)/locator`): Pan-India State Channelizing Agencies (SCAs) and Public Sector Bank partner directory with one-touch phone calling.

---

## Running the Application

### 1. Start Expo Dev Server
```bash
cd mobile
npm start
```

### 2. Run on Physical Device or Emulator
- **Expo Go (Android / iOS):** Scan the QR code displayed in the terminal using the Expo Go app.
- **Android Emulator:** Press `a` in the terminal.
- **iOS Simulator:** Press `i` in the terminal (macOS).
- **Web Preview:** Press `w` in the terminal or run `npm run web`.

---

## Project Structure

```
mobile/
├── app/
│   ├── _layout.jsx             # Root layout with SafeAreaProvider & StatusBar
│   └── (tabs)/
│       ├── _layout.jsx         # Persistent 4-tab bottom navigation
│       ├── index.jsx           # Tab 1: Find Scheme
│       ├── calculator.jsx      # Tab 2: Calculate EMI
│       ├── documents.jsx       # Tab 3: Verify Docs (Highlighted Golden Tab)
│       └── locator.jsx         # Tab 4: Nearby Banks
├── components/
│   ├── Header.jsx              # Header with brand badge & Toll-Free 14566
│   ├── BigOptionButton.jsx     # Large touch-friendly option selector
│   ├── SchemeCard.jsx          # Matched scheme display with 90% margin breakdown
│   └── StatCard.jsx            # Metric cards (interest, loan, moratorium)
├── constants/
│   ├── theme.js                # Design tokens & color palette
│   ├── schemes.js              # NSFDC statutory schemes data
│   ├── documents.js            # Required statutory checklist items
│   └── partners.js             # Verified SCAs and public sector partner banks
├── utils/
│   ├── rulesEngine.js          # Deterministic scheme eligibility engine
│   └── financialMath.js        # Reducing-balance EMI & margin calculations
├── app.json                    # Expo project configuration
└── package.json                # React Native & Expo dependencies
```
