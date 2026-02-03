import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import MarketPricesWidget from "@/components/MarketPricesWidget";
import WeatherWidget from "@/components/WeatherWidget";
import SchemesSection from "@/components/SchemesSection";
import AIAdvisoryPreview from "@/components/AIAdvisoryPreview";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <MarketPricesWidget />
        <WeatherWidget />
        <SchemesSection />
        <AIAdvisoryPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
