"use client";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const Stren_Weakn = ({ subject_strengths }) => {
  // Vérifier si les données sont vides ou non disponibles
  if (!subject_strengths || subject_strengths.length === 0) {
    return (
      <div className="flex-1 weak">
        <h3 className="font-medium text-lg mb-4 text-gray-900">
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

  const chartData = subject_strengths.map((item) => ({
    axis: item.subject.split(":")[0].trim(),
    value: 100 - item.strength,
    strength: item.strength,
  }));

  return (
    <div className="flex-1 weak">
      <h3 className="font-medium text-lg mb-4 text-gray-900">
        Forces et Faiblesses
      </h3>
      <div className="bg-white rounded-2xl px-6 py-6 box h-[327px]">
        <Card className="border-none shadow-none">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-8 relative">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#F64C4C]">
                  Faible
                </span>
                <span className="h-2 w-2 rounded-full bg-[#F64C4C]"></span>
              </div>
              <span className="w-[32px] bg-[#E7E7E7] h-[1.6px] absolute left-[54px]"></span>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#47B881]"></span>
                <span className="text-sm font-medium text-[#47B881]">Fort</span>
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
                  name="Faiblesses"
                  dataKey="value"
                  fill="#F64C4C"
                  fillOpacity={0.2}
                  stroke="#F64C4C"
                  strokeWidth={2}
                  dot={{ fill: "#F64C4C", r: 3 }}
                />
                <Radar
                  name="Forces"
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
