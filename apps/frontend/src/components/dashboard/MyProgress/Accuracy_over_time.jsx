"use client";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const Précision_au_Cours_Du_Temps = ({ accuracy_trend }) => {
  // Premium animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.15,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Vérifier si les données sont vides ou non disponibles
  if (!accuracy_trend || accuracy_trend.length === 0) {
    return (
      <motion.div
        className="flex-1 accuracy"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919] dark:text-white">
          Précision au cours du temps
        </h3>
        <div className="bg-[#FFFFFF] dark:bg-[#1a1a1a] box rounded-[16px] h-[320px] flex items-center justify-center border border-transparent dark:border-gray-700">
          <div className="bg-white dark:bg-[#1a1a1a] px-6 py-3 rounded-full shadow-md border-[2px] border-[#F8589F]">
            <span className="text-[#F8589F] font-medium text-[18px]">
              Aucune donnée pour l&apos;instant
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  const chartData = accuracy_trend.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    fullDate: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    accuracy: Math.round(item.daily_accuracy * 100),
    target: 80, // Ligne de cible
    index
  }));

  // Calculate statistics
  const avgAccuracy = Math.round(chartData.reduce((sum, item) => sum + item.accuracy, 0) / chartData.length);
  const firstAccuracy = chartData[0]?.accuracy || 0;
  const lastAccuracy = chartData[chartData.length - 1]?.accuracy || 0;
  const trend = lastAccuracy - firstAccuracy;
  const trendPercentage = firstAccuracy > 0 ? ((trend / firstAccuracy) * 100).toFixed(1) : 0;

  const getTrendIcon = () => {
    if (trend > 5) return <TrendingUp className="w-4 h-4" />;
    if (trend < -5) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend > 5) return "#47B881";
    if (trend < -5) return "#F64C4C";
    return "#FFAA60";
  };

  const getTrendText = () => {
    if (trend > 5) return "En progression";
    if (trend < -5) return "En baisse";
    return "Stable";
  };

  return (
    <motion.div
      id="tour-accuracy-over-time"
      className="flex-1 accuracy"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex items-center justify-between mb-4"
        variants={headerVariants}
      >
        <h3 className="font-[500] text-[17px] text-[#191919] dark:text-white">
          Précision au cours du temps
        </h3>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${getTrendColor()}15` }}>
          <span style={{ color: getTrendColor() }}>
            {getTrendIcon()}
          </span>
          <span className="text-xs font-semibold" style={{ color: getTrendColor() }}>
            {getTrendText()}
          </span>
        </div>
      </motion.div>

      <motion.div
        className="bg-[#FFFFFF] dark:bg-[#1a1a1a] box overflow-hidden rounded-[16px] h-[320px] relative border border-transparent dark:border-gray-700"
        whileHover={{
          boxShadow: "0 12px 30px rgba(248, 88, 159, 0.1)",
          transition: { duration: 0.3 },
        }}
      >
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/20 via-transparent to-purple-50/20 dark:from-pink-900/10 dark:via-transparent dark:to-purple-900/10 pointer-events-none"></div>

        <Card className="border-none shadow-none h-full relative z-10">
          <CardContent className="p-4 h-full">
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F8589F" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#F8589F" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#F8589F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#47B881" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#47B881" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  className="dark:stroke-gray-700"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  className="dark:[&_text]:fill-gray-400"
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#F8589F", fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const accuracyPoint = payload.find(
                        (item) => item.dataKey === "accuracy",
                      );
                      const targetPoint = payload.find(
                        (item) => item.dataKey === "target",
                      );

                      if (!accuracyPoint) return null;

                      return (
                        <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {accuracyPoint.payload.fullDate}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#F8589F]"></div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              Précision: {accuracyPoint.value}%
                            </span>
                          </div>
                          {targetPoint && (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-2 h-2 rounded-full bg-[#47B881]"></div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                Objectif: {targetPoint.value}%
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Target line */}
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#47B881"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#targetGradient)"
                  fillOpacity={1}
                  dot={false}
                />

                {/* Accuracy area */}
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#F8589F"
                  strokeWidth={3}
                  fill="url(#accuracyGradient)"
                  fillOpacity={1}
                  dot={{ fill: "#F8589F", strokeWidth: 2, stroke: "#fff", r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff", fill: "#F8589F" }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend with stats */}
            <div className="flex items-center justify-between px-4 mt-2">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F8589F] shadow-sm"></div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Votre précision</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-[#47B881]"></div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Objectif (80%)</span>
                </div>
              </div>
              <div className="px-3 py-1 rounded-lg bg-pink-50 dark:bg-pink-900/20">
                <span className="text-xs font-semibold text-[#F8589F]">Moy: {avgAccuracy}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Précision_au_Cours_Du_Temps;
