"use client";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { motion } from "framer-motion";

const Stren_Weakn = ({ subject_strengths }) => {
  // Premium animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.15,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
  // Filter out "Non classé" subjects early
  const filteredSubjects = subject_strengths?.filter((item) => {
    const subjectName = item.subject?.split(":")[0]?.trim() || "";
    return subjectName && subjectName.toLowerCase() !== "non classé";
  }) || [];

  // Vérifier si les données sont vides ou non disponibles
  if (!subject_strengths || subject_strengths.length === 0 || filteredSubjects.length === 0) {
    return (
      <div className="flex-1 weak max-xl:w-full">
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
          Forces et Faiblesses
        </h3>
        <div className="bg-white rounded-2xl px-6 py-6 box h-[327px] flex items-center justify-center">
          <div className="bg-white px-6 py-3 rounded-full shadow-md border-[2px] border-[#F8589F]">
            <span className="text-[#F8589F] font-medium text-[18px]">
              Pas de données pour le moment
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Map filtered subjects to chart data
  const chartData = filteredSubjects.map((item) => ({
    axis: item.subject.split(":")[0].trim(),
    value: 100 - item.strength,
    strength: item.strength,
  }));

  // Calculate average performance
  const avgStrength = chartData.reduce((sum, item) => sum + item.strength, 0) / chartData.length;
  const performanceStatus = avgStrength >= 70 ? "excellent" : avgStrength >= 50 ? "good" : "needs_improvement";

  const statusConfig = {
    excellent: { text: "Excellent", color: "#47B881", bgColor: "bg-green-50" },
    good: { text: "Bon", color: "#FFAA60", bgColor: "bg-orange-50" },
    needs_improvement: { text: "À améliorer", color: "#F64C4C", bgColor: "bg-red-50" }
  };

  const status = statusConfig[performanceStatus];

  return (
    <motion.div
      id="tour-stren-weakn"
      className="flex-1 weak max-xl:w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex items-center justify-between mb-4"
        variants={headerVariants}
      >
        <h3 className="font-[500] text-[17px] text-[#191919]">
          Forces et Faiblesses
        </h3>
        <div className={`${status.bgColor} px-3 py-1 rounded-full`}>
          <span className="text-xs font-medium" style={{ color: status.color }}>
            {status.text} • {Math.round(avgStrength)}%
          </span>
        </div>
      </motion.div>
      <motion.div
        className="bg-white rounded-2xl px-6 py-6 box h-[327px] relative overflow-hidden"
        variants={contentVariants}
        whileHover={{
          boxShadow: "0 12px 30px rgba(248, 88, 159, 0.1)",
          transition: { duration: 0.3 },
        }}
      >
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-green-50/30 pointer-events-none"></div>

        <Card className="border-none shadow-none relative z-10">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50/80 border border-red-100">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F64C4C] shadow-sm"></span>
                <span className="text-xs font-semibold text-[#F64C4C]">
                  Faible
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50/80 border border-green-100">
                <span className="h-2.5 w-2.5 rounded-full bg-[#47B881] shadow-sm"></span>
                <span className="text-xs font-semibold text-[#47B881]">
                  Fort
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[240px]"
            >
              <RadarChart data={chartData} outerRadius={85}>
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white px-4 py-2.5 rounded-xl shadow-lg border border-gray-100">
                          <p className="font-semibold text-sm text-gray-900 mb-1">{payload[0].payload.axis}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#47B881] font-medium">Force: {payload[0].payload.strength}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "#191919", fontSize: 11, fontWeight: 500 }}
                />
                <PolarGrid
                  gridType="polygon"
                  radialLines={true}
                  stroke="#E5E7EB"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <Radar
                  name="Faiblesses"
                  dataKey="value"
                  fill="#F64C4C"
                  fillOpacity={0.15}
                  stroke="#F64C4C"
                  strokeWidth={2.5}
                  dot={{ fill: "#F64C4C", r: 4, strokeWidth: 2, stroke: "#fff" }}
                  animationDuration={1000}
                />
                <Radar
                  name="Forces"
                  dataKey="strength"
                  fill="#47B881"
                  fillOpacity={0.2}
                  stroke="#47B881"
                  strokeWidth={2.5}
                  dot={{ fill: "#47B881", r: 4, strokeWidth: 2, stroke: "#fff" }}
                  animationDuration={1200}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Stren_Weakn;
