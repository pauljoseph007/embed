import Header from "@/components/layout/Header";
import HeroSection from "@/components/landing/HeroSection";
import KPISection from "@/components/landing/KPISection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AnalyticsSection from "@/components/landing/AnalyticsSection";
import AnimatedCharts from "@/components/landing/AnimatedCharts";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <KPISection />
        <FeaturesSection />
        <AnalyticsSection />
        <AnimatedCharts />
      </main>
    </div>
  );
};

export default Index;
