"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Learning_calendar from "@/components/dashboard/MyProgress/Learning_calender";
import Performance from "@/components/dashboard/MyProgress/Performance";
import Progress_per_module from "@/components/dashboard/MyProgress/Progress_per_module";
import Recent_Quiz from "@/components/dashboard/MyProgress/Recent_Quiz";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import secureLocalStorage from "react-secure-storage";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/dashboard/MyProgress/DateRangePicker";
import { format } from "date-fns";
import { SlidersHorizontal, Calendar } from "lucide-react";
import Progress_Links from "@/components/dashboard/MyProgress/Progress_Links";

const ALL_UNITS_VALUE = "ALL_UNITS";
const ALL_SUBJECTS_VALUE = "ALL_SUBJECTS";

const ProgressActivityPage = () => {
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [activeDateRange, setActiveDateRange] = useState(null);
  const [pendingDateRange, setPendingDateRange] = useState(null);
  const [isModuleFilterOpen, setIsModuleFilterOpen] = useState(false);

  useEffect(() => {
    setPendingDateRange(activeDateRange);
  }, [activeDateRange]);

  useEffect(() => {
    if (!selectedUnitId) {
      setSelectedSubjectId(null);
    }
  }, [selectedUnitId]);

  const handleClearFilters = () => {
    setSelectedUnitId(null);
    setSelectedSubjectId(null);
  };

  const handleClearDateRange = () => {
    setActiveDateRange(null);
    setPendingDateRange(null);
  };

  const handlePendingDateRangeChange = (range) => {
    setPendingDateRange(range ?? null);
  };

  const {
    data: unitsData = [],
    isLoading: isUnitsLoading,
  } = useQuery({
    queryKey: ["progressUnits"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) return [];
      try {
        const response = await BaseUrl.get("/unit/me?offset=100", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data?.data?.data || [];
      } catch (error) {
        console.error("Progress summary: unable to fetch units", error);
        return [];
      }
    },
    enabled: !!secureLocalStorage.getItem("token"),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const {
    data: subjectsData = [],
    isLoading: isSubjectsLoading,
  } = useQuery({
    queryKey: ["progressSubjects", selectedUnitId || "all"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token || !selectedUnitId) return [];
      try {
        const response = await BaseUrl.get(
          `/subject/me?unit=${selectedUnitId}&offset=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        return response.data?.data?.data || [];
      } catch (error) {
        console.error(
          `Progress summary: unable to fetch subjects for unit ${selectedUnitId}`,
          error,
        );
        return [];
      }
    },
    enabled: !!secureLocalStorage.getItem("token") && !!selectedUnitId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const selectedUnit = useMemo(() => {
    if (!selectedUnitId) return null;
    return unitsData.find((unit) => unit.id === selectedUnitId) || null;
  }, [unitsData, selectedUnitId]);

  const selectedSubject = useMemo(() => {
    if (!selectedSubjectId) return null;
    return subjectsData.find((subject) => subject.id === selectedSubjectId) || null;
  }, [subjectsData, selectedSubjectId]);

  const analyticsQueryFilters = useMemo(() => {
    const params = {};
    if (selectedUnitId) params.unit = selectedUnitId;
    if (selectedSubjectId) params.subject = selectedSubjectId;
    if (activeDateRange?.from) {
      params.from = format(activeDateRange.from, "yyyy-MM-dd");
    }
    if (activeDateRange?.to) {
      params.to = format(activeDateRange.to, "yyyy-MM-dd");
    }
    return params;
  }, [selectedUnitId, selectedSubjectId, activeDateRange]);

  const analyticsQueryKey = useMemo(
    () =>
      JSON.stringify({
        unit: analyticsQueryFilters.unit || null,
        subject: analyticsQueryFilters.subject || null,
        from: analyticsQueryFilters.from || null,
        to: analyticsQueryFilters.to || null,
      }),
    [analyticsQueryFilters],
  );

  const activeFilterBadges = useMemo(() => {
    const badges = [];
    if (selectedUnit) {
      badges.push({
        key: "unit",
        label: selectedUnit.name,
      });
    }
    if (selectedSubject) {
      badges.push({
        key: "subject",
        label: selectedSubject.name,
      });
    }
    if (activeDateRange?.from) {
      const startLabel = format(activeDateRange.from, "dd MMM yyyy");
      const endLabel = activeDateRange.to
        ? format(activeDateRange.to, "dd MMM yyyy")
        : null;
      badges.push({
        key: "date",
        label: endLabel ? `${startLabel} → ${endLabel}` : startLabel,
      });
    }
    return badges;
  }, [selectedUnit, selectedSubject, activeDateRange]);

  const pillBaseClasses =
    "flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-[20px] text-[12px] md:text-[13px] font-[500] border transition-colors whitespace-nowrap";
  const neutralPillClasses =
    "bg-[#FFFFFF] dark:bg-[#1a1a1a] text-[#191919] dark:text-white border-transparent dark:border-gray-700";
  const activePillClasses =
    "bg-[#F8589F] text-white border-[#F8589F]";

  const moduleFilterLabel =
    selectedSubject?.name || selectedUnit?.name || "Tous les modules";

  const dateFilterLabel = activeDateRange?.from
    ? activeDateRange.to
      ? `${format(activeDateRange.from, "dd MMM")} → ${format(
          activeDateRange.to,
          "dd MMM",
        )}`
      : format(activeDateRange.from, "dd MMM yyyy")
    : "Période";

  const filterControls = (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`${pillBaseClasses} ${
              activeDateRange ? activePillClasses : neutralPillClasses
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>{dateFilterLabel}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="space-y-3">
            <DateRangePicker
              dateRange={pendingDateRange || undefined}
              setDateRange={handlePendingDateRangeChange}
              onCancel={() => handlePendingDateRangeChange(activeDateRange)}
              onConfirm={() => setActiveDateRange(pendingDateRange)}
              showTrigger={false}
            />
            {activeDateRange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearDateRange}
                className="w-full"
              >
                Effacer la date
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <Popover open={isModuleFilterOpen} onOpenChange={setIsModuleFilterOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`${pillBaseClasses} ${
              selectedUnitId || selectedSubjectId
                ? activePillClasses
                : neutralPillClasses
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="truncate max-w-[160px] md:max-w-none">
              {moduleFilterLabel}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-4 space-y-3" align="end">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Unité
            </span>
            <Select
              value={selectedUnitId ?? ALL_UNITS_VALUE}
              onValueChange={(value) => {
                if (value === ALL_UNITS_VALUE) {
                  setSelectedUnitId(null);
                } else {
                  setSelectedUnitId(value);
                }
                setSelectedSubjectId(null);
              }}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue
                  placeholder={
                    isUnitsLoading ? "Chargement..." : "Toutes les unités"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_UNITS_VALUE}>Toutes les unités</SelectItem>
                {unitsData.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isUnitsLoading && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 pt-1">
                Chargement des unités...
              </p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Module
            </span>
            <Select
              value={selectedSubjectId ?? ALL_SUBJECTS_VALUE}
              onValueChange={(value) => {
                if (value === ALL_SUBJECTS_VALUE) {
                  setSelectedSubjectId(null);
                } else {
                  setSelectedSubjectId(value);
                }
              }}
              disabled={!selectedUnitId || isSubjectsLoading}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue
                  placeholder={
                    !selectedUnitId
                      ? "Sélectionnez une unité d'abord"
                      : isSubjectsLoading
                      ? "Chargement..."
                      : "Tous les modules"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SUBJECTS_VALUE}>Tous les modules</SelectItem>
                {subjectsData.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isSubjectsLoading && selectedUnitId && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 pt-1">
                Chargement des modules...
              </p>
            )}
          </div>

          {(selectedUnitId || selectedSubjectId) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleClearFilters();
                setIsModuleFilterOpen(false);
              }}
              className="w-full"
            >
              Effacer les filtres
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </>
  );

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
    queryKey: ["userAnalytics", analyticsQueryKey],
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
          params: { ...analyticsQueryFilters },
        });
        return response.data.data;
      } catch (err) {
        toast.error("Erreur lors du chargement des détails d'activité.");
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

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
      <div className="px-6 mt-8 text-red-600 dark:text-red-400">
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
      <div className="px-6 mt-8 text-orange-500 dark:text-orange-400">
        Données d&apos;activité incomplètes ou non disponibles.
      </div>
    );
  }  

  return (
    <>
      <Progress_Links rightContent={filterControls} />
      <div className="space-y-6 md:space-y-8 p-4 md:p-6 mt-2 md:mt-4 pb-6 md:pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {activeFilterBadges.length > 0 ? (
            <>
              <span className="uppercase tracking-wide text-[10px] text-gray-400 dark:text-gray-500">
                Filtres actifs
              </span>
              {activeFilterBadges.map((badge) => (
                <span
                  key={badge.key}
                  className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                >
                  {badge.label}
                </span>
              ))}
            </>
          ) : (
            <span>Aucun filtre appliqué</span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          <Progress_per_module
            progress_by_module={activityData.recent_activity.progress_by_module}
          />
          <Performance performance={activityData.recent_activity.performance} />
          <Recent_Quiz
            recent_quizzes={activityData.recent_activity.recent_quizzes}
          />
        </div>
        <Learning_calendar
          unitId={selectedUnitId || undefined}
          subjectId={selectedSubjectId || undefined}
          dateRange={activeDateRange}
        />
      </div>
    </>
  );
};

export default ProgressActivityPage;
