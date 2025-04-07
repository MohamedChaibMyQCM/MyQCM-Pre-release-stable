"use client";

import BaseUrl from "@/components/BaseUrl";
import GeneraleStat from "@/components/dashboard/MyProgress/GeneraleStat";
import Shedule_Stat from "@/components/dashboard/MyProgress/Shedule_Stat";
import Strength_Stat from "@/components/dashboard/MyProgress/Strength_Stat";
import Loading from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";

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
    <div className="px-6 mt-8">
      <GeneraleStat overall_summary={activityData.overall_summary} />
      <Strength_Stat subject_strengths={activityData.subject_strengths} />
      <Shedule_Stat accuracy_trend={activityData.accuracy_trend} />
    </div>
  );
};

export default Page;
