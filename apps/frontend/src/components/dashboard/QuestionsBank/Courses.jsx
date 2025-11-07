"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import play from "../../../../public/Icons/play.svg";
import planification from "../../../../public/Icons/planification.svg";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import BaseUrl from "@/components/BaseUrl";
import secureLocalStorage from "react-secure-storage";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import CustomSeason from "./TrainingPopups/CustomSeason";
import CustomSchedule from "./TrainingPopups/CustomShedule";
import GuidedSeason from "./TrainingPopups/GuidedSeason";
import GuidedSchedule from "./TrainingPopups/GuidedShedule";
import SynergySchedule from "./TrainingPopups/SynergyShedule";
import { motion, AnimatePresence } from "framer-motion";

const ITEM_PLUS_GAP_HEIGHT_APPROX = 80;
const MAX_VISIBLE_ITEMS = 6;
const GRADIENT_OVERLAY_HEIGHT = 120;

const CUSTOM_MODE = "Mode Personnalisé";
const GUIDED_MODE = "Mode Guidé";
const INTELLIGENTE_MODE = "Mode Intelligent";

const Courses = ({ courses, subjectId, subjectData }) => {
  const router = useRouter();

  const {
    data: userMode,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfileMode"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.data?.mode?.name) {
        return response.data.data.mode.name;
      } else {
        toast.error("Unexpected profile data structure");
      }
    },
    onError: (err) => {
      toast.error(`Échec du chargement du mode profil: ${err.message}`);
    },
    enabled: !!secureLocalStorage.getItem("token"),
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60, // Refetch every minute
  });

  const { mutate: startSynergySession, isPending: isStartingSynergy } =
    useMutation({
      mutationFn: async (payload) => {
        const token = secureLocalStorage.getItem("token");
        if (!token) {
          toast.error("Authentification requise.");
          throw new Error("Token missing");
        }
        return BaseUrl.post(`/training-session`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      },
      onSuccess: ({ data }) => {
        if (data && data.data) {
          toast.success("Séance démarrée!");
          router.push(`/dashboard/question-bank/session/${data.data}`);
        } else {
          toast.error("Réponse inattendue du serveur après démarrage.");
        }
      },
      onError: (error) => {
        const responseData = error?.response?.data;
        const message = Array.isArray(responseData?.message)
          ? responseData.message.join(", ")
          : responseData?.message ||
            error.message ||
            "Échec du démarrage de la session";
        toast.error(message);
      },
    });

  const [activePopup, setActivePopup] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const handleScheduleClick = (courseId) => {
    if (isStartingSynergy) return;
    setSelectedCourseId(courseId);
    setActivePopup("schedule");
  };

  const handlePlayClick = (courseId) => {
    if (!userMode || isLoadingProfile || profileError || isStartingSynergy) {
      if (!userMode && !isLoadingProfile)
        toast.error("Mode utilisateur non chargé ou erreur de profil.");
      if (isStartingSynergy) toast.info("Démarrage de la session en cours...");
      return;
    }

    if (userMode === INTELLIGENTE_MODE) {
      startSynergySession({ course: courseId });
    } else {
      setSelectedCourseId(courseId);
      setActivePopup("play");
    }
  };

  const closePopup = () => {
    setActivePopup(null);
    setSelectedCourseId(null);
  };

  const validCourses = courses || [];

  const listMaxHeight =
    validCourses.length > MAX_VISIBLE_ITEMS
      ? `${MAX_VISIBLE_ITEMS * ITEM_PLUS_GAP_HEIGHT_APPROX}px`
      : "none";

  // Premium animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.15,
      },
    },
  };

  const courseItemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const renderPopup = () => {
    if (
      !activePopup ||
      !selectedCourseId ||
      isLoadingProfile ||
      !userMode ||
      profileError
    ) {
      if (activePopup && (isLoadingProfile || !userMode || profileError)) {
      }
      return null;
    }

    switch (userMode) {
      case CUSTOM_MODE:
        if (activePopup === "play")
          return (
            <CustomSeason
              key={`custom-season-play-${selectedCourseId}`}
              setPopup={closePopup}
              courseId={selectedCourseId}
            />
          );
        if (activePopup === "schedule")
          return (
            <CustomSchedule
              key={`custom-schedule-${selectedCourseId}`}
              setPopup={closePopup}
              courseId={selectedCourseId}
            />
          );
        break;
      case GUIDED_MODE:
        if (activePopup === "play")
          return (
            <GuidedSeason
              key={`guided-season-play-${selectedCourseId}`}
              setPopup={closePopup}
              courseId={selectedCourseId}
            />
          );
        if (activePopup === "schedule")
          return (
            <GuidedSchedule
              key={`guided-schedule-${selectedCourseId}`}
              setPopup={closePopup}
              courseId={selectedCourseId}
            />
          );
        break;
      case INTELLIGENTE_MODE:
        if (activePopup === "schedule")
          return (
            <SynergySchedule
              key={`synergy-schedule-${selectedCourseId}`}
              setPopup={closePopup}
              courseId={selectedCourseId}
            />
          );

        break;
      default:
        console.error(`Mode utilisateur inconnu: ${userMode}`);
        closePopup();
        return null;
    }
    return null;
  };

  return (
    <div
      className={
        validCourses.length <= MAX_VISIBLE_ITEMS
          ? "relative px-[22px] py-[28px] rounded-[16px] bg-card border border-border basis-[41%] box max-md:w-[100%] flex flex-col max-lg:w-full"
          : "relative px-[22px] py-[28px] rounded-[16px] bg-card border border-border basis-[41%] box after:w-full after:h-[120px] after:bg-gradient-to-t after:from-card after:to-transparent after:absolute after:left-0 after:bottom-0 after:rounded-br-[16px] after:rounded-bl-[16px] max-md:w-[100%] flex flex-col max-lg:w-full"
      }
    >
      <motion.div
        className="flex items-center justify-between mb-5 shrink-0"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-foreground font-medium text-[18px]">
          Q/C par cours
        </h3>

        <div className="flex items-center gap-2">
          {validCourses.length > 0 && (
            <Link
              href={`/dashboard/question-bank/${subjectId}/question-per-course`}
              className="text-[13px] font-medium text-primary cursor-pointer hover:underline"
            >
              Voir tout
            </Link>
          )}
        </div>
      </motion.div>

      <motion.ul
        className={`flex flex-col gap-4 flex-grow ${
          validCourses.length > MAX_VISIBLE_ITEMS
            ? "overflow-y-auto scrollbar-hide"
            : "overflow-hidden"
        }`}
        style={{
          maxHeight: listMaxHeight !== "none" ? listMaxHeight : undefined,
          paddingBottom:
            validCourses.length > MAX_VISIBLE_ITEMS
              ? `${GRADIENT_OVERLAY_HEIGHT}px`
              : "0.5rem",
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoadingProfile ? (
          <li className="text-center text-muted-foreground py-10">
            <Loading simple={true} />
          </li>
        ) : profileError ? (
          <li className="text-center text-destructive py-10">
            Erreur de chargement du profil.
          </li>
        ) : validCourses.length === 0 ? (
          <li className="text-center text-muted-foreground py-10">
            Aucun cours disponible.
          </li>
        ) : (
          validCourses.map((item) => {
            const buttonsDisabled =
              isLoadingProfile || isStartingSynergy || !!profileError;

            return (
              <motion.li
                className={`flex items-center justify-between border border-border rounded-[16px] px-[22px] py-[14px] max-md:px-[16px] ${
                  buttonsDisabled ? "opacity-50" : ""
                }`}
                key={item.id}
                variants={courseItemVariants}
                whileHover={
                  !buttonsDisabled
                    ? {
                        scale: 1.02,
                        y: -3,
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        },
                      }
                    : {}
                }
                whileTap={!buttonsDisabled ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center gap-4 max-md:w-[70%]">
                  <Image
                    src={subjectData.icon || "/default-icon.svg"}
                    alt="cours"
                    className="w-[40px] h-[40px]"
                    width={40}
                    height={40}
                    onError={(e) => {
                      e.target.src = "/default-icon.svg";
                    }}
                  />
                  <div className="flex flex-col gap-[2px]">
                    <span
                      className="font-Poppins text-foreground font-[500] text-[14px] truncate"
                      title={item.name}
                    >
                      {item.name.length > 22
                        ? `${item.name.slice(0, 16)}...`
                        : item.name}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground text-[12px] max-md:text-[11px] max-md:flex-col max-md:items-start">
                      {subjectData.name} •
                      <span className="text-primary">
                        {item.total ?? 0} Question{item.total !== 1 ? "s" : ""}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={() => handleScheduleClick(item.id)}
                    disabled={buttonsDisabled}
                    title="Planifier"
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={
                      !buttonsDisabled
                        ? {
                            scale: 1.15,
                            rotate: 5,
                            transition: { duration: 0.2 },
                          }
                        : {}
                    }
                    whileTap={!buttonsDisabled ? { scale: 0.9 } : {}}
                  >
                    <Image
                      src={planification}
                      alt="planification"
                      className="max-md:w-[24px] w-[24px]"
                      width={24}
                      height={24}
                    />
                  </motion.button>
                  <motion.button
                    onClick={() => handlePlayClick(item.id)}
                    disabled={buttonsDisabled}
                    title="Lancer"
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={
                      !buttonsDisabled
                        ? {
                            scale: 1.2,
                            rotate: -5,
                            transition: { duration: 0.2 },
                          }
                        : {}
                    }
                    whileTap={!buttonsDisabled ? { scale: 0.9 } : {}}
                  >
                    <Image
                      src={play}
                      alt="jouer"
                      className="max-md:w-[24px] w-[24px]"
                      width={24}
                      height={24}
                    />
                  </motion.button>
                </div>
              </motion.li>
            );
          })
        )}
      </motion.ul>

      <AnimatePresence mode="wait">{renderPopup()}</AnimatePresence>
    </div>
  );
};

export default Courses;
