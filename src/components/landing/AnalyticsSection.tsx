import { motion } from "framer-motion";
import { TrendingUp, PieChart, BarChart3, LineChart, Activity, Target } from "lucide-react";

const AnalyticsSection = () => {
  const analyticsFeatures = [
    {
      icon: <TrendingUp className="h-12 w-12" />,
      title: "Advanced Analytics",
      description: "Leverage machine learning and AI-powered insights to discover hidden patterns in your data.",
      stats: "95% accuracy"
    },
    {
      icon: <PieChart className="h-12 w-12" />,
      title: "Custom Visualizations",
      description: "Create stunning charts, graphs, and interactive visualizations tailored to your business needs.",
      stats: "50+ chart types"
    },
    {
      icon: <BarChart3 className="h-12 w-12" />,
      title: "Performance Metrics",
      description: "Track KPIs, monitor performance, and measure success with comprehensive business metrics.",
      stats: "Real-time updates"
    },
    {
      icon: <LineChart className="h-12 w-12" />,
      title: "Trend Analysis",
      description: "Identify trends, forecast future performance, and make data-driven strategic decisions.",
      stats: "Predictive insights"
    },
    {
      icon: <Activity className="h-12 w-12" />,
      title: "Live Monitoring",
      description: "Monitor your business in real-time with live dashboards and instant alert notifications.",
      stats: "24/7 monitoring"
    },
    {
      icon: <Target className="h-12 w-12" />,
      title: "Goal Tracking",
      description: "Set targets, track progress, and achieve your business objectives with precision analytics.",
      stats: "Goal achievement"
    }
  ];

  return (
    <section id="analytics" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Advanced Analytics & Intelligence
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlock the full potential of your data with enterprise-grade analytics tools and intelligent insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {analyticsFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-8 hover:from-primary/15 hover:to-primary/25 transition-all duration-500 border border-primary/10 hover:border-primary/30 overflow-hidden"
              initial={{ opacity: 0, y: 60, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: index * 0.2,
                type: "spring",
                damping: 25,
                stiffness: 120
              }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{
                scale: 1.08,
                y: -15,
                rotateY: 5,
                transition: { duration: 0.4, type: "spring", damping: 20 }
              }}
            >
              {/* Animated background particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
                <div className="absolute bottom-6 left-6 w-1 h-1 bg-primary/40 rounded-full animate-ping" />
                <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce" />
              </div>

              {/* Enhanced icon animation */}
              <motion.div
                className="text-primary mb-6 relative z-10"
                whileHover={{
                  scale: 1.3,
                  rotate: 10,
                  transition: { duration: 0.4, type: "spring", damping: 15 }
                }}
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.2 + 0.3, duration: 0.6, type: "spring" }}
              >
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/25 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
                  {feature.icon}
                </div>
              </motion.div>

              <motion.h3
                className="text-xl font-semibold text-foreground mb-3 relative z-10"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 + 0.4 }}
              >
                {feature.title}
              </motion.h3>

              <motion.p
                className="text-muted-foreground mb-4 leading-relaxed relative z-10"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 + 0.5 }}
              >
                {feature.description}
              </motion.p>

              <motion.div
                className="inline-flex items-center px-4 py-2 bg-primary/20 text-primary text-sm font-medium rounded-full group-hover:bg-primary/30 group-hover:scale-105 transition-all duration-300 relative z-10"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 + 0.6, type: "spring" }}
                whileHover={{ scale: 1.1 }}
              >
                {feature.stats}
              </motion.div>

              {/* Animated glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Analytics Demo Section */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Your Data?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of organizations already using SDX Partners Intelligence Portal to drive business growth through data-driven insights.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Dashboards Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">2.5M+</div>
                <div className="text-muted-foreground">Data Points Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-muted-foreground">System Uptime</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AnalyticsSection;
