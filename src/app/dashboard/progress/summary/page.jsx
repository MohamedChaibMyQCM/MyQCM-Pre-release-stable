"use client";

import { useEffect } from "react";
import { useNextStep } from "nextstepjs";
import toast from "react-hot-toast";
import React from "react";
import Learning_calendar from "@/components/dashboard/MyProgress/Learning_calender";
import Performance from "@/components/dashboard/MyProgress/Performance";
import Progress_per_module from "@/components/dashboard/MyProgress/Progress_per_module";
import Recent_Quiz from "@/components/dashboard/MyProgress/Recent_Quiz";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import secureLocalStorage from "react-secure-storage";
import Loading from "@/components/Loading";

const ProgressActivityPage = () => {
  const { startNextStep, nextStepState } = useNextStep();

 const {
   data: userData,
   isLoading: isLoadingUser,
   isError: isUserError,
   error: userError,
 } = useQuery({
   queryKey: ["user"],
   queryFn: async () => {
     const token = secureLocalStorage.getItem("token");
     if (!token) {
       console.warn("Progress Page: No token for user query.");
       return null;
     }
     try {
       const response = await BaseUrl.get("/user/me", {
         headers: { Authorization: `Bearer ${token}` },
       });
       return response.data.data;
     } catch (error) {
       toast.error("Erreur lors de la récupération des données utilisateur.");
       console.error("User fetch error:", error);
       throw error;
     }
   },
   retry: 1,
 });

  const {
    data: activityData,
    isLoading: isLoadingAnalytics,
    isError: isAnalyticsError,
    error: analyticsError,
  } = useQuery({
    queryKey: ["userAnalytics"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) {
        toast.error("Session invalide pour les statistiques d'activité.");
        throw new Error(
          "No authentication token found for activity analytics."
        );
      }
      try {
        const response = await BaseUrl.get("/progress/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Activity Page - Analytics data:", response.data.data);
        return response.data.data;
      } catch (err) {
        console.error("Activity Page - Analytics fetch error:", err);
        toast.error("Erreur lors du chargement des détails d'activité.");
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

   useEffect(() => {
     const canAttemptOnboarding = !isLoadingUser && userData != null;
     const needsOnboarding =
       canAttemptOnboarding && userData.completed_introduction === false;
     const isTourAlreadyActive = nextStepState?.currentTour != null;

     if (needsOnboarding && !isTourAlreadyActive) {
       startNextStep("progressActivity");
     }
   }, [isLoadingUser, isUserError, userData, nextStepState, startNextStep]);

  if (isLoadingAnalytics) {
    return (
      <div className="px-6 mt-8">
        <Loading />
      </div>
    );
  }

  if (isAnalyticsError) {
    console.error("Activity page analytics error:", analyticsError);
    return (
      <div className="px-6 mt-8 text-red-600">
        Erreur de chargement des détails d&apos;activité.
      </div>
    );
  }

  if (
    !activityData?.recent_activity?.progress_by_module ||
    !activityData?.recent_activity?.performance ||
    !activityData?.recent_activity?.recent_quizzes ||
    !activityData?.subject_strengths ||
    !activityData?.overall_summary
  ) {
    console.warn(
      "Activity Page: Incomplete analytics data received:",
      activityData
    );
    return (
      <div className="px-6 mt-8 text-orange-500">
        Données d&apos;activité incomplètes ou non disponibles.
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 mt-6">
      <div className="grid grid-cols-3 gap-6 max-xl:grid-cols-2 max-md:grid-cols-1">
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

export default ProgressActivityPage;
