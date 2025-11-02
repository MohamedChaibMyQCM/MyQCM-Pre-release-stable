"use client";

import Image from "next/image";
import playSeasonIcon from "../../../../public/Icons/play.svg";
import planification from "../../../../public/Icons/planification.svg";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import BaseUrl from "@/components/BaseUrl";
import secureLocalStorage from "react-secure-storage";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import CustomSeason from "./TrainingPopups/CustomSeason";
import CustomSchedule from "./TrainingPopups/CustomShedule";
import GuidedSeason from "./TrainingPopups/GuidedSeason";
import GuidedSchedule from "./TrainingPopups/GuidedShedule";
import SynergySchedule from "./TrainingPopups/SynergyShedule";
import { useUserProfile } from "@/hooks/useUserProfile";
import { motion } from "framer-motion";

const normalizeModeName = (modeName) => {
  if (typeof modeName !== "string") {
    return "";
  }
  return modeName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const CUSTOM_MODE = "Mode Personnalisé";
const GUIDED_MODE = "Mode Guidé";
const INTELLIGENTE_MODE = "Mode Intelligent";

const NORMALIZED_CUSTOM_MODE = normalizeModeName(CUSTOM_MODE);
const NORMALIZED_GUIDED_MODE = normalizeModeName(GUIDED_MODE);
const NORMALIZED_INTELLIGENTE_MODE = normalizeModeName(INTELLIGENTE_MODE);

const Questions = ({
  data = [],
  isLoading: isLoadingCourses,
  error: coursesError,
  subjectData = { icon: "/default-icon.svg", name: "Unknown Subject" },
}) => {
  const router = useRouter();

  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useUserProfile();

  const userModeRaw = userProfile?.mode?.name;
  const normalizedUserMode = normalizeModeName(userModeRaw);

  const displayData = data;

  const { mutate: startSynergySession, isPending: isStartingSynergy } =
    useMutation({
      mutationFn: async (payload) => {
        const token = secureLocalStorage.getItem("token");
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
        console.error("Erreur démarrage session intelligente:", error);
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
    setSelectedCourseId(courseId);
    setActivePopup("schedule");
  };

  const handlePlayClick = (courseId) => {
    // Check if the token exists
    const token = secureLocalStorage.getItem("token");
    if (!token) {
      toast.error(
        "Veuillez vous connecter pour accéder à cette fonctionnalité."
      );
      return;
    }

    // Ensure the profile has loaded correctly
    if (isLoadingProfile) {
      toast.loading("Chargement du profil en cours...");
      return;
    }

    if (profileError) {
      toast.error(
        "Erreur lors du chargement du profil. Veuillez actualiser la page."
      );
      console.error("Profile error details:", profileError);
      return;
    }

    if (!userProfile) {
      toast.error(
        "Profil utilisateur non disponible. Veuillez actualiser la page."
      );
      return;
    }

    if (!normalizedUserMode) {
      toast.error(
        "Mode utilisateur non défini. Veuillez contacter le support."
      );
      console.error("User profile without mode:", userProfile);
      return;
    }

    // Now proceed with the normal flow
    if (normalizedUserMode === NORMALIZED_INTELLIGENTE_MODE) {
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

  // Premium animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  if (isLoadingCourses || isLoadingProfile) {
    return <Loading />;
  }
  if (coursesError) {
    return (
      <div className="p-4 text-red-600 bg-red-100 border border-red-400 rounded">
        Erreur: {coursesError.message}
      </div>
    );
  }

  // Make sure buttons are properly disabled when needed
  const buttonsDisabled =
    isLoadingProfile ||
    isStartingSynergy ||
    !userProfile ||
    !normalizedUserMode;

  const renderPopup = () => {
    if (
      !activePopup ||
      !selectedCourseId ||
      isLoadingProfile ||
      !normalizedUserMode ||
      profileError
    ) {
      return null;
    }

    switch (normalizedUserMode) {
      case NORMALIZED_CUSTOM_MODE:
        if (activePopup === "play")
          return (
            <CustomSeason setPopup={closePopup} courseId={selectedCourseId} />
          );
        if (activePopup === "schedule")
          return (
            <CustomSchedule setPopup={closePopup} courseId={selectedCourseId} />
          );
        break;
      case NORMALIZED_GUIDED_MODE:
        if (activePopup === "play")
          return (
            <GuidedSeason setPopup={closePopup} courseId={selectedCourseId} />
          );
        if (activePopup === "schedule")
          return (
            <GuidedSchedule setPopup={closePopup} courseId={selectedCourseId} />
          );
        break;
      case NORMALIZED_INTELLIGENTE_MODE:
        if (activePopup === "schedule")
          return (
            <SynergySchedule
              setPopup={closePopup}
              courseId={selectedCourseId}
            />
          );
        break;
      default:
        console.error(
          `Mode utilisateur inconnu: ${userModeRaw || "(inconnu)"}`
        );
        closePopup();
        return null;
    }
    return null;
  };

  return (
    <div className="relative rounded-[20px]">
      <motion.div
        className="flex items-center justify-between mb-5"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="font-Poppins font-[500] text-[22px] text-[#191919]">
          Questions par cours
        </h1>
      </motion.div>

      {displayData.length === 0 ? (
        <div className="p-4 text-gray-600 bg-gray-100 border border-gray-300 rounded box">
          Aucun cours (avec questions) trouvé.
        </div>
      ) : (
        <motion.ul
          className="flex flex-col gap-4 bg-[#FFFFFF] p-5 rounded-[16px] box"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {displayData.map((item) => {
            const MAX_NAME_LENGTH = 26;
            const progress = item.progress_percentage || 0;
            const displayName =
              item.name.length > MAX_NAME_LENGTH
                ? `${item.name.slice(0, MAX_NAME_LENGTH)}...`
                : item.name;
            const questionLabel = `Question${item.total !== 1 ? "s" : ""}`;

            return (
              <motion.li
                className={`flex items-center justify-between border border-[#E4E4E4] rounded-[16px] px-[22px] py-[14px] max-md:px-[16px] ${
                  buttonsDisabled ? "opacity-60 cursor-not-allowed" : ""
                }`}
                key={item.id}
                variants={itemVariants}
                whileHover={
                  !buttonsDisabled
                    ? {
                        scale: 1.02,
                        y: -3,
                        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.1)",
                        borderColor: "#F8589F",
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        },
                      }
                    : {}
                }
                whileTap={!buttonsDisabled ? { scale: 0.98 } : {}}
              >
                <div className="basis-[34%] flex items-center gap-4 max-md:gap-3 max-md:basis-[82%]">
                  <Image
                    src={subjectData.icon || "/default-icon.svg"}
                    alt={`Icon for ${subjectData.name}`}
                    width={40}
                    height={40}
                    className="w-[40px] h-[40px] max-md:w-[34px] max-md:h-[34px] shrink-0"
                    onError={(e) => {
                      e.target.src = "/default-icon.svg";
                    }}
                  />
                  <div className="flex flex-col gap-[2px] overflow-hidden w-[300px] max-xl:w-[200px] max-md:w-[160px]">
                    <span
                      className="font-Poppins text-[#191919] font-[500] text-[14px] truncate md:hidden"
                      title={item.name}
                    >
                      {displayName}
                    </span>
                    <span className="font-Poppin text-[#191919] font-[500] text-[14px] truncate max-md:hidden">
                      {item.name}
                    </span>
                    <span className="font-Poppins text-[#666666] text-[12px] whitespace-nowrap max-md:flex max-md:flex-col">
                      {subjectData.name} •{" "}
                      <span className="text-[#F8589F]">
                        {item.total} {questionLabel}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-8 mr-5">
                  <span className="text-[14px] text-[#F8589F] font-Inter font-medium">
                    Précision
                  </span>
                  <div className="flex items-center gap-3 mr-5">
                    <span
                      role="progressbar"
                      className="relative block w-[200px] h-[12px] bg-[#F5F5F5] rounded-[16px] overflow-hidden"
                    >
                      <span
                        className="absolute left-0 h-[12px] bg-gradient-to-r from-[#F8589F] to-[#FD2E8A]"
                        style={{ width: `${progress}%` }}
                      ></span>
                    </span>
                    <span className="text-[#191919] font-Inter font-medium text-[13px] w-[50px] text-right">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <motion.button
                    onClick={() => handleScheduleClick(item.id)}
                    disabled={buttonsDisabled}
                    aria-label={`Planifier session ${item.name}`}
                    title={
                      buttonsDisabled
                        ? isLoadingProfile
                          ? "Chargement..."
                          : "Session en cours..."
                        : "Planifier"
                    }
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={
                      !buttonsDisabled
                        ? {
                            scale: 1.2,
                            rotate: 8,
                            transition: { duration: 0.2 },
                          }
                        : {}
                    }
                    whileTap={!buttonsDisabled ? { scale: 0.85 } : {}}
                  >
                    <Image
                      src={planification}
                      alt="Planifier"
                      className="max-md:w-[24px] w-[24px]"
                      width={24}
                      height={24}
                    />
                  </motion.button>
                  <motion.button
                    onClick={() => handlePlayClick(item.id)}
                    disabled={buttonsDisabled}
                    aria-label={`Lancer session ${item.name}`}
                    title={
                      buttonsDisabled
                        ? isLoadingProfile
                          ? "Chargement..."
                          : "Session en cours..."
                        : "Lancer"
                    }
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={
                      !buttonsDisabled
                        ? {
                            scale: 1.25,
                            rotate: -8,
                            transition: { duration: 0.2 },
                          }
                        : {}
                    }
                    whileTap={!buttonsDisabled ? { scale: 0.85 } : {}}
                  >
                    <Image
                      src={playSeasonIcon}
                      alt="Lancer"
                      className="max-md:w-[24px] w-[24px]"
                      width={24}
                      height={24}
                    />
                  </motion.button>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      )}

      {renderPopup()}
    </div>
  );
};

export default Questions;
