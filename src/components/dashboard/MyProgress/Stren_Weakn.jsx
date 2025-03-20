"use client";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { axis: "Cardio", value: 60, strength: 90 },
  { axis: "Endurance", value: 85, strength: 60 }, 
  { axis: "Radio", value: 60, strength: 80 },
  { axis: "Neuro", value: 90, strength: 40 },
  { axis: "Chemistry", value: 50, strength: 80 },
  { axis: "Derma", value: 35, strength: 70 },
];

const Stren_Weakn = () => {
  return (
    <div className="flex-1 weak">
      <h3 className="font-medium text-lg mb-4 text-gray-900">
        Strengths & Weaknesses
      </h3>
      <div className="bg-white rounded-2xl px-6 py-6 box h-[327px]">
        <Card className="border-none shadow-none">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-8 relative">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#F64C4C]">Weak</span>
                <span className="h-2 w-2 rounded-full bg-[#F64C4C]"></span>
              </div>
              <span className="w-[32px] bg-[#E7E7E7] h-[1.6px] absolute left-[54px]"></span>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#47B881]"></span>
                <span className="text-sm font-medium text-[#47B881]">
                  Strong
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadarChart data={chartData} outerRadius={90}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "#000", fontSize: 12 }}
                />
                <PolarGrid
                  gridType="polygon"
                  radialLines={true}
                  stroke="#e0e0e0"
                  strokeDasharray="3 3"
                />
                <Radar
                  name="Weaknesses"
                  dataKey="value"
                  fill="#F64C4C"
                  fillOpacity={0.2}
                  stroke="#F64C4C"
                  strokeWidth={2}
                  dot={{ fill: "#F64C4C", r: 3 }}
                />
                <Radar
                  name="Strengths"
                  dataKey="strength"
                  fill="#47B881"
                  fillOpacity={0.2}
                  stroke="#47B881"
                  strokeWidth={2}
                  dot={{ fill: "#47B881", r: 3 }}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stren_Weakn;
