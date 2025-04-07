import React from "react";
import Stren_Weakn from "./Stren_Weakn";
import Study_time from "./Study_time";
import Total_Point from "./Total_Point";
import Ranking from "./Ranking";
import { useQuery } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";

const Strength_Stat = ({ subject_strengths }) => {
  const {
    data: userXp,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userXP"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/user/xp/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    },
  });

  if (isLoading) return <div><Loading /></div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div className="flex mt-8 gap-6 max-md:flex-col">
      <Stren_Weakn subject_strengths={subject_strengths} />
      <Study_time />
      <div className="flex flex-col">
        <Total_Point userXp={userXp} />
        <Ranking userXp={userXp} />
      </div>
    </div>
  );
};

export default Strength_Stat;
