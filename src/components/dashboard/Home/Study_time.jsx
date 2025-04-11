"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import Image from "next/image";
import streak from "../../../../public/Icons/streak.svg";
import { useQuery } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";

const Study_time = () => {
  const { data: userActivity } = useQuery({
    queryKey: ["userActivity"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/user/activity/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    },
  });

  const { data: streakData } = useQuery({
    queryKey: ["userStreak"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/user/streak/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    },
  });

  const transformActivityData = () => {
    if (!userActivity) return [];

    const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const MINUTES_PER_ACTIVITY = 2;

    return daysOfWeek.map((day) => {
      const activities = userActivity[day] || [];
      const totalMinutes = activities.length * MINUTES_PER_ACTIVITY;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return {
        day,
        hours,
        minutes,
        totalMinutes,
      };
    });
  };

  const chartData = transformActivityData();

  return (
    <div className="w-full">
      <h3 className="font-[500] text-[17px] mb-6 text-[#191919] max-md:mb-4">
        Temps d&apos;étude
      </h3>
      <div className="bg-[#FFFFFF] flex items-center gap-4 px-4 rounded-[16px] box max-md:w-full max-md:h-[320px] max-md:px-0">
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
                height={220}
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
                <YAxis domain={[0, "dataMax + 20"]} hide />
                <Bar dataKey="totalMinutes" fill="#F8589F" radius={8}>
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
        <div className="h-[316px] w-[1px] bg-[#E4E4E4] max-md:hidden" />
        <div className="flex flex-col items-center text-center gap-2 w-[140px] max-md:hidden">
          <span className="text-[18px] text-[#F8589F] font-[600]">
            {streakData?.current_streak || 0} <br /> jours <br /> Streak
          </span>
          <span className="text-[#191919] text-[13px]">Continuez ainsi</span>
          <div className="flex items-center gap-2">
            {streakData?.current_streak &&
              Array.from({ length: streakData.current_streak }).map(
                (_, index) => (
                  <Image
                    key={index}
                    src={streak}
                    alt="streak"
                    className="w-[14px]"
                  />
                )
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Study_time;
