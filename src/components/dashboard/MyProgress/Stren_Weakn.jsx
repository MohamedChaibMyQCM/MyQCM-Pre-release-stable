"use client";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Adjust these values to match exactly the shape of your screenshot
const chartData = [
  { axis: "Cardio", value: 80 },
  { axis: "Radio", value: 60 },
  { axis: "Neuro", value: 30 },
  { axis: "Chemistry", value: 50 },
  { axis: "Derma", value: 70 },
  { axis: "Strong", value: 90 }, // Added a sixth data point
];

const Stren_Weakn = () => {
  return (
    <div className="flex-1">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Strengths & Weaknesses
      </h3>
      <div className="bg-[#FFFFFF] rounded-[16px] px-6 py-6 box">
        <Card className="border-none shadow-none ">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-4">
              <span className="text-[14px] text-[#F64C4C] font-[500]">
                Weak
              </span>
              <span className="text-[14px] text-[#47B881] font-[500]">
                Strong
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadarChart data={chartData}>
                {/* Tooltip for hovering over the points */}
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                {/* Axis labels (e.g., Cardio, Radio, etc.) */}
                <PolarAngleAxis dataKey="axis" />
                {/* Hexagonal grid lines */}
                <PolarGrid radialLines={false} />
                {/* Single radar polygon, styled in pink/purple */}
                <Radar
                  dataKey="value"
                  fill="#8884d8" // Adjust color to match the image
                  fillOpacity={0.2} // slight fill to mimic the image
                  stroke="#8884d8" // outline color
                  strokeWidth={2}
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
