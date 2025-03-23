"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  {
    month: "january",
    correct: 68,
    incorrect: 32,
    questions: 120,
    growth: 3.4,
  },
];

const Performance = () => {
  const totalQuestions = chartData[0].questions;

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
                                  {totalQuestions.toLocaleString()}
                                </span>
                                <span className="text-[#B5BEC6] text-[18px] font-[500] my-2 leading-tight">
                                  Questions attempted
                                </span>
                                <span className="inline-block text-[#47B881] px-[12px] py-[3px] rounded-[16px] text-[13px] font-[500] bg-[#E8F7F0] mt-1">
                                  +{chartData[0].growth}% from last month
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
                  Incorrect answers
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm bg-[#FFF5FA] py-[3px] px-[16px] rounded-[16px] text-[#F8589F] font-[500]">
                  Correct answers
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
