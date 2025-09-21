import { motion } from "framer-motion";
import { BarChart3, PieChart, TrendingUp, Users, Database, Zap, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LoginModal } from "@/components/auth/LoginModal";

const HeroSection = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/4 w-16 h-16 bg-white rounded-full"
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        <div className="text-center text-white">
          {/* Main Headline */}
          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            SDX Partners
            <br />
            <span className="text-primary-light">Intelligence Portal</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transform your Superset analytics into beautiful, 
            Power BI-style dashboards with drag-and-drop simplicity
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90"
              onClick={() => setShowLoginModal(true)}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Start Building Dashboards
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary bg-transparent"
              onClick={() => setShowLoginModal(true)}
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign In to Portal
            </Button>
          </motion.div>

          {/* Animated Feature Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <FeatureCard
              icon={<PieChart className="h-8 w-8" />}
              title="Professional BI Dashboards"
              description="Create unlimited Power BI-style dashboards with multi-sheet support and advanced theming"
              delay={0.1}
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Drag & Drop Builder"
              description="Power BI-style canvas with intuitive chart placement and resizing capabilities"
              delay={0.2}
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Superset Integration"
              description="Seamlessly embed charts from Apache Superset with iframe to SDK conversion"
              delay={0.3}
            />
          </motion.div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="text-primary-light mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-white/80">{description}</p>
    </motion.div>
  );
};

export default HeroSection;