"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import logo from "../../../../public/whiteLogo.svg";
import { QuizImage } from "@/data/data";
import { CaseIntroCard } from "./components/CaseIntroCard";
import { CaseSidebar } from "./components/CaseSidebar";
import { CaseCompletionCard } from "./components/CaseCompletionCard";
import Quiz from "@/components/dashboard/QuestionsBank/Quiz";
import { Button } from "./ui/Button";
import { COLORS } from "./ui/colors";
import { UnauthorizedError, apiFetch } from "@/app/lib/api";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const DEMO_ID = "demo";

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

export default function ClinicalCaseDemoPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    fetchCase(caseIdentifier);
  }, [caseIdentifier, fetchCase]);

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
        const response = await apiFetch<any>(
          "/clinical-case/freelancer?limit=100&page=1",
        );
        if (cancelled) return;
        const container = (response as any)?.data ?? response;
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
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          return;
        }
        if (!cancelled) {
          emitTelemetry("case_catalog_fetch_failed", {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      } finally {
        if (!cancelled) {
          setLoadingCaseOptions(false);
        }
      }
    };

    loadAvailableCases();

    return () => {
      cancelled = true;
    };
  }, []);

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
    handleSessionCompletion();
  };

  const handleStartCase = useCallback(() => {
    setShowIntro(false);
    setSidebarVisible(true);
    setAnswer(null);
    emitTelemetry("case_started", {
      caseId: caseIdentifier,
      totalQuestions,
    });
  }, [caseIdentifier, totalQuestions]);

  const gridTemplate = sidebarVisible
    ? "minmax(0,1fr) clamp(320px, 26vw, 380px)"
    : "minmax(0,1fr)";

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

      <div className="relative mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col gap-6 px-5 sm:px-7 lg:px-9 xl:px-12 2xl:px-16 py-8 md:py-10 lg:gap-8">
        <header className="flex items-center justify-between">
          <Image src={logo} alt="MyQCM" className="w-[148px] max-md:w-[120px]" />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCompleteSession}
            className="border border-[#F0E4EC] !text-[#7A1D4A]"
          >
            Terminer la session
          </Button>
        </header>

        <section className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 px-6 py-5 shadow-[0_18px_50px_-35px_rgba(248,88,159,0.45)] backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FD2E8A]">
                Catalogue clinique
              </span>
              <h2 className="text-lg font-semibold text-[#2C3E50]">
                Sélectionner un cas à explorer
              </h2>
              <p className="text-sm text-[#6C7A89]">
                Retrouvez ici le cas de démonstration officiel ainsi que vos cas publiés depuis l’espace freelancer.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:w-72">
              <label
                htmlFor="case-picker"
                className="text-xs font-medium uppercase tracking-[0.16em] text-[#7A1D4A]"
              >
                Cas disponible
              </label>
              <select
                id="case-picker"
                value={caseIdentifier}
                onChange={(event) => handleCaseSelection(event.target.value)}
                className="w-full rounded-2xl border border-[#F6CDE1] bg-white px-4 py-2.5 text-sm font-medium text-[#2C3E50] shadow-sm transition focus:border-[#FD2E8A] focus:outline-none focus:ring-2 focus:ring-[#FD2E8A33]"
              >
                {caseOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                    {option.subtitle ? ` · ${option.subtitle}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-xs text-[#6C7A89] sm:flex-row sm:items-center sm:justify-between">
            {loadingCaseOptions ? (
              <span>Chargement des cas clinques…</span>
            ) : (
              <span>
                {caseOptions.length > 1
                  ? `${caseOptions.length - 1} cas créés disponibles.`
                  : "Créez un cas dans l’espace freelancer pour qu’il apparaisse dans cette liste."}
              </span>
            )}
            <span>
              Sélectionnez un cas puis lancez la session pour enchaîner les questions correspondantes.
            </span>
          </div>
        </section>

        <main className="flex flex-1 flex-col">
          {error ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#F64C4C33] bg-[#FFE9EC] px-10 py-12 text-center shadow-md">
                <p className="text-sm font-medium text-[#B91C1C]">{error}</p>
                <Button variant="secondary" onClick={fetchCase}>
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
                  onRestart={handleRestart}
                  onReset={fetchCase}
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
                      className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors focus:outline-none focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-offset-2 focus-visible:outline-[#FD2E8A]"
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
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronLeft className="h-4 w-4" />
                      )}
                      {sidebarVisible ? "Masquer le rappel" : "Afficher le rappel"}
                    </button>
                  </div>
                  <div
                    className="grid items-start gap-5 transition-all duration-300 md:gap-6 lg:gap-7 xl:gap-8 max-lg:flex max-lg:flex-col"
                    style={{ gridTemplateColumns: gridTemplate }}
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
    </div>
  );
}
