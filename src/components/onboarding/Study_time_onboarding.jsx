"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";
import streakIconPublic from "../../../public/Icons/streak.svg";

// Mock UI Components if not using a library
const Card = ({ className = "", children }) => (
  <div className={`bg-white rounded-lg shadow-none ${className}`}>
    {children}
  </div>
); // Removed shadow from mock for design
const CardContent = ({ className = "", children }) => (
  <div className={`p-0 ${className}`}>{children}</div>
); // p-0 for design

const Study_time_onboarding = ({ highlightedElementInfo, isTourActive }) => {
  const staticUserActivity = {
    Sun: [1, 2],
    Mon: [1, 2, 3, 4, 5],
    Tue: [1],
    Wed: [1, 2, 3],
    Thu: [1, 2, 3, 4, 5, 6, 7],
    Fri: [1, 2],
    Sat: [],
  };
  const staticStreakData = { current_streak: 3 };

  const transformActivityData = () => {
    /* ... as before ... */
    if (!staticUserActivity) return [];
    const dayMap = {
      Dim: "Sun",
      Lun: "Mon",
      Mar: "Tue",
      Mer: "Wed",
      Jeu: "Thu",
      Ven: "Fri",
      Sam: "Sat",
    };
    const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const MINUTES_PER_ACTIVITY = 2;
    return daysOfWeek.map((day) => {
      const englishDay = dayMap[day];
      const activities = staticUserActivity[englishDay] || [];
      const totalMinutes = activities.length * MINUTES_PER_ACTIVITY;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return { day, hours, minutes, totalMinutes };
    });
  };
  const chartData = transformActivityData();
  const currentStreak = staticStreakData?.current_streak || 0;

  const isActive = (id) =>
    isTourActive && highlightedElementInfo && highlightedElementInfo.id === id;

  return (
    <div
      id="tour-studytime-section"
      className={`w-full p-1 -m-1 rounded-lg 
                    ${
                      isActive("tour-studytime-section")
                        ? "tour-highlight-active"
                        : ""
                    }
                    ${isTourActive ? "component-under-tour" : ""}`}
    >
      {" "}
      {/* Added padding to wrapper for highlight room */}
      <h3 className="font-[500] text-[17px] mb-6 text-[#191919] max-md:mb-4">
        Temps d&apos;étude
      </h3>
      <div className="bg-[#FFFFFF] flex items-center gap-4 p-4 rounded-[16px] shadow-md max-md:flex-col max-md:p-2">
        {/* ... Rest of Study Time JSX from previous correct answer, e.g. ... */}
        <Card className="border-none p-0 w-full shadow-none flex-1">
          <CardContent className="border-none p-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{ top: 25, right: 0, left: 0, bottom: 5 }}
                barCategoryGap="25%"
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fontSize: 12, fontWeight: 500, fill: "#6b7280" }}
                />
                <YAxis domain={[0, "dataMax + 30"]} hide />
                <Bar
                  dataKey="totalMinutes"
                  fill="#F8589F"
                  radius={[8, 8, 0, 0]}
                >
                  <LabelList
                    dataKey="hours"
                    position="top"
                    offset={18}
                    fill="#F8589F"
                    fontSize={11}
                    fontWeight={500}
                    formatter={(value) => (value > 0 ? `${value}h` : "")}
                  />
                  <LabelList
                    dataKey="minutes"
                    position="top"
                    offset={6}
                    fill="#F8589F"
                    fontSize={11}
                    fontWeight={500}
                    formatter={(value, index) => {
                      const currentDataPoint = chartData[index];
                      if (!currentDataPoint)
                        return value > 0 ? `${value}min` : "";
                      const minutesValue = value;
                      const hoursValue = currentDataPoint.hours;
                      if (hoursValue > 0 && minutesValue > 0)
                        return `${minutesValue}min`;
                      else if (hoursValue === 0 && minutesValue > 0)
                        return `${minutesValue}min`;
                      else return "";
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="h-auto w-[1px] bg-[#E4E4E4] self-stretch max-md:hidden" />
        <div className="flex flex-col items-center text-center gap-2 w-full sm:w-[140px] py-4 sm:py-0 max-md:mt-4 max-md:border-t max-md:pt-4">
          <span className="text-[18px] text-[#F8589F] font-[600]">
            {" "}
            {currentStreak} jour{currentStreak > 1 ? "s" : ""} <br /> Streak{" "}
          </span>
          <span className="text-[#191919] text-[13px] font-medium">
            Continuez ainsi !
          </span>
          <div className="flex items-center gap-2 mt-1">
            {" "}
            {currentStreak > 0 &&
              Array.from({ length: Math.min(currentStreak, 7) }).map(
                (_, indexImg) => (
                  <Image
                    key={indexImg}
                    src={streakIconPublic}
                    alt="streak icon"
                    width={16}
                    height={16}
                    className="w-[16px] h-[16px]"
                  />
                )
              )}{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Study_time_onboarding;
