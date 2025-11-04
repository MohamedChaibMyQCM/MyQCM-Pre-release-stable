"use client";

import { useEffect } from "react"; 
import { useQuery } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import toast from "react-hot-toast"; 
import BaseUrl from "@/components/BaseUrl";
import GeneraleStat from "@/components/dashboard/MyProgress/GeneraleStat";
import Shedule_Stat from "@/components/dashboard/MyProgress/Shedule_Stat";
import Strength_Stat from "@/components/dashboard/MyProgress/Strength_Stat";
import Loading from "@/components/Loading";

const ProgressSummaryPage = () => {
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
        toast.error("Session invalide pour les statistiques.");
        throw new Error("No authentication token found for analytics.");
      }
      try {
        const response = await BaseUrl.get("/progress/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
      } catch (err) {
        console.error("Analytics fetch error:", err);
        toast.error("Erreur lors du chargement des statistiques.");
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, 
    retry: 1,
  });

   if (isLoadingUser || isLoadingAnalytics) {
    return (
      <div className="px-6 mt-8">
        <Loading />
      </div>
    );
  }

  if (isAnalyticsError) {
    console.error("Analytics error:", analyticsError);
    return (
      <div className="px-6 mt-8 text-red-600 dark:text-red-400">
        Erreur lors du chargement des statistiques de progression.
      </div>
    );
  }

  if (
    !activityData ||
    !activityData.overall_summary ||
    !activityData.subject_strengths ||
    !activityData.accuracy_trend
  ) {
    console.warn("Incomplete analytics data received:", activityData);
    return (
      <div className="px-6 mt-8 text-orange-500 dark:text-orange-400">
        Données de progression incomplètes ou non disponibles.
      </div>
    );
  }

  return (
    <div className="px-6 mt-8">
      <GeneraleStat overall_summary={activityData.overall_summary} />
      <Strength_Stat subject_strengths={activityData.subject_strengths} />
      <Shedule_Stat accuracy_trend={activityData.accuracy_trend} />
    </div>
  );
};

export default ProgressSummaryPage; 
