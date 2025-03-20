"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Sun", hours: 2 },
  { name: "Mon", hours: 6 },
  { name: "Tues", hours: 4 },
  { name: "Wed", hours: 8 },
  { name: "Thur", hours: 5 },
  { name: "Fri", hours: 3 },
  { name: "Sat", hours: 7 },
];

const Study_time = () => {
  return (
    <div className="flex-1 study_time">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Studying time
      </h3>
      <div className="bg-[#FFFFFF] rounded-[16px] box">
        <ComposedChart
          width={700}
          height={400}
          data={data}
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
            tick={{ fill: "#B5BEC6", fontSize: 12, fontWeight: 500 }} // Medium font weight
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#B5BEC6", fontSize: 12, fontWeight: 500 }} // Medium font weight
            ticks={[2, 4, 6, 8]}
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
          />
        </ComposedChart>
      </div>
    </div>
  );
};

export default Study_time;
