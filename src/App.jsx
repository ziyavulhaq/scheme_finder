import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthPage } from "./components/AuthPage";
import { Navbar } from "./components/Navbar";
import { SchemeRecommender } from "./components/SchemeRecommender";
import { FinancialCalculator } from "./components/FinancialCalculator";
import { PartnerLocator } from "./components/PartnerLocator";
import { BottomNav } from "./components/BottomNav";
import { Footer } from "./components/Footer";

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(140000);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [activeSection, setActiveSection] = useState("recommend");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#1F3A5F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-[#1F3A5F]">Loading SahayaSetu Portal...</p>
        </div>
      </div>
    );
  }

  // If citizen is not logged in, render the Login / Create Account page
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Handler: When user clicks "Calculate EMI" from the Recommender result card
  const handleSelectForCalculator = (scheme, amount) => {
    setSelectedScheme(scheme);
    if (amount) setSelectedAmount(amount);
    setActiveSection("calculate");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler: When user clicks "Find an authorized partner near you"
  const handleSelectForLocator = (schemeInput) => {
    const schemeId = typeof schemeInput === "object" && schemeInput !== null ? (schemeInput.id || "all") : (schemeInput || "all");
    setSelectedCategoryFilter(schemeId);
    setActiveSection("locate");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (pageId) => {
    setActiveSection(pageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#2B2A28]">
      {/* Site Header with Top-Right Settings & Profile button */}
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main Content: Render Active Page Only */}
      <main className="flex-1 pb-10">
        {activeSection === "recommend" && (
          <SchemeRecommender
            onSelectForCalculator={handleSelectForCalculator}
            onSelectForLocator={handleSelectForLocator}
          />
        )}

        {activeSection === "calculate" && (
          <FinancialCalculator
            initialScheme={selectedScheme}
            initialAmount={selectedAmount}
            onRouteToPartners={(schemeId) => handleSelectForLocator(schemeId)}
          />
        )}

        {activeSection === "locate" && (
          <PartnerLocator
            initialSchemeId={selectedCategoryFilter}
          />
        )}
      </main>

      {/* Bottom Navigation: Find Scheme, Calculate EMI, and Nearby Bank */}
      <BottomNav activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
