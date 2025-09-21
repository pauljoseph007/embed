import { motion } from "framer-motion";
import { BarChart3, Database, Users, Shield, Zap, Globe } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Interactive Dashboards",
      description: "Create stunning, interactive dashboards with drag-and-drop functionality. Build Power BI-style visualizations with ease."
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Superset Integration",
      description: "Seamlessly embed Apache Superset charts and dashboards. Connect to your existing data infrastructure effortlessly."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Multi-Tenant Access",
      description: "Manage user access with role-based permissions. Create dashboard-specific users and control data visibility."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Bank-grade security with encrypted sessions, secure authentication, and comprehensive audit trails."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-Time Updates",
      description: "Get real-time data updates and live dashboard refreshes. Stay connected to your business metrics 24/7."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Cloud Ready",
      description: "Deploy anywhere - cloud, on-premise, or hybrid. Scale effortlessly with enterprise-grade infrastructure."
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Powerful Features for Modern Analytics
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your data into actionable insights with our comprehensive business intelligence platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative bg-background rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/50 hover:border-primary/20 overflow-hidden"
              initial={{ opacity: 0, y: 50, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                type: "spring",
                damping: 20,
                stiffness: 100
              }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3, type: "spring", damping: 15 }
              }}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Animated icon container */}
              <motion.div
                className="text-primary mb-6 flex justify-center relative z-10"
                whileHover={{
                  scale: 1.2,
                  rotate: 5,
                  transition: { duration: 0.3, type: "spring" }
                }}
              >
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  {feature.icon}
                </div>
              </motion.div>

              <motion.h3
                className="text-xl font-semibold text-foreground mb-4 text-center relative z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.15 + 0.3 }}
              >
                {feature.title}
              </motion.h3>

              <motion.p
                className="text-muted-foreground text-center leading-relaxed relative z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.15 + 0.4 }}
              >
                {feature.description}
              </motion.p>

              {/* Animated border effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
