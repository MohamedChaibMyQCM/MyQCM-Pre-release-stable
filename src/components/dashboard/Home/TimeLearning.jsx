"use client";

// import { TrendingUp } from "lucide-react";
// import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";

// const chartData = [
//   { month: "Mon", desktop: 186, mobile: 80 },
//   { month: "Tus", desktop: 305, mobile: 200 },
//   { month: "Wed", desktop: 237, mobile: 120 },
//   { month: "Thu", desktop: 73, mobile: 190 },
//   { month: "Fri", desktop: 209, mobile: 130 },
//   { month: "Sat", desktop: 214, mobile: 140 },
//   { month: "Sun", desktop: 214, mobile: 140 },
// ];

// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "hsl(var(--chart-1))",
//   },
//   mobile: {
//     label: "Mobile",
//     color: "hsl(var(--chart-2))",
//   },
// };

const TimeLearning = () => {
  return (
    <div>
      <h2 className="text-[#11142D] font-Inter text-[17px] font-[700] mb-5">
        Votre temps d'apprentissage moyen (en heures)
      </h2>
      {/* <Card className="bg-[#FD7DB6]">
        <CardContent className="pt-[40px]">
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: -20,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickCount={3}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey="mobile"
                type="natural"
                fill="var(--color-mobile)"
                fillOpacity={0.4}
                stroke="var(--color-mobile)"
                stackId="a"
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="var(--color-desktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default TimeLearning;