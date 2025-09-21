import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from "recharts";

const pieData = [
  { name: 'Revenue', value: 45, color: '#3b82f6' },
  { name: 'Costs', value: 30, color: '#06b6d4' },
  { name: 'Profit', value: 25, color: '#10b981' },
];

const barData = [
  { name: 'Q1', value: 400 },
  { name: 'Q2', value: 600 },
  { name: 'Q3', value: 800 },
  { name: 'Q4', value: 1000 },
];

const lineData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 600 },
  { name: 'Mar', value: 500 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 900 },
  { name: 'Jun', value: 1200 },
];

const AnimatedCharts = () => {
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Beautiful Analytics in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how your Superset charts transform into stunning, interactive dashboards
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Animated Pie Chart */}
          <motion.div
            className="chart-container"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Revenue Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Animated Bar Chart */}
          <motion.div
            className="chart-container"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Quarterly Growth</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Bar 
                  dataKey="value" 
                  fill="hsl(217 91% 60%)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Animated Line Chart */}
          <motion.div
            className="chart-container"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(142 71% 45%)" 
                  strokeWidth={3}
                  dot={false}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Feature Highlight */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-6 py-3 rounded-full">
            <motion.div
              className="w-3 h-3 bg-success rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="font-medium">Real-time data synchronization with Apache Superset</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AnimatedCharts;