import { motion } from "framer-motion";
import { Database, Users, BarChart3, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

const KPISection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Trusted by Leading Organizations
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powering data-driven decisions across industries with enterprise-grade analytics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <KPICard
            icon={<Database className="h-8 w-8" />}
            value={2500}
            label="Charts Created"
            suffix="+"
            delay={0.1}
          />
          <KPICard
            icon={<Users className="h-8 w-8" />}
            value={150}
            label="Active Clients"
            suffix="+"
            delay={0.2}
          />
          <KPICard
            icon={<BarChart3 className="h-8 w-8" />}
            value={500}
            label="Dashboards Built"
            suffix="+"
            delay={0.3}
          />
          <KPICard
            icon={<TrendingUp className="h-8 w-8" />}
            value={99.9}
            label="Uptime"
            suffix="%"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
};

interface KPICardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix: string;
  delay: number;
}

const KPICard = ({ icon, value, label, suffix, delay }: KPICardProps) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (hasStarted) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = value / steps;
      let currentCount = 0;

      const timer = setInterval(() => {
        currentCount += increment;
        if (currentCount >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(currentCount));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [hasStarted, value]);

  return (
    <motion.div
      className="group relative bg-background rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/50 hover:border-primary/30 overflow-hidden text-center"
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.8,
          delay,
          type: "spring",
          damping: 20,
          stiffness: 100
        }
      }}
      viewport={{ once: true, margin: "-50px" }}
      onViewportEnter={() => setHasStarted(true)}
      whileHover={{
        scale: 1.05,
        y: -8,
        transition: { duration: 0.3, type: "spring", damping: 15 }
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Animated particles */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
        <div className="absolute bottom-4 left-4 w-1 h-1 bg-primary/40 rounded-full animate-ping" />
      </div>

      <motion.div
        className="text-primary mb-6 flex justify-center relative z-10"
        whileHover={{
          scale: 1.2,
          rotate: 10,
          transition: { duration: 0.3, type: "spring" }
        }}
        initial={{ scale: 0, rotate: -180 }}
        whileInView={{ scale: 1, rotate: 0 }}
        transition={{ delay: delay + 0.2, duration: 0.6, type: "spring" }}
      >
        <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
          {icon}
        </div>
      </motion.div>

      <motion.div
        className="text-4xl md:text-5xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300 relative z-10"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ delay: delay + 0.3, type: "spring", damping: 15 }}
      >
        {count.toLocaleString()}{suffix}
      </motion.div>

      <motion.div
        className="text-muted-foreground font-medium text-lg relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.4 }}
      >
        {label}
      </motion.div>

      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-primary/0 group-hover:border-primary/20 transition-colors duration-500" />
    </motion.div>
  );
};

export default KPISection;