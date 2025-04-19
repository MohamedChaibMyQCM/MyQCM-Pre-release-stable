"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNextStep } from "nextstepjs";
import secureLocalStorage from "react-secure-storage";
import Dash_Header from "@/components/dashboard/Dash_Header";
import Calendar from "@/components/dashboard/Home/Calender";
import Modules from "@/components/dashboard/Home/Modules";
import Study_time from "@/components/dashboard/Home/Study_time";
import Units from "@/components/dashboard/Home/Units";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

export default function DashboardPage() {
  const { startNextStep, nextStepState } = useNextStep();

  const {
    data: userData,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) {
        return null;
      }
      try {
        const response = await BaseUrl.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
      } catch (error) {
        toast.error("Erreur lors de la récupération des données utilisateur.");
        return null;
      }
    },
  });

  useEffect(() => {
    const needsOnboarding =
      !isLoadingUser &&
      !isUserError &&
      userData != null &&
      userData.completed_introduction === false;

    const isTourAlreadyActive = nextStepState?.currentTour != null;

    if (needsOnboarding && !isTourAlreadyActive) {
      startNextStep("dashboardHeaderIntro");
    }
  }, [isLoadingUser, isUserError, userData, nextStepState, startNextStep]);

  if (isLoadingUser) {
    console.log("Rendering Loading component...");
    return <Loading />;
  }

  return (
    <div className="bg-[#F7F8FA] pb-10 min-h-screen">
      <Dash_Header />
      <div className="px-5 mt-4 max-md:mt-0 max-xl:mt-8">
        <Units />
        <Modules />
        <div className="flex items-start gap-6 mt-10 max-md:flex-col w-full max-md:mt-6">
          <Calendar />
          <Study_time />
        </div>
      </div>
    </div>
  );
}
