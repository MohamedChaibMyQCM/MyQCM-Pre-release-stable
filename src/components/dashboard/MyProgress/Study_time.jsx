"use client";
import BaseUrl from "@/components/BaseUrl";
import { useQuery } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";

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

  // Transformer vos données pour inclure des valeurs zéro
  const chartData = [
    { name: "Dim", hours: userActivity?.Sun?.length || 0 },
    { name: "Lun", hours: userActivity?.Mon?.length || 0 },
    { name: "Mar", hours: userActivity?.Tue?.length || 0 },
    { name: "Mer", hours: userActivity?.Wed?.length || 0 },
    { name: "Jeu", hours: userActivity?.Thu?.length || 0 },
    { name: "Ven", hours: userActivity?.Fri?.length || 0 },
    { name: "Sam", hours: userActivity?.Sat?.length || 0 },
  ].map((item) => ({
    ...item,
    hours: (item.hours * 2) / 60, // Convertir les activités en heures (2 min par activité)
  }));

  return (
    <div id="tour-myprogress-studytime" className="flex-1 study_time">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Temps d&apos;étude
      </h3>
      <div className="bg-[#FFFFFF] rounded-[16px] box">
        <ComposedChart
          width={700}
          height={400}
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 0,
          }}
        >
          <CartesianGrid stroke="#f5f5f5" vertical={false} horizontal={true} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#B5BEC6", fontSize: 12, fontWeight: 500 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#B5BEC6", fontSize: 12, fontWeight: 500 }}
            ticks={[0, 2, 4, 6, 8]}
            tickFormatter={(value) => `${value}h`}
          />
          <Bar
            dataKey="hours"
            barSize={40}
            fill="#F8589F"
            radius={[8, 8, 0, 0]}
          />
          <Line
            type="linear"
            dataKey="hours"
            stroke="#FD2E8A"
            strokeWidth={2}
            dot={{ fill: "#FD2E8A", strokeWidth: 2, r: 4 }}
          />
        </ComposedChart>
      </div>
    </div>
  );
};

export default Study_time;
