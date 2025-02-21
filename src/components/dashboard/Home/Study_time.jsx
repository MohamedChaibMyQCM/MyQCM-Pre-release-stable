"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import Image from "next/image";
import streak from "../../../../public/Icons/streak.svg";

const chartData = [
  { day: "Sun", hours: 7, minutes: 23 },
  { day: "Mon", hours: 4, minutes: 53 },
  { day: "Tues", hours: 6, minutes: 3 },
  { day: "Wed", hours: 5, minutes: 23 },
  { day: "Thur", hours: 1, minutes: 30 },
  { day: "Fri", hours: 2, minutes: 0 },
  { day: "Sat", hours: 1, minutes: 50 },
];

const Study_time = () => {
  return (
    <div className="w-full">
      <h3 className="font-[500] text-[17px] mb-6 text-[#191919]">
        Studying time
      </h3>
      <div className="bg-[#FFFFFF] flex items-center gap-4 px-4 rounded-[16px] box">
        <Card className="border-none p-0 w-full shadow-none">
          <CardContent className="border-none p-0">
            <ChartContainer config={{}}>
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 20,
                  bottom: 20,
                }}
                barCategoryGap="20%"
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: "inherit",
                  }}
                />
                <Bar dataKey="hours" fill="#F8589F" radius={8}>
                  <LabelList
                    dataKey="hours"
                    position="top"
                    offset={24}
                    fill="#F8589F"
                    fontSize={12}
                    fontWeight={500}
                    formatter={(value) => `${value}h`}
                  />
                  <LabelList
                    dataKey="minutes"
                    position="top"
                    offset={10}
                    fill="#F8589F"
                    fontSize={12}
                    fontWeight={500}
                    formatter={(value) => `${value}min`}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <div className="h-[288.5px] w-[1px] bg-[#E4E4E4]" />
        <div className="flex flex-col items-center text-center gap-2 w-[140px]">
          <span className="text-[18px] text-[#F8589F] font-[600]">
            3 <br /> days <br /> Streak
          </span>
          <span className="text-[#191919] text-[13px]">Keep going</span>
          <div className="flex items-center gap-2">
            <Image src={streak} alt="streak" className="w-[14px]" />
            <Image src={streak} alt="streak" className="w-[14px]" />
            <Image src={streak} alt="streak" className="w-[14px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Study_time;