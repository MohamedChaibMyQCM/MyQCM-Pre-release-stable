"use client";

import React from "react";
import Learning_calendar from "@/components/dashboard/MyProgress/Learning_calender";
import Performance from "@/components/dashboard/MyProgress/Performance";
import Progress_per_module from "@/components/dashboard/MyProgress/Progress_per_module";
import Recent_Quiz from "@/components/dashboard/MyProgress/Recent_Quiz";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import secureLocalStorage from "react-secure-storage";
import Loading from "@/components/Loading";

const Page = () => {
  const {
    data: activityData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userAnalytics"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/progress/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.data);
      

      return response.data.data;
    },
  });

  if (isLoading)
    return (
      <div className="px-6 mt-8">
        <Loading />
      </div>
    );
  if (error) return <div className="px-6 mt-8">Error loading data</div>;

  return (
    <div className="space-y-8 p-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Progress_per_module
          progress_by_module={activityData.recent_activity.progress_by_module}
        />
        <Performance performance={activityData.recent_activity.performance} />
        <Recent_Quiz
          recent_quizzes={activityData.recent_activity.recent_quizzes}
        />
      </div>
      <Learning_calendar />
    </div>
  );
};

export default Page;
