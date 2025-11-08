"use client";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { motion } from "framer-motion";

const Stren_Weakn = ({
  subject_strengths,
  subject_recommendations = [],
}) => {
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
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919] dark:text-white">
          Forces et Faiblesses
        </h3>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl px-6 py-6 box h-[327px] flex items-center justify-center border border-transparent dark:border-gray-700">
          <div className="bg-white dark:bg-[#1a1a1a] px-6 py-3 rounded-full shadow-md border-[2px] border-[#F8589F]">
            <span className="text-[#F8589F] font-medium text-[18px]">
              Pas de données pour le moment
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Map filtered subjects to chart data
  const chartData = filteredSubjects.map((item) => {
    const label = item.subject.split(":")[0].trim();
    const strength = item.strength ?? 0;
    const accuracy = item.accuracy ?? strength;
    const consistency = item.consistency ?? strength;
    return {
      axis: label,
      strength,
      accuracy,
      consistency,
      attempts: item.attempts ?? 0,
      unique_mcqs: item.unique_mcqs ?? 0,
      average_time: item.average_time ?? 0,
    };
  });

  // Calculate average performance
  const avgStrength = chartData.reduce((sum, item) => sum + item.strength, 0) / chartData.length;
  const performanceStatus = avgStrength >= 70 ? "excellent" : avgStrength >= 50 ? "good" : "needs_improvement";

  const statusConfig = {
    excellent: { text: "Excellent", color: "#47B881", bgColor: "bg-green-50 dark:bg-green-900/20" },
    good: { text: "Bon", color: "#FFAA60", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
    needs_improvement: { text: "À améliorer", color: "#F64C4C", bgColor: "bg-red-50 dark:bg-red-900/20" }
  };

  const status = statusConfig[performanceStatus];

  return (
    <motion.div
      id="tour-stren-weakn"
      className="flex-1 weak max-xl:w-full gap-4 flex flex-col"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex items-center justify-between mb-4"
        variants={headerVariants}
      >
        <h3 className="font-[500] text-[17px] text-[#191919] dark:text-white">
          Forces et Faiblesses
        </h3>
        <div className={`${status.bgColor} px-3 py-1 rounded-full`}>
          <span className="text-xs font-medium" style={{ color: status.color }}>
            {status.text} • {Math.round(avgStrength)}%
          </span>
        </div>
      </motion.div>
      <motion.div
        className="bg-white dark:bg-[#1a1a1a] rounded-2xl px-4 md:px-6 py-5 box h-[327px] relative overflow-hidden border border-transparent dark:border-gray-700 flex flex-col"
        variants={contentVariants}
        whileHover={{
          boxShadow: "0 12px 30px rgba(248, 88, 159, 0.1)",
          transition: { duration: 0.3 },
        }}
      >
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-green-50/30 dark:from-pink-900/10 dark:via-transparent dark:to-green-900/10 pointer-events-none"></div>

        <Card className="border-none shadow-none relative z-10">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-50/80 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F8589F] shadow-sm"></span>
                <span className="text-xs font-semibold text-[#F8589F]">
                  Précision
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                <span className="h-2.5 w-2.5 rounded-full bg-[#34D399] shadow-sm"></span>
                <span className="text-xs font-semibold text-[#047857]">
                  Régularité
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <ChartContainer
              config={{}}
              className="mx-auto w-full max-w-[360px] aspect-square max-md:aspect-[4/3] max-h-[260px]"
            >
              <RadarChart data={chartData} outerRadius={85}>
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 px-4 py-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {payload[0].payload.axis}
                          </p>
                          <p className="text-[11px] text-muted-foreground mb-2">
                            Force : {payload[0].payload.strength}%
                          </p>
                          <div className="text-xs space-y-1">
                            <p className="text-[#F8589F] font-medium">
                              Précision : {payload[0].payload.accuracy}%
                            </p>
                            <p className="text-[#047857] font-medium">
                              Régularité : {payload[0].payload.consistency}%
                            </p>
                            <p className="text-muted-foreground">
                              {payload[0].payload.attempts} tentatives •{" "}
                              {payload[0].payload.unique_mcqs} uniques
                            </p>
                            <p className="text-muted-foreground">
                              Temps moyen : {payload[0].payload.average_time}s
                            </p>
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
                  className="dark:[&_text]:fill-white"
                />
                <PolarGrid
                  gridType="polygon"
                  radialLines={true}
                  stroke="#E5E7EB"
                  className="dark:stroke-gray-700"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <Radar
                  name="Précision"
                  dataKey="accuracy"
                  fill="#F8589F"
                  fillOpacity={0.18}
                  stroke="#F8589F"
                  strokeWidth={2.5}
                  dot={{ fill: "#F8589F", r: 4, strokeWidth: 2, stroke: "#fff" }}
                  animationDuration={1000}
                />
                <Radar
                  name="Régularité"
                  dataKey="consistency"
                  fill="#34D399"
                  fillOpacity={0.18}
                  stroke="#047857"
                  strokeWidth={2.5}
                  dot={{ fill: "#10B981", r: 4, strokeWidth: 2, stroke: "#fff" }}
                  animationDuration={1200}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="relative z-10 mt-4 w-full">
        {subject_recommendations?.length ? (
          <div className="rounded-2xl border border-border bg-white dark:bg-[#111] p-4 shadow-sm max-w-[420px] w-full max-md:max-w-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-muted-foreground">
                Sujets à prioriser
              </p>
              <span className="text-[11px] text-muted-foreground">
                Basé sur vos dernières sessions
              </span>
            </div>
            <ul className="space-y-3">
              {subject_recommendations.map((subject) => (
                <li
                  key={subject.subject_id}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {subject.subject}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {subject.attempts} tentatives • {subject.accuracy}% précision
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold text-[#F64C4C]">
                    {Math.round(subject.strength)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-4 py-4 text-center text-sm text-muted-foreground">
            Pas de priorité urgente – continuez sur votre lancée !
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Stren_Weakn;
