"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import logo from "../../../../public/whiteLogo.svg";
import { QuizImage } from "@/data/data";
import { CaseIntroCard } from "./components/CaseIntroCard";
import { CaseSidebar } from "./components/CaseSidebar";
import { CaseCompletionCard } from "./components/CaseCompletionCard";
import { CaseFeedbackModal } from "./components/CaseFeedbackModal";
import { AlphaXpExplanationModal } from "./components/AlphaXpExplanationModal";
import { AlphaXpRewardsModal } from "./components/AlphaXpRewardsModal";
import Quiz from "@/components/dashboard/QuestionsBank/Quiz";
import EndSeasonPopup from "@/components/dashboard/QuestionsBank/EndSeasonPopup";
import { Button } from "./ui/Button";
import { COLORS } from "./ui/colors";
import BaseUrl from "@/components/BaseUrl";
import { isAxiosError } from "axios";
import { useUserSubscription } from "@/hooks/useUserSubscription";

type PrototypeOption = {
  id: string;
  content: string;
  is_correct: boolean;
};

type PrototypeMcq = {
  id: string;
  question: string;
  type: string;
  estimated_time: number;
  difficulty: string;
  quiz_type: string;
  options: PrototypeOption[];
  explanation?: string | null;
};

type PrototypeClinicalCase = {
  id: string;
  title: string;
  description: string;
  scenario: string;
  objectives: string[];
  tags: string[];
  author: string;
  faculty_type: string;
  year_of_study: string;
  promo?: number | null;
  mcqs: PrototypeMcq[];
};

type CasePickerOption = {
  id: string;
  title: string;
  subtitle?: string | null;
};

type AlphaXpRewardSummary = {
  total_xp_earned: number;
  testing_xp: number;
  time_spent_xp: number;
  feedback_quality_xp: number;
  time_spent_minutes: number;
  breakdown: {
    testing: string;
    timeSpent: string;
    feedbackQuality: string;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const DEMO_ID = "demo";
const ALPHA_FEATURE_ID = "clinical-case-demo";
const ALPHA_FEATURE_NAME = "Cas clinique interactif";

const emitTelemetry = (event: string, detail: Record<string, unknown>) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("clinical-case-demo", {
        detail: { event, ...detail },
      }),
    );
  }

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info(`[ClinicalCaseDemo] ${event}`, detail);
  }
};

const IntroSkeleton = () => (
  <div className="mx-auto w-full max-w-4xl rounded-[20px] border border-white/40 bg-white/50 px-6 py-10 shadow-[0_24px_55px_-38px_rgba(248,88,159,0.35)] md:max-w-5xl md:px-12 md:py-14 animate-pulse" />
);

const SidebarSkeleton = () => (
  <div className="w-full max-w-[360px] rounded-[20px] border border-white/40 bg-white/60 px-6 py-8 shadow-[0_14px_38px_-28px_rgba(248,88,159,0.45)] animate-pulse md:max-w-[380px]" />
);

const initialStats = {
  mcqs_success: 0,
  mcqs_failed: 0,
  mcqs_skipped: 0,
  total_mcqs: 0,
  accuracy: 0,
};

function ClinicalCaseDemoContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
  } = useUserSubscription();
  const isAlphaSubscriber = Boolean(subscription?.plan?.is_alpha);

  const [caseIdentifier, setCaseIdentifier] = useState<string>(() => {
    const param = searchParams.get("caseId");
    return param ?? DEMO_ID;
  });
  const [caseData, setCaseData] = useState<PrototypeClinicalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [answer, setAnswer] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caseStats, setCaseStats] = useState(initialStats);
  const [caseOptions, setCaseOptions] = useState<CasePickerOption[]>([
    {
      id: DEMO_ID,
      title: "Cas démo (accompagnement guidé)",
      subtitle: "Scénario de démonstration MyQCM",
    },
  ]);
  const [loadingCaseOptions, setLoadingCaseOptions] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [alphaActivityId, setAlphaActivityId] = useState<string | null>(null);
  const [alphaSessionLoading, setAlphaSessionLoading] = useState(false);
  const [alphaAcknowledged, setAlphaAcknowledged] = useState(false);
  const [showXpExplanation, setShowXpExplanation] = useState(false);
  const [showXpRewards, setShowXpRewards] = useState(false);
  const [xpRewards, setXpRewards] = useState<AlphaXpRewardSummary | null>(null);
  const [hasCheckedAlphaCompletion, setHasCheckedAlphaCompletion] = useState(false);
  const navigateToDashboard = useCallback(() => {
    router.push("/dashboard");
  }, [router]);
  const startAlphaSession = useCallback(async () => {
    if (
      !isAlphaSubscriber ||
      alphaActivityId ||
      alphaSessionLoading ||
      caseIdentifier !== DEMO_ID
    ) {
      return;
    }
    setAlphaSessionLoading(true);
    try {
      const response = await BaseUrl.post("/user/alpha-activity/start", {
        feature_id: ALPHA_FEATURE_ID,
        feature_name: ALPHA_FEATURE_NAME,
      });
      const activityId = response.data?.data?.activity_id;
      if (activityId) {
        setAlphaActivityId(activityId);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to start alpha session:", err);
      }
    } finally {
      setAlphaSessionLoading(false);
    }
  }, [alphaActivityId, alphaSessionLoading, caseIdentifier, isAlphaSubscriber]);
  const proceedToStartCase = useCallback(() => {
    setShowIntro(false);
    setSidebarVisible(true);
    setAnswer(null);
    void startAlphaSession();
    const total = caseData?.mcqs.length ?? 0;
    emitTelemetry("case_started", {
      caseId: caseIdentifier,
      totalQuestions: total,
    });
  }, [caseData, caseIdentifier, startAlphaSession]);
  const handleAlphaModalStart = useCallback(() => {
    setAlphaAcknowledged(true);
    setShowXpExplanation(false);
    proceedToStartCase();
  }, [proceedToStartCase]);
  const handleAlphaModalClose = useCallback(() => {
    setAlphaAcknowledged(true);
    setShowXpExplanation(false);
  }, []);
  const handleRewardsModalClose = useCallback(() => {
    setShowXpRewards(false);
    setXpRewards(null);
    navigateToDashboard();
  }, [navigateToDashboard]);
  const handleFeedbackClose = useCallback(() => {
    setShowFeedbackModal(false);
    setAlphaActivityId(null);
    navigateToDashboard();
  }, [navigateToDashboard]);
  const handleFeedbackSkip = useCallback(() => {
    setShowFeedbackModal(false);
    setAlphaActivityId(null);
    navigateToDashboard();
  }, [navigateToDashboard]);
  const handleFeedbackSubmitted = useCallback(
    async ({ rating, review }: { rating: number; review: string }) => {
      setShowFeedbackModal(false);
      if (!alphaActivityId) {
        navigateToDashboard();
        return;
      }
      try {
        const response = await BaseUrl.post(
          "/user/alpha-activity/complete",
          {
            activity_id: alphaActivityId,
            rating,
            feedback_text: review ? review : undefined,
          },
        );
        const rewardsPayload =
          (response.data?.data as AlphaXpRewardSummary | null) ?? null;
        if (rewardsPayload) {
          setXpRewards(rewardsPayload);
          setShowXpRewards(true);
        } else {
          navigateToDashboard();
        }
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to complete alpha session:", err);
        }
        navigateToDashboard();
      } finally {
        setAlphaActivityId(null);
      }
    },
    [alphaActivityId, navigateToDashboard],
  );
  const handleExitToDashboard = useCallback(() => {
    setShowFeedbackModal(true);
  }, []);

  const updateStats = useCallback(
    (updater: any) => {
      setCaseStats((previous) => {
        const patch =
          typeof updater === "function" ? updater(previous) : updater ?? {};
        const next = { ...previous, ...patch };
        const total =
          next.total_mcqs ||
          caseData?.mcqs.length ||
          previous.total_mcqs ||
          0;
        const accuracy =
          total > 0 ? Math.round((next.mcqs_success / total) * 100) : 0;
        return {
          ...next,
          total_mcqs: total,
          accuracy,
        };
      });
    },
    [caseData?.mcqs.length],
  );

  useEffect(() => {
    const paramId = searchParams.get("caseId");
    const resolvedId = paramId ?? DEMO_ID;
    setCaseIdentifier((current) =>
      current === resolvedId ? current : resolvedId,
    );
  }, [searchParams]);

  useEffect(() => {
    if (isSubscriptionLoading) {
      return;
    }
    if (!isAlphaSubscriber) {
      router.replace("/dashboard");
    }
  }, [isSubscriptionLoading, isAlphaSubscriber, router]);

  const fetchCase = useCallback(async (targetCaseId: string) => {
    if (!API_BASE_URL) {
      setError("NEXT_PUBLIC_BASE_URL est manquant dans l'environnement.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/prototype/clinical-case/${targetCaseId}`,
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const payload = (await response.json()) as PrototypeClinicalCase;
      setCaseData(payload);
      setQuestionIndex(0);
      setCompleted(false);
      setShowIntro(true);
      setSidebarVisible(true);
      setAnswer(null);
      setCaseStats({
        mcqs_success: 0,
        mcqs_failed: 0,
        mcqs_skipped: 0,
        total_mcqs: payload.mcqs.length,
        accuracy: 0,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inattendue est survenue.",
      );
      emitTelemetry("case_fetch_failed", {
        caseId: targetCaseId,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (!isAlphaSubscriber) {
      return;
    }
    fetchCase(caseIdentifier);
  }, [caseIdentifier, fetchCase, isAlphaSubscriber]);

  useEffect(() => {
    if (
      !isAlphaSubscriber ||
      caseIdentifier !== DEMO_ID ||
      hasCheckedAlphaCompletion
    ) {
      return;
    }
    let cancelled = false;

    const verifyCompletion = async () => {
      try {
        const response = await BaseUrl.get(
          "/user/alpha-activity/check-completion",
          {
            params: { feature_id: ALPHA_FEATURE_ID },
          },
        );
        if (cancelled) {
          return;
        }
        const hasCompleted = Boolean(response.data?.data?.has_completed);
        if (hasCompleted) {
          setAlphaAcknowledged(true);
        } else if (!alphaAcknowledged) {
          setShowXpExplanation(true);
        }
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to check alpha session completion:", err);
        }
      } finally {
        if (!cancelled) {
          setHasCheckedAlphaCompletion(true);
        }
      }
    };

    verifyCompletion();

    return () => {
      cancelled = true;
    };
  }, [
    alphaAcknowledged,
    caseIdentifier,
    hasCheckedAlphaCompletion,
    isAlphaSubscriber,
  ]);

  const handleCaseSelection = useCallback(
    (nextCaseId: string) => {
      if (!nextCaseId || nextCaseId === caseIdentifier) {
        return;
      }
      setCaseIdentifier(nextCaseId);
      const params = new URLSearchParams(searchParams.toString());
      if (nextCaseId === DEMO_ID) {
        params.delete("caseId");
      } else {
        params.set("caseId", nextCaseId);
      }
      const queryString = params.toString();
      router.replace(
        queryString ? `${pathname}?${queryString}` : pathname,
        { scroll: false },
      );
    },
    [caseIdentifier, pathname, router, searchParams],
  );

  useEffect(() => {
    let cancelled = false;

    const loadAvailableCases = async () => {
      setLoadingCaseOptions(true);
      try {
        const response = await BaseUrl.get(
          "/clinical-case/catalog",
          {
            params: { limit: 100, page: 1 },
          },
        );
        if (cancelled) return;
        const payload = response.data ?? {};
        const container =
          typeof payload?.data === "object" && payload.data !== null
            ? payload.data
            : payload;
        const rawCases = Array.isArray(container?.clincal_cases)
          ? container.clincal_cases
          : Array.isArray(container)
          ? container
          : [];
        if (!rawCases.length) return;
        const normalized = rawCases
          .map((item: any): CasePickerOption | null => {
            if (!item?.id) return null;
            const subtitleParts = [
              item?.author,
              item?.promo ? `Promo ${item.promo}` : null,
            ].filter(Boolean);
            return {
              id: item.id,
              title: item.title ?? "Cas clinique sans titre",
              subtitle: subtitleParts.length ? subtitleParts.join(" · ") : null,
            };
          })
          .filter(Boolean) as CasePickerOption[];
        if (!normalized.length) return;
        setCaseOptions((previous) => {
          const existingIds = new Set(previous.map((option) => option.id));
          const merged = [...previous];
          normalized.forEach((option) => {
            if (!existingIds.has(option.id)) {
              merged.push(option);
              existingIds.add(option.id);
            }
          });
          return merged;
        });
      } catch (err: unknown) {
        if (isAxiosError(err) && err.response?.status === 403) {
          // User lacks Labs access; keep demo case only.
          return;
        }
        if (!cancelled) {
          emitTelemetry("case_catalog_fetch_failed", {
            error:
              err instanceof Error
                ? err.message
                : typeof err === "string"
                ? err
                : "Unexpected error",
          });
        }
      } finally {
        if (!cancelled) {
          setLoadingCaseOptions(false);
        }
      }
    };

    if (!isAlphaSubscriber) {
      return;
    }
    loadAvailableCases();

    return () => {
      cancelled = true;
    };
  }, [isAlphaSubscriber]);

  useEffect(() => {
    if (!caseData || caseIdentifier === DEMO_ID) {
      return;
    }
    setCaseOptions((previous) => {
      if (previous.some((option) => option.id === caseIdentifier)) {
        return previous;
      }
      const subtitleParts = [
        caseData.author,
        caseData.promo ? `Promo ${caseData.promo}` : null,
      ].filter(Boolean);
      return [
        ...previous,
        {
          id: caseIdentifier,
          title: caseData.title ?? "Cas clinique sans titre",
          subtitle: subtitleParts.length ? subtitleParts.join(" · ") : null,
        },
      ];
    });
  }, [caseData, caseIdentifier]);

  const goToNextQuestion = useCallback(() => {
    setAnswer(null);
    if (!caseData) return;
    const nextIndex = questionIndex + 1;
    if (nextIndex >= caseData.mcqs.length) {
      setCompleted(true);
    } else {
      setQuestionIndex(nextIndex);
    }
  }, [caseData, questionIndex]);

  const handleProgress = useCallback(
    async (payload: any) => {
      if (!API_BASE_URL) {
        throw new Error("API non configuree pour la fonctionnalite clinique.");
      }

      setIsSubmitting(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/prototype/clinical-case/${caseIdentifier}/submit`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `Erreur ${response.status}`);
        }

        const submission = (await response.json()) as {
          success_ratio: number;
          selected_options: { id: string; is_correct: boolean }[];
          correct_options: { id: string; is_correct: boolean }[];
          options: PrototypeMcq["options"];
          explanation: string | null;
          question: string;
          response: string | null;
          answer: string | null;
        };

        setAnswer(submission);

        if (!payload?.is_skipped) {
          updateStats((prev: any) => ({
            ...prev,
            mcqs_success: prev.mcqs_success + (submission.success_ratio === 1 ? 1 : 0),
            mcqs_failed: prev.mcqs_failed + (submission.success_ratio === 1 ? 0 : 1),
          }));
        }

        emitTelemetry("question_submitted", {
          caseId: caseIdentifier,
          mcq: payload?.mcq,
          skipped: Boolean(payload?.is_skipped),
          success: submission.success_ratio,
        });

        return submission;
      } catch (err) {
        emitTelemetry("submission_failed", {
          caseId: caseIdentifier,
          mcq: payload?.mcq,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [API_BASE_URL, caseIdentifier, updateStats],
  );

  const handleSessionCompletion = useCallback(() => {
    if (!caseData) return;
    const attempted =
      caseStats.mcqs_success + caseStats.mcqs_failed + caseStats.mcqs_skipped;
    const remaining = caseData.mcqs.length - attempted;
    if (remaining > 0) {
      updateStats((prev: any) => ({
        ...prev,
        mcqs_skipped: prev.mcqs_skipped + remaining,
      }));
    }
    setCompleted(true);
    setAnswer(null);
    emitTelemetry("case_completed", {
      caseId: caseIdentifier,
      stats: {
        success: caseStats.mcqs_success,
        failed: caseStats.mcqs_failed,
        skipped: caseStats.mcqs_skipped + Math.max(0, remaining),
        total: caseData.mcqs.length,
      },
    });
  }, [caseData, caseIdentifier, caseStats, updateStats]);

  const handleRestart = () => {
    if (!caseData) return;
    setQuestionIndex(0);
    setCompleted(false);
    setShowIntro(true);
    setSidebarVisible(true);
    setAnswer(null);
    setCaseStats({
      mcqs_success: 0,
      mcqs_failed: 0,
      mcqs_skipped: 0,
      total_mcqs: caseData.mcqs.length,
      accuracy: 0,
    });
  };

  const totalQuestions = caseData?.mcqs.length ?? 0;
  const currentQuestionNumber = Math.min(
    caseStats.mcqs_success + caseStats.mcqs_failed + caseStats.mcqs_skipped + 1,
    totalQuestions,
  );
  const currentQuestion =
    caseData && !completed ? caseData.mcqs[questionIndex] : null;

  const defaultObjectives = [
    "Analyser le scenario clinique propose.",
    "Repondre aux questions pour valider votre comprehension.",
  ];

  const caseObjectives =
    caseData && caseData.objectives.length > 0
      ? caseData.objectives
      : defaultObjectives;

  const caseTags = useMemo(() => {
    if (!caseData?.tags?.length) return [] as string[];
    return Array.from(new Set(caseData.tags.filter(Boolean)));
  }, [caseData?.tags]);

  const fallbackMeta = [
    caseData?.author,
    caseData?.faculty_type
      ? caseData.faculty_type
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : undefined,
    caseData?.year_of_study
      ? caseData.year_of_study
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : undefined,
    caseData?.promo ? `Promo ${caseData.promo}` : undefined,
  ].filter(Boolean) as string[];

  const sidebarMeta = caseTags.length > 0 ? caseTags : fallbackMeta;

  const handleCompleteSession = () => {
    setShowEndSessionModal(true);
  };

  const confirmEndSession = useCallback(() => {
    setShowEndSessionModal(false);
    handleSessionCompletion();
  }, [handleSessionCompletion]);

  const cancelEndSession = useCallback(() => {
    setShowEndSessionModal(false);
  }, []);

  const handleStartCase = useCallback(() => {
    if (
      isAlphaSubscriber &&
      caseIdentifier === DEMO_ID &&
      !alphaAcknowledged
    ) {
      setShowXpExplanation(true);
      return;
    }
    proceedToStartCase();
  }, [
    alphaAcknowledged,
    caseIdentifier,
    isAlphaSubscriber,
    proceedToStartCase,
  ]);

  const gridTemplate = sidebarVisible
    ? "minmax(0,1fr) minmax(320px, 380px)"
    : "minmax(0,1fr)";

  if (isSubscriptionLoading || !isAlphaSubscriber) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, #FF6FAF 0%, #FF88C1 50%, rgba(255,222,238,1) 100%)",
        }}
      >
        <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#F8589F] shadow">
          Vérification de votre accès Labs…
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #FF6FAF 0%, #FF88C1 50%, rgba(255,222,238,1) 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 select-none">
        {QuizImage.map((item, index) => (
          <Image
            key={`${item.alt}-${index}`}
            src={item.img}
            alt={item.alt}
            className={item.className}
            priority={index === 0}
            style={{ opacity: 0.35 }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col gap-6 px-4 sm:px-6 md:px-7 lg:px-9 xl:px-12 2xl:px-16 py-6 md:py-8 lg:py-10 lg:gap-8">
        <header className="flex items-center justify-between gap-3">
          <Image src={logo} alt="MyQCM" className="w-[148px] max-md:w-[110px] max-sm:w-[100px]" />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCompleteSession}
            className="border border-[#F0E4EC] !text-[#7A1D4A] max-md:text-[12px] max-md:px-3 max-md:py-1.5"
          >
            <span className="max-sm:hidden">Terminer la session</span>
            <span className="sm:hidden">Terminer</span>
          </Button>
        </header>

        <section className="rounded-[28px] bg-white px-6 py-8 shadow-[0_30px_90px_-60px_rgba(17,14,31,0.45)] md:px-10 md:py-9 max-md:px-4 max-md:py-6 max-md:rounded-[20px]">
          <div className="space-y-6 max-md:space-y-5">
            <div className="space-y-3 max-md:space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFE4F1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#F8589F] max-md:text-[10px] max-md:px-2.5 max-md:py-0.5">
                Catalogue clinique
              </div>
              <div>
                <h2 className="text-[26px] font-semibold text-[#221427] max-md:text-[20px] max-sm:text-[18px]">
                  Sélectionnez un cas à explorer
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#625371] max-md:text-[14px] max-md:mt-2">
                  Choisissez le scénario que vous souhaitez tester. Chaque carte correspond
                  au cas de démonstration ou à l&apos;un de vos prototypes publiés dans l&apos;espace freelancer.
                </p>
              </div>
            </div>

            <div className="relative">
              {loadingCaseOptions ? (
                <div className="absolute inset-0 z-10 rounded-[28px] border border-[#F2D0E5] bg-white/70 backdrop-blur-[2px]" />
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 max-md:gap-3">
                {caseOptions.map((option) => {
                  const isActive = option.id === caseIdentifier;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleCaseSelection(option.id)}
                      className={`group relative flex h-full flex-col justify-between rounded-[26px] border border-transparent bg-white px-6 py-5 text-left shadow-[0_18px_60px_-45px_rgba(24,14,41,0.45)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FD2E8A] max-md:rounded-[20px] max-md:px-4 max-md:py-4 ${
                        isActive
                          ? "ring-2 ring-[#FD2E8A]"
                          : "hover:border-[#FD2E8A33] hover:shadow-[0_26px_70px_-50px_rgba(24,14,41,0.55)]"
                      }`}
                      aria-pressed={isActive}
                    >
                      <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#FFE8F3] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FD2E8A] max-md:text-[9px] max-md:px-2.5 max-md:py-0.5">
                          {option.id === DEMO_ID ? "Cas démo" : "Prototype"}
                        </span>
                        <h3 className="mt-3 text-[15px] font-semibold text-[#241B30] leading-snug line-clamp-2 max-md:text-[14px] max-md:mt-2">
                          {option.title}
                        </h3>
                        {option.subtitle ? (
                          <p className="mt-2 text-[12px] text-[#7D6A90] line-clamp-2 max-md:text-[11px]">
                            {option.subtitle}
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-6 flex items-center justify-between text-xs text-[#9680AD] max-md:mt-4 max-md:text-[11px]">
                        <span>
                          {isActive ? "Cas sélectionné" : "Cliquer pour charger"}
                        </span>
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition max-md:h-8 max-md:w-8 ${
                            isActive
                              ? "border-[#FD2E8A] bg-[#FD2E8A] text-white"
                              : "border-[#E4CCE8] bg-white text-[#C58DB2] group-hover:border-[#FD2E8A]"
                          }`}
                        >
                          {isActive ? "✓" : "→"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-[#7A698C] max-md:text-[11px]">
              {caseOptions.length > 1
                ? `${caseOptions.length - 1} prototype${caseOptions.length - 1 > 1 ? "s" : ""} prêt${caseOptions.length - 1 > 1 ? "s" : ""} à être test${caseOptions.length - 1 > 1 ? "és" : "é"}.`
                : "Publiez votre premier cas clinique dans l'espace freelancer pour enrichir ce catalogue."}
            </p>
          </div>
        </section>

        <main className="flex flex-1 flex-col">
          {error ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#F64C4C33] bg-[#FFE9EC] px-10 py-12 text-center shadow-md">
                <p className="text-sm font-medium text-[#B91C1C]">{error}</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (caseIdentifier) {
                      void fetchCase(caseIdentifier);
                    }
                  }}
                >
                  Reessayer
                </Button>
              </div>
            </div>
          ) : loading || !caseData ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-3xl border border-dashed border-[#F6CDE1] bg-white/80 px-12 py-14 text-sm font-medium text-[#6C7A89] shadow-xl backdrop-blur-sm">
                Chargement du cas clinique...
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-5 pb-10">
              {completed ? (
                <CaseCompletionCard
                  stats={{
                    total: caseStats.total_mcqs,
                    correct: caseStats.mcqs_success,
                    incorrect: caseStats.mcqs_failed,
                    skipped: caseStats.mcqs_skipped,
                    accuracy: caseStats.accuracy,
                  }}
                  onReplay={handleRestart}
                  onExit={handleExitToDashboard}
                />
              ) : showIntro ? (
                caseData ? (
                  <CaseIntroCard
                    title={caseData.title}
                    description={caseData.description}
                    scenario={caseData.scenario}
                    objectives={caseObjectives}
                    tags={caseTags}
                    author={caseData.author}
                    facultyType={caseData.faculty_type}
                    yearOfStudy={caseData.year_of_study}
                    promo={caseData.promo}
                    totalQuestions={totalQuestions}
                    initialQuestionMeta={caseData.mcqs[0]}
                    onStart={handleStartCase}
                    onDefer={handleCompleteSession}
                  />
                ) : (
                  <IntroSkeleton />
                )
              ) : currentQuestion ? (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setSidebarVisible((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors focus:outline-none focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-offset-2 focus-visible:outline-[#FD2E8A] max-md:text-[10px] max-md:px-3 max-md:py-1.5"
                      aria-pressed={sidebarVisible}
                      aria-label={sidebarVisible ? "Masquer le rappel" : "Afficher le rappel"}
                      style={{
                        borderColor: "rgba(248, 88, 159, 0.2)",
                        background: "rgba(255,255,255,0.92)",
                        color: sidebarVisible ? COLORS.textSecondary : COLORS.primaryDark,
                        boxShadow: "0 10px 28px -20px rgba(248,88,159,0.9)",
                      }}
                    >
                      {sidebarVisible ? (
                        <ChevronRight className="h-4 w-4 max-md:h-3.5 max-md:w-3.5" />
                      ) : (
                        <ChevronLeft className="h-4 w-4 max-md:h-3.5 max-md:w-3.5" />
                      )}
                      <span className="max-sm:hidden">{sidebarVisible ? "Masquer le rappel" : "Afficher le rappel"}</span>
                      <span className="sm:hidden">{sidebarVisible ? "Masquer" : "Afficher"}</span>
                    </button>
                  </div>
                  <div
                    className={`transition-all duration-300 ${
                      sidebarVisible
                        ? "flex flex-col gap-5 lg:grid lg:items-start lg:gap-6 xl:gap-8"
                        : "flex flex-col gap-5"
                    }`}
                    style={sidebarVisible ? { gridTemplateColumns: gridTemplate } : undefined}
                  >
                    <div className="min-w-0">
                      <Quiz
                        key={currentQuestion.id}
                        questionData={currentQuestion}
                        Progress={handleProgress}
                        isSubmitting={isSubmitting}
                        answer={answer}
                        setAnswer={setAnswer}
                        setData={updateStats}
                        isFinalQuestion={questionIndex === totalQuestions - 1}
                        fetchNextMcq={goToNextQuestion}
                        isLoadingNextMcq={false}
                        handleSessionCompletion={handleSessionCompletion}
                        totalQuestions={totalQuestions}
                        currentQuestionNumber={currentQuestionNumber}
                      />
                    </div>
                    {sidebarVisible ? (
                      caseData ? (
                        <CaseSidebar
                          title={caseData.title}
                          scenario={caseData.scenario}
                          objectives={caseObjectives}
                          meta={sidebarMeta}
                        />
                      ) : (
                        <SidebarSkeleton />
                      )
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </main>
      </div>
      {showEndSessionModal ? (
        <EndSeasonPopup
          onConfirm={confirmEndSession}
          onCancel={cancelEndSession}
        />
      ) : null}

      <CaseFeedbackModal
        caseIdentifier={caseIdentifier}
        open={showFeedbackModal}
        onClose={handleFeedbackClose}
        onSkip={handleFeedbackSkip}
        onSubmitted={handleFeedbackSubmitted}
      />
      {isAlphaSubscriber ? (
        <>
          <AlphaXpExplanationModal
            open={showXpExplanation}
            onClose={handleAlphaModalClose}
            onStart={handleAlphaModalStart}
            featureName={ALPHA_FEATURE_NAME}
          />
          <AlphaXpRewardsModal
            open={showXpRewards}
            onClose={handleRewardsModalClose}
            rewards={xpRewards}
          />
        </>
      ) : null}
    </div>
  );
}

export default function ClinicalCaseDemoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-sm text-[#6C7A89]">
          Chargement du cas clinique...
        </div>
      }
    >
      <ClinicalCaseDemoContent />
    </Suspense>
  );
}
