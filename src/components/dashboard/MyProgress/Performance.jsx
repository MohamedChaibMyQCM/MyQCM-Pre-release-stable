"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const Performance = ({ performance }) => {
  if (!performance) {
    return (
      <div className="flex-1 performance">
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
          Performance
        </h3>
        <div className="bg-[#FFFFFF] rounded-[16px] px-2 py-4 box h-[390px] flex items-center justify-center">
          <div className="bg-white px-6 py-3 rounded-full shadow-md border-[2px] border-[#F8589F]">
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
    <div className="flex-1 performance">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Performance
      </h3>
      <div className="bg-[#FFFFFF] rounded-[16px] px-2 py-4 box h-[390px]">
        <Card className="border-none shadow-none">
          <CardContent>
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
                                <span className="text-[30px] text-[#191919] font-bold">
                                  {chartData[0].total.toLocaleString()}
                                </span>
                                <span className="text-[#B5BEC6] text-[18px] font-[500] my-2 leading-tight">
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
      </div>
    </div>
  );
};

export default Performance;
