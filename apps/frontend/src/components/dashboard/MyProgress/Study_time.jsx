"use client";
import { useState, useMemo } from "react";
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
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

// Define constants for clarity
const ACTIVITY_DURATION_MINUTES = 2;

const Study_time = () => {
  // Premium animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.15,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
  const [unit, setUnit] = useState("hours"); // State for selected unit: 'hours' or 'minutes'

  const {
    data: userActivity,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userActivity"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) throw new Error("No token found");
      try {
        const response = await BaseUrl.get("/user/activity/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.data) {
          return response.data.data;
        } else {
          console.warn("Unexpected API response structure:", response.data);
          return {};
        }
      } catch (err) {
        console.error("Failed to fetch user activity:", err);
        throw err;
      }
    },
    retry: 1,
    placeholderData: {},
  });

  const chartData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

    return days.map((dayKey, index) => {
      const activityCount = userActivity?.[dayKey]?.length || 0;
      const totalMinutes = activityCount * ACTIVITY_DURATION_MINUTES;
      const displayValue = unit === "hours" ? totalMinutes / 60 : totalMinutes;

      return {
        name: dayNames[index],
        rawMinutes: totalMinutes,
        value: displayValue,
      };
    });
  }, [userActivity, unit]);

  const formatYAxis = (value) => {
    const formattedValue =
      unit === "hours" ? value.toFixed(1) : value.toFixed(0);
    const suffix = unit === "hours" ? "h" : "m";
    return `${formattedValue}${suffix}`;
  };

  const formatTooltipValue = (value, name, props) => {
    const { payload } = props;
    const rawMinutes = payload?.rawMinutes ?? 0;
    if (unit === "hours") {
      const hours = (rawMinutes / 60).toFixed(1);
      return [`${hours}h (${rawMinutes}min)`, "Temps"];
    } else {
      return [`${rawMinutes}min`, "Temps"];
    }
  };

  if (isLoading) {
    return (
      <div
        id="tour-myprogress-studytime"
        className="xl:flex-1 study_time p-4 text-center h-[327px]" // Maintain height during loading
      >
        Chargement du temps d&apos;étude...
      </div>
    );
  }

  if (error) {
    return (
      <div
        id="tour-myprogress-studytime"
        className="xl:flex-1 study_time p-4 text-center text-red-600 h-[327px]" // Maintain height on error
      >
        Erreur de chargement des données d&apos;activité. ({error.message})
      </div>
    );
  }

  return (
    <motion.div
      id="tour-myprogress-studytime"
      className="xl:flex-1 study_time"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex items-center justify-between mb-4 px-1 flex-wrap gap-2"
        variants={headerVariants}
      >
        <h3 className="font-[500] text-[17px] text-[#191919]">
          Temps d&apos;étude
        </h3>
        <div className="flex items-center border border-gray-200 rounded-full p-0.5 bg-gray-50">
          <button
            onClick={() => setUnit("hours")}
            aria-pressed={unit === "hours"}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ease-in-out ${
              unit === "hours"
                ? "bg-[#F8589F] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Heures
          </button>
          <button
            onClick={() => setUnit("minutes")}
            aria-pressed={unit === "minutes"}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ease-in-out ${
              unit === "minutes"
                ? "bg-[#F8589F] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Minutes
          </button>
        </div>
      </motion.div>

      {/* Chart Container */}
      {/* Use the same height as before */}
      <motion.div
        className="bg-[#FFFFFF] rounded-[16px] box p-2 sm:p-4 h-[327px] w-full"
        variants={chartVariants}
        whileHover={{
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.1)",
          transition: { duration: 0.3 },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              bottom: 15, // Keep increased bottom margin
              left: 0,
            }}
          >
            <CartesianGrid
              stroke="#f0f0f0"
              vertical={false}
              horizontal={true}
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              // *** XAxis Ticks: Color #191919 and space below ***
              tick={{ fill: "#191919", fontSize: 12, fontWeight: 500 }}
              dy={10} // Keep space below labels
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              // *** YAxis Ticks: Color #F8589F ***
              tick={{ fill: "#F8589F", fontSize: 12, fontWeight: 500 }} // Set fill color to pink
              tickFormatter={formatYAxis}
              domain={["auto", "auto"]}
              allowDecimals={unit === "hours"}
              width={40} // Keep original width
            />
            <Tooltip
              cursor={{ fill: "rgba(248, 88, 159, 0.1)" }}
              formatter={formatTooltipValue}
              contentStyle={{
                borderRadius: "8px",
                borderColor: "#F8589F",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              labelStyle={{
                fontWeight: "bold",
                marginBottom: "4px",
                color: "#333",
              }}
            />
            <Bar
              dataKey="value"
              barSize={30}
              fill="url(#colorUv)"
              radius={[8, 8, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#colorPv)"
              strokeWidth={2.5}
              dot={{ fill: "#FD2E8A", stroke: "#fff", strokeWidth: 1, r: 4 }}
              activeDot={{
                r: 6,
                fill: "#FD2E8A",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
            {/* Define gradients */}
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F8589F" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#FF8CBA" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#FD2E8A" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#F8589F" stopOpacity={1} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
};

export default Study_time;
