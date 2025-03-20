"use client";

import { Area, AreaChart, CartesianGrid, Line } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

const chartData = [
  { month: "January", volume1: 186, volume2: 120, volume3: 150 },
  { month: "February", volume1: 305, volume2: 200, volume3: 250 },
  { month: "March", volume1: 237, volume2: 150, volume3: 200 },
  { month: "April", volume1: 73, volume2: 90, volume3: 100 },
  { month: "May", volume1: 209, volume2: 180, volume3: 220 },
  { month: "June", volume1: 214, volume2: 160, volume3: 210 },
];

const chartConfig = {
  volume1: {
    color: "#F64C4C",
  },
  volume2: {
    color: "#F8589F",
  },
  volume3: {
    color: "#00FF00", 
  },
};

const Accuracy_over_time = () => {
  return (
    <div className="flex-1 accuracy">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Accuracy over time
      </h3>
      <div className="bg-[#FFFFFF] box overflow-hidden rounded-[16px] h-[320px]">
        <Card className="border-none shadow-none h-[280px]">
          <CardContent className="p-0">
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
                height={300}
              >
                <defs>
                  <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F9ADE7" />
                    <stop offset="100%" stopColor="rgba(249, 173, 231, 0.00)" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFE1F0" />
                    <stop offset="100%" stopColor="#FFF" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={true}
                  horizontal={false}
                  stroke="#E0E0E0"
                />
                <Area
                  dataKey="volume1"
                  type="monotone"
                  fill="url(#gradient2)"
                  fillOpacity={1}
                  stroke="#F64C4C"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="volume2"
                  type="monotone" // More curved line
                  fill="url(#gradient1)"
                  fillOpacity={1}
                  stroke="#F8589F"
                  strokeWidth={2}
                  stackId="a"
                />
                <Line
                  dataKey="volume3"
                  type="monotone" // More curved line
                  stroke="#00FF00" // Color for the additional line
                  strokeWidth={2}
                  dot={false} // Remove dots if needed
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <div className="flex items-center justify-center gap-16 z-[50] mt-[8px]">
          <span className="block relative text-[#191919] font-[500] text-[13px] after:w-[8px] after:h-[8px] after:rounded-[50%] after:bg-[#F8589F] after:absolute after:left-[-12px] after:top-[50%] after:translate-y-[-50%]">
            Your accuracy
          </span>
          <span className="block relative text-[#191919] font-[500] text-[13px] after:w-[8px] after:h-[8px] after:rounded-[50%] after:bg-[#F64C4C] after:absolute after:left-[-12px] after:top-[50%] after:translate-y-[-50%]">
            Your average
          </span>
        </div>
      </div>
    </div>
  );
};

export default Accuracy_over_time;
