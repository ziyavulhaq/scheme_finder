import React, { useState } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { Navbar } from "./components/Navbar";
import { SchemeRecommender } from "./components/SchemeRecommender";
import { FinancialCalculator } from "./components/FinancialCalculator";
import { PartnerLocator } from "./components/PartnerLocator";
import { Footer } from "./components/Footer";

export default function App() {
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(140000);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [activeSection, setActiveSection] = useState("recommend");

  // Handler: When user clicks "Calculate EMI" from the Recommender result card
  const handleSelectForCalculator = (scheme, amount) => {
    setSelectedScheme(scheme);
    if (amount) setSelectedAmount(amount);
    setActiveSection("calculate");
    const el = document.getElementById("calculate");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Handler: When user clicks "Find an authorized partner near you"
  const handleSelectForLocator = (schemeInput) => {
    const schemeId = typeof schemeInput === "object" && schemeInput !== null ? (schemeInput.id || "all") : (schemeInput || "all");
    setSelectedCategoryFilter(schemeId);
    setActiveSection("locate");
    const el = document.getElementById("locate");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#2B2A28]">
        {/* Site Header */}
        <Navbar activeSection={activeSection} onNavigate={(id) => setActiveSection(id)} />

        {/* Main Content: Single Continuous Flow */}
        <main className="flex-1">
          {/* Module 1: Scheme Recommender Wizard */}
          <SchemeRecommender
            onSelectForCalculator={handleSelectForCalculator}
            onSelectForLocator={handleSelectForLocator}
          />

          {/* Module 2: Financial Calculator */}
          <FinancialCalculator
            initialScheme={selectedScheme}
            initialAmount={selectedAmount}
            onRouteToPartners={(schemeId) => handleSelectForLocator(schemeId)}
          />

          {/* Module 3: Geo-Spatial Partner Locator */}
          <PartnerLocator
            initialSchemeId={selectedCategoryFilter}
          />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </LanguageProvider>
  );
}
