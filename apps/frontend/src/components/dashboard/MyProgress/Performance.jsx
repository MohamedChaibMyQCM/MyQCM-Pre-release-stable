"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { motion } from "framer-motion";

const MotionDiv = motion.div;
const MotionH3 = motion.h3;

const Performance = ({ performance }) => {
  // Premium animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.1,
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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };
  if (!performance) {
    return (
      <div id="tour-performance-summary" className="flex-1 performance">
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919] dark:text-white">
          Performance
        </h3>
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

  const chartData = [
    {
      correct: performance.correct_mcqs || 0,
      incorrect: performance.incorrect_mcqs || 0,
      total: performance.total_attempted_mcqs || 0,
      accuracy: performance.overall_accuracy || 0,
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
        className="bg-[#FFFFFF] dark:bg-[#1a1a1a] rounded-[16px] px-2 py-4 box h-[390px] border border-transparent dark:border-gray-700"
        variants={cardVariants}
        whileHover={{
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.1)",
          transition: { duration: 0.3 },
        }}
      >
        <Card className="border-none shadow-none">
          <CardContent className="max-md:!p-2">
            <div className="relative flex items-center justify-center">
              <ChartContainer
                config={{}}
                className="mx-auto aspect-square w-full max-w-[300px]"
              >
                <RadialBarChart
                  data={chartData}
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={160}
                  outerRadius={96}
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <PolarRadiusAxis
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <foreignObject
                              x={(viewBox.cx || 0) - 100}
                              y={(viewBox.cy || 0) - 50}
                              width={200}
                              height={140}
                            >
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                <span className="text-[30px] text-[#191919] dark:text-white font-bold">
                                  {chartData[0].total.toLocaleString()}
                                </span>
                                <span className="text-[#B5BEC6] dark:text-gray-400 text-[18px] font-[500] my-2 leading-tight">
                                  Questions tentées
                                </span>
                                <span
                                  className="inline-block px-[12px] py-[3px] rounded-[16px] text-[13px] font-[500] mt-1"
                                  style={{
                                    color: performanceColor,
                                    backgroundColor: `${performanceColor}20`,
                                  }}
                                >
                                  {Math.round(chartData[0].accuracy)}% de
                                  précision
                                </span>
                              </div>
                            </foreignObject>
                          );
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                  <RadialBar
                    dataKey="correct"
                    stackId="a"
                    cornerRadius={5}
                    fill="#F8589F"
                    className="stroke-transparent stroke-2"
                  />
                  <RadialBar
                    dataKey="incorrect"
                    fill="#F64C4C"
                    stackId="a"
                    cornerRadius={5}
                    className="stroke-transparent stroke-2"
                  />
                </RadialBarChart>
              </ChartContainer>
            </div>

            <div className="flex justify-between mt-14">
              <div className="flex items-center">
                <span className="text-sm bg-[#FFEBEE] py-[3px] px-[16px] rounded-[16px] text-[#F64C4C] font-[500]">
                  Réponse incorrecte
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm bg-[#FFF5FA] py-[3px] px-[16px] rounded-[16px] text-[#F8589F] font-[500]">
                  Réponse correcte
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    </MotionDiv>
  );
};

export default Performance;
