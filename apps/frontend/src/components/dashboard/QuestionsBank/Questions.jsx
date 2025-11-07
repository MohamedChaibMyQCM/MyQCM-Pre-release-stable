"use client";

import Image from "next/image";
import playSeasonIcon from "../../../../public/Icons/play.svg";
import planification from "../../../../public/Icons/planification.svg";
import { useMemo, useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import BulkKcSuggestionModal from "./BulkKcSuggestionModal";
import BulkKcSuggestionProgressModal from "./BulkKcSuggestionProgressModal";

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
  const kcFeatureEnabled =
    process.env.NEXT_PUBLIC_KC_SUGGESTION_ENABLED === "true";

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
  const [bulkModalCourse, setBulkModalCourse] = useState(null);
  const [progressJob, setProgressJob] = useState(null);
  const [needsReviewByCourse, setNeedsReviewByCourse] = useState({});
  const [showNeedsReviewOnly, setShowNeedsReviewOnly] = useState(false);

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
      case NORMALIZED_GUIDED_MODE:
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
      case NORMALIZED_INTELLIGENTE_MODE:
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
        console.error(
          `Mode utilisateur inconnu: ${userModeRaw || "(inconnu)"}`
        );
        closePopup();
        return null;
    }
    return null;
  };

  const filteredCourses = useMemo(() => {
    if (!kcFeatureEnabled || !showNeedsReviewOnly) {
      return displayData;
    }
    return displayData.filter((item) => {
      const entry = needsReviewByCourse[item.id];
      return entry && entry.count > 0;
    });
  }, [displayData, kcFeatureEnabled, needsReviewByCourse, showNeedsReviewOnly]);

  if (isLoadingCourses || isLoadingProfile) {
    return <Loading />;
  }
  if (coursesError) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-4 text-destructive">
        Erreur: {coursesError.message}
      </div>
    );
  }

  const handleOpenBulkModal = (course) => {
    if (!kcFeatureEnabled) {
      toast.error("La fonctionnalité de suggestion KC est désactivée.");
      return;
    }
    setBulkModalCourse({
      id: course.id,
      name: course.name,
    });
  };

  const handleJobStarted = (job) => {
    setBulkModalCourse(null);
    setProgressJob(job);
  };

  const handleProgressComplete = ({ job: jobSummary, results, needsReview }) => {
    if (results && Array.isArray(results)) {
      const reviewIds = results
        .filter((item) => {
          const confidence =
            item?.confidence ?? item?.confidenceLevel ?? item?.level ?? "low";
          return typeof confidence === "string" && confidence.toLowerCase() !== "high";
        })
        .map((item) => item?.mcqId ?? item?.id)
        .filter(Boolean);

      setNeedsReviewByCourse((prev) => ({
        ...prev,
        [jobSummary.courseId]: {
          count: reviewIds.length,
          ids: reviewIds,
          timestamp: Date.now(),
        },
      }));
    } else if (typeof needsReview === "number") {
      setNeedsReviewByCourse((prev) => ({
        ...prev,
        [jobSummary.courseId]: {
          count: needsReview,
          ids: [],
          timestamp: Date.now(),
        },
      }));
    }
    setProgressJob(null);
  };

  const handleJobAbort = (job) => {
    toast.success("Tâche annulée.");
    setProgressJob(null);
  };

  return (
    <div className="relative rounded-[20px]">
      <motion.div
        className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div>
          <h1 className="font-Poppins font-[500] text-[22px] text-foreground">
            Questions par cours
          </h1>
          {kcFeatureEnabled ? (
            <p className="text-sm text-muted-foreground">
              Sélectionnez un cours pour lancer des suggestions KC en masse.
            </p>
          ) : null}
        </div>
        {kcFeatureEnabled ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNeedsReviewOnly((prev) => !prev)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                showNeedsReviewOnly
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {showNeedsReviewOnly
                ? "Afficher tous les cours"
                : "Voir uniquement les cours à vérifier"}
            </button>
          </div>
        ) : null}
      </motion.div>

      {filteredCourses.length === 0 ? (
        <div className="p-4 text-muted-foreground bg-muted border border-border rounded box">
          Aucun cours (avec questions) trouvé.
        </div>
      ) : (
        <motion.ul
          className="flex flex-col gap-4 bg-card border border-border p-5 rounded-[16px] box"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredCourses.map((item) => {
            const MAX_NAME_LENGTH = 26;
            const progress = item.progress_percentage || 0;
            const displayName =
              item.name.length > MAX_NAME_LENGTH
                ? `${item.name.slice(0, MAX_NAME_LENGTH)}...`
                : item.name;
            const questionLabel = `Question${item.total !== 1 ? "s" : ""}`;
            const reviewEntry = needsReviewByCourse[item.id];

            return (
              <motion.li
                className={`flex items-center justify-between border border-border rounded-[16px] px-[22px] py-[14px] max-md:px-[16px] ${
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
                      className="font-Poppins text-foreground font-[500] text-[14px] truncate md:hidden"
                      title={item.name}
                    >
                      {displayName}
                    </span>
                    <span className="font-Poppin text-foreground font-[500] text-[14px] truncate max-md:hidden">
                      {item.name}
                    </span>
                    <span className="font-Poppins text-muted-foreground text-[12px] whitespace-nowrap max-md:flex max-md:flex-col">
                      {subjectData.name} •{" "}
                      <span className="text-primary">
                        {item.total} {questionLabel}
                      </span>
                    </span>
                    {kcFeatureEnabled && reviewEntry && reviewEntry.count > 0 ? (
                      <span className="mt-1 inline-flex w-max items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        {reviewEntry.count} question
                        {reviewEntry.count > 1 ? "s" : ""} à vérifier
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-8 mr-5">
                  <span className="text-[14px] text-primary font-Inter font-medium">
                    Précision
                  </span>
                  <div className="flex items-center gap-3 mr-5">
                    <span
                      role="progressbar"
                      className="relative block w-[200px] h-[12px] bg-muted rounded-[16px] overflow-hidden"
                    >
                      <span
                        className="absolute left-0 h-[12px] bg-gradient-to-r from-primary to-[#FD2E8A]"
                        style={{ width: `${progress}%` }}
                      ></span>
                    </span>
                    <span className="text-foreground font-Inter font-medium text-[13px] w-[50px] text-right">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {kcFeatureEnabled ? (
                    <button
                      type="button"
                      onClick={() => handleOpenBulkModal(item)}
                      className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition-colors duration-200 hover:border-indigo-300 hover:bg-indigo-100"
                      disabled={buttonsDisabled}
                    >
                      Suggestions KC (Beta)
                    </button>
                  ) : null}
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

      <AnimatePresence mode="wait">{renderPopup()}</AnimatePresence>

      {kcFeatureEnabled && bulkModalCourse ? (
        <BulkKcSuggestionModal
          open
          courseId={bulkModalCourse.id}
          courseName={bulkModalCourse.name}
          onClose={() => setBulkModalCourse(null)}
          onJobStart={handleJobStarted}
        />
      ) : null}

      {kcFeatureEnabled && progressJob ? (
        <BulkKcSuggestionProgressModal
          open
          job={progressJob}
          onClose={() => setProgressJob(null)}
          onComplete={handleProgressComplete}
          onAbort={handleJobAbort}
        />
      ) : null}
    </div>
  );
};

export default Questions;
