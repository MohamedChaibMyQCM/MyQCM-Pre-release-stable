"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

const MotionDiv = motion.div;
const MotionH3 = motion.h3;

// تحكم سريع في سمك الحلقة
const RING_SIZE = 39; // جرّب 22–32 حسب ذوقك

const Performance = ({ performance }) => {
  const [hoveredSection, setHoveredSection] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  if (!performance) {
    return (
      <div id="tour-performance-summary" className="flex-1 performance">
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919] dark:text-white">Performance</h3>
        <div className="bg-[#FFFFFF] dark:bg-[#1a1a1a] rounded-[16px] px-2 py-4 box h-[390px] flex items-center justify-center border border-transparent dark:border-gray-700">
          <div className="bg-white dark:bg-[#1a1a1a] px-6 py-3 rounded-full shadow-md border-[2px] border-[#F8589F]">
            <span className="text-[#F8589F] font-medium text-[18px]">
              Aucune donnée pour le moment
            </span>
          </div>
        </div>
      </div>
    );
  }

  const correct = Math.max(0, performance.correct_mcqs || 0);
  const incorrect = Math.max(0, performance.incorrect_mcqs || 0);
  const total = Math.max(0, correct + incorrect || performance.total_attempted_mcqs || 0);
  const accuracy = performance.overall_accuracy ?? (total ? (correct / total) * 100 : 0);

  const chartData = [
    {
      track: total, // حلقة الخلفية (نفس المجال عشان تبقى دائرة كاملة)
      correct,
      incorrect,
      total,
      accuracy,
      performanceBand: performance.performance_band || "poor",
    },
  ];

  const getPerformanceColor = (band) => {
    if (!band) return "#F64C4C";
    switch (band.toLowerCase()) {
      case "excellent":
        return "#47B881";
      case "good":
        return "#FFAA60";
      case "fair":
        return "#FFAD0D";
      case "poor":
      default:
        return "#F64C4C";
    }
  };

  const performanceColor = getPerformanceColor(performance.performance_band);

  return (
    <MotionDiv
      id="tour-performance-summary"
      className="flex-1 performance"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <MotionH3
        className="font-[500] text-[17px] mb-4 text-[#191919] dark:text-white"
        variants={headerVariants}
      >
        Performance
      </MotionH3>

      <MotionDiv
        className="relative bg-gradient-to-br from-white to-gray-50 dark:from-[#1a1a1a] dark:to-[#151515] rounded-[20px] px-3 py-5 box h-[390px] border border-gray-100 dark:border-gray-800 overflow-hidden"
        variants={cardVariants}
        whileHover={{ boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)", transition: { duration: 0.3 } }}
      >
        {/* orb الخلفية */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-pink-200/20 via-purple-200/20 to-blue-200/20 dark:from-pink-500/10 dark:via-purple-500/10 dark:to-blue-500/10 rounded-full blur-3xl -z-0" />

        <Card className="border-none shadow-none bg-transparent relative z-10">
          <CardContent className="max-md:!p-1 !p-2">
            <div className="relative flex items-center justify-center">
              <ChartContainer config={{}} className="mx-auto aspect-square w-full max-w-[320px] relative">
                <RadialBarChart
                  data={chartData}
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={100}
                  outerRadius={100 + RING_SIZE}
                >
                  <defs>
                    {/* حلقـة الخلفية */}
                    <linearGradient id="trackGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E5E7EB" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#D1D5DB" stopOpacity="0.35" />
                    </linearGradient>

                    <linearGradient id="correctGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F8589F" stopOpacity={1} />
                      <stop offset="100%" stopColor="#E91E73" stopOpacity={0.95} />
                    </linearGradient>

                    <linearGradient id="incorrectGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B6B" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#EE5A5A" stopOpacity={0.8} />
                    </linearGradient>

                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <foreignObject
                              x={(viewBox.cx || 0) - 110}
                              y={(viewBox.cy || 0) - 70}
                              width={220}
                              height={160}
                            >
                              <motion.div
                                className="flex flex-col items-center justify-center h-full text-center"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                              >
                                <motion.span
                                  className="text-[52px] text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 font-bold tracking-tight leading-none"
                                  initial={{ y: -10, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.4, duration: 0.4 }}
                                >
                                  {total.toLocaleString()}
                                </motion.span>
                                <motion.span
                                  className="text-[#9CA3AF] dark:text-gray-500 text-[14px] font-[500] mt-2 mb-3 leading-tight tracking-wide"
                                  initial={{ y: 10, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.5, duration: 0.4 }}
                                >
                                  Questions tentées
                                </motion.span>
                                <motion.div
                                  className="relative group"
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: 0.6, duration: 0.4 }}
                                >
                                  <div
                                    className="absolute inset-0 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity"
                                    style={{ backgroundColor: performanceColor }}
                                  />
                                  <span
                                    className="relative inline-flex items-center gap-1 px-5 py-2 rounded-full text-[13px] font-semibold tracking-wide backdrop-blur-sm"
                                    style={{
                                      color: performanceColor,
                                      backgroundColor: `${performanceColor}15`,
                                      border: `1.5px solid ${performanceColor}30`,
                                    }}
                                  >
                                    {Math.round(accuracy)}% précision
                                  </span>
                                </motion.div>
                              </motion.div>
                            </foreignObject>
                          );
                        }
                        return null;
                      }}
                    />
                  </PolarRadiusAxis>

                  {/* القيم الفعلية (Stack) */}
                  <RadialBar
                    dataKey="correct"
                    stackId="a"
                    barSize={RING_SIZE}
                    cornerRadius={RING_SIZE / 2}
                    fill="url(#correctGradient)"
                    className="stroke-transparent transition-all duration-300 cursor-pointer"
                    filter="url(#glow)"
                    style={{
                      opacity: hoveredSection === null || hoveredSection === "correct" ? 1 : 0.35,
                      transform: hoveredSection === "correct" ? "scale(1.01)" : "scale(1)",
                    }}
                    onMouseEnter={() => setHoveredSection("correct")}
                    onMouseLeave={() => setHoveredSection(null)}
                  />
                  <RadialBar
                    dataKey="incorrect"
                    stackId="a"
                    barSize={RING_SIZE}
                    cornerRadius={RING_SIZE / 2}
                    fill="url(#incorrectGradient)"
                    className="stroke-transparent transition-all duration-300 cursor-pointer"
                    style={{
                      opacity: hoveredSection === null || hoveredSection === "incorrect" ? 1 : 0.35,
                      transform: hoveredSection === "incorrect" ? "scale(1.01)" : "scale(1)",
                    }}
                    onMouseEnter={() => setHoveredSection("incorrect")}
                    onMouseLeave={() => setHoveredSection(null)}
                  />
                </RadialBarChart>
              </ChartContainer>
            </div>

            <motion.div
              className="flex items-center justify-center gap-6 mt-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <motion.div
                className="flex items-center gap-2.5 group cursor-pointer select-none"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
                onMouseEnter={() => setHoveredSection("incorrect")}
                onMouseLeave={() => setHoveredSection(null)}
                style={{ opacity: hoveredSection === null || hoveredSection === "incorrect" ? 1 : 0.5 }}
              >
                <div className="relative">
                  <div
                    className="absolute inset-0 bg-red-400/30 rounded-full blur-md transition-opacity duration-300"
                    style={{ opacity: hoveredSection === "incorrect" ? 1 : 0 }}
                  />
                  <XCircle className="w-5 h-5 text-red-500 relative z-10 transition-all duration-300" strokeWidth={hoveredSection === "incorrect" ? 3 : 2.5} />
                </div>
                <span className="text-[14px] text-gray-600 dark:text-gray-400 font-medium">Incorrecte</span>
                <span className="text-[15px] font-bold text-gray-900 dark:text-white px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 min-w-[32px] text-center">
                  {incorrect}
                </span>
              </motion.div>

              <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

              <motion.div
                className="flex items-center gap-2.5 group cursor-pointer select-none"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
                onMouseEnter={() => setHoveredSection("correct")}
                onMouseLeave={() => setHoveredSection(null)}
                style={{ opacity: hoveredSection === null || hoveredSection === "correct" ? 1 : 0.5 }}
              >
                <div className="relative">
                  <div
                    className="absolute inset-0 bg-pink-400/30 rounded-full blur-md transition-opacity duration-300"
                    style={{ opacity: hoveredSection === "correct" ? 1 : 0 }}
                  />
                  <CheckCircle2 className="w-5 h-5 text-[#F8589F] relative z-10 transition-all duration-300" strokeWidth={hoveredSection === "correct" ? 3 : 2.5} />
                </div>
                <span className="text-[14px] text-gray-600 dark:text-gray-400 font-medium">Correcte</span>
                <span className="text-[15px] font-bold text-gray-900 dark:text-white px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 min-w-[32px] text-center">
                  {correct}
                </span>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </MotionDiv>
    </MotionDiv>
  );
};

export default Performance;
