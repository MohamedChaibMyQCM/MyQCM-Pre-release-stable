"use client";
import { Area, AreaChart, CartesianGrid, Line } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

const Précision_au_Cours_Du_Temps = ({ accuracy_trend }) => {
  // Vérifier si les données sont vides ou non disponibles
  if (!accuracy_trend || accuracy_trend.length === 0) {
    return (
      <div className="flex-1 accuracy">
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
          Précision au cours du temps
        </h3>
        <div className="bg-[#FFFFFF] box rounded-[16px] h-[320px] flex items-center justify-center">
          <div className="bg-white px-6 py-3 rounded-full shadow-md border-[2px] border-[#F8589F]">
            <span className="text-[#F8589F] font-medium text-[18px]">
              Aucune donnée pour l&apos;instant
            </span>
          </div>
        </div>
      </div>
    );
  }

  const chartData = accuracy_trend.map((item) => ({
    month: new Date(item.date).toLocaleString("default", { month: "long" }),
    volume1: Math.round(item.daily_accuracy * 100),
    volume2: Math.round(item.daily_accuracy * 100),
    volume3: 80, // Ligne de cible
  }));

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

  return (
    <div className="flex-1 accuracy">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Précision au cours du temps
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
                  type="monotone"
                  fill="url(#gradient1)"
                  fillOpacity={1}
                  stroke="#F8589F"
                  strokeWidth={2}
                  stackId="a"
                />
                <Line
                  dataKey="volume3"
                  type="monotone"
                  stroke="#00FF00"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <div className="flex items-center justify-center gap-16 z-[50] mt-[8px]">
          <span className="block relative text-[#191919] font-[500] text-[13px] after:w-[8px] after:h-[8px] after:rounded-[50%] after:bg-[#F8589F] after:absolute after:left-[-12px] after:top-[50%] after:translate-y-[-50%]">
            Votre précision
          </span>
          <span className="block relative text-[#191919] font-[500] text-[13px] after:w-[8px] after:h-[8px] after:rounded-[50%] after:bg-[#F64C4C] after:absolute after:left-[-12px] after:top-[50%] after:translate-y-[-50%]">
            Votre moyenne
          </span>
        </div>
      </div>
    </div>
  );
};

export default Précision_au_Cours_Du_Temps;
