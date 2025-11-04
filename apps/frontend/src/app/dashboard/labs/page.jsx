"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Sparkles, Lock, Clock, Stethoscope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import BaseUrl from "@/components/BaseUrl";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { AlphaXpExplanationModal } from "@/app/demo/clinical-case/components/AlphaXpExplanationModal";

const CLINICAL_CASE_DEMO_ID = "demo";

const fetchClinicalCaseSummary = async () => {
  const response = await BaseUrl.get(
    `/clinical-case/feedback/${CLINICAL_CASE_DEMO_ID}/summary`,
  );
  return response.data?.data;
};

const formatAverage = (value) =>
  typeof value === "number" ? value.toFixed(1) : "—";

const LabsSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F8589F]/10 via-[#FD2E8A]/10 to-[#FF7CB1]/10 dark:from-[#F8589F]/20 dark:via-[#FD2E8A]/20 dark:to-[#FF7CB1]/20 p-5 shadow-sm dark:shadow-[0px_2px_8px_rgba(0,0,0,0.3)]"
  >
    <div className="flex items-start gap-4">
      <div className="h-16 w-16 animate-pulse rounded-xl bg-gradient-to-r from-[#FDE3F0] to-[#F9D8E9] dark:from-[#F8589F]/30 dark:to-[#FD2E8A]/30" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-24 animate-pulse rounded-full bg-gradient-to-r from-[#FDE3F0] to-[#F9D8E9] dark:from-[#F8589F]/30 dark:to-[#FD2E8A]/30" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-gradient-to-r from-[#F9D8E9] to-[#FDE3F0] dark:from-[#FD2E8A]/30 dark:to-[#F8589F]/30" />
        <div className="flex gap-2">
          <div className="h-7 w-20 animate-pulse rounded-full bg-[#FDE3F0] dark:bg-[#F8589F]/30" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-[#FDE3F0] dark:bg-[#F8589F]/30" />
        </div>
      </div>
    </div>
  </motion.div>
);

const AlphaFeatureCard = ({ summary, onLaunchDemo }) => {
  const average = formatAverage(summary?.average_rating ?? 0);
  const totalReviews = summary?.total_reviews ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16 }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F8589F] to-[#FD2E8A] p-[1px] shadow-lg shadow-black/15 transition-all duration-300 hover:shadow-xl hover:shadow-black/25"
    >
      {/* Inner border glow */}
      <div className="absolute inset-[1px] rounded-2xl border border-white/15 pointer-events-none" />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Radial highlight - top right */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl transition-all duration-700 group-hover:bg-white/15" />

      {/* Animated shine effect on hover */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
          animate={{
            translateX: ["0%", "200%"],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
          style={{
            transform: "skewX(-20deg)",
          }}
        />
      </div>

      <div className="relative rounded-2xl bg-gradient-to-br from-[#F8589F] to-[#FD2E8A] p-5 max-md:p-4">
        <div className="flex items-start gap-4 max-md:gap-3">
          {/* Left: Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="shrink-0"
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm shadow-md max-md:h-14 max-md:w-14">
              <Stethoscope className="h-8 w-8 text-white max-md:h-7 max-md:w-7" strokeWidth={1.5} />
              {/* Pulse animation */}
              <div className="absolute inset-0 rounded-xl bg-white/20 animate-ping" style={{ animationDuration: "3s" }} />
            </div>
          </motion.div>

          {/* Right: Content */}
          <div className="flex-1 flex flex-col gap-2.5 min-w-0">
            {/* Header with badges */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 }}
                  className="inline-flex w-fit items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm ring-1 ring-white/20"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  Alpha
                </motion.span>

                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.14 }}
                  className="text-[17px] font-bold leading-tight text-white max-md:text-[16px]"
                >
                  Cas clinique interactif
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.16 }}
                  className="text-[12px] leading-snug text-white/85 font-normal"
                >
                  Parcours guidé avec QCM immersifs
                </motion.p>
              </div>

              {/* Ribbon badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.18, type: "spring" }}
                className="relative shrink-0 rounded-lg bg-white/20 px-2.5 py-1 text-center backdrop-blur-sm ring-1 ring-white/30 max-md:hidden"
              >
                <div className="text-[9px] font-bold uppercase tracking-wide text-white/80">Demo</div>
              </motion.div>
            </div>

            {/* Meta bar - compact chips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-1.5 text-[11px] font-medium text-white/95"
            >
              <div className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-200 hover:bg-white/25">
                <Star className="h-3 w-3 fill-white/80 text-white" />
                <span className="whitespace-nowrap">
                  {average}/5 <span className="text-white/70">({totalReviews})</span>
                </span>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-200 hover:bg-white/25">
                <Clock className="h-3 w-3 text-white" />
                <span className="whitespace-nowrap">3 min</span>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-200 hover:bg-white/25 max-md:hidden">
                <span className="whitespace-nowrap">🧪 Démo</span>
              </div>
            </motion.div>

            {/* Progress dots */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="flex items-center gap-1"
            >
              {[1, 2, 3].map((step, idx) => (
                <div
                  key={step}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === 0 ? "w-6 bg-white/40" : "w-1 bg-white/20"
                  }`}
                />
              ))}
              <span className="ml-1.5 text-[10px] text-white/70">1/3</span>
            </motion.div>

            {/* Action zone */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="flex flex-wrap items-center gap-2 mt-1"
            >
              <Link
                href="/demo/clinical-case"
                onClick={(event) => {
                  event.preventDefault();
                  onLaunchDemo?.();
                }}
                className="group/button relative inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2 text-[12px] font-semibold text-[#F8589F] shadow-md shadow-white/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/30 focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-2 focus:ring-offset-[#F8589F]"
              >
                Lancer la démo
                <svg
                  className="h-3 w-3 transition-transform duration-200 group-hover/button:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>

              <button className="inline-flex items-center gap-1 text-[11px] font-medium text-white/90 underline decoration-white/40 underline-offset-2 transition-all duration-200 hover:text-white hover:decoration-white/80 focus:outline-none focus:ring-2 focus:ring-white/80 focus:rounded px-2 py-1">
                En savoir plus
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LockedFeatureCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-[#F7C7DD] dark:border-[#F8589F]/30 bg-gradient-to-br from-white to-[#FFF5FA] dark:from-[#1a1a1a] dark:to-[#2a1a2a] p-6 shadow-sm dark:shadow-[0px_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-[#F8589F]/40 hover:shadow-md"
  >
    <div className="relative z-10 flex flex-col items-center gap-3 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F8589F]/20 to-[#FD2E8A]/20 dark:from-[#F8589F]/30 dark:to-[#FD2E8A]/30"
      >
        <Lock className="h-6 w-6 text-[#F8589F]" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-1.5"
      >
        <h3 className="text-base font-semibold text-[#7A1D4A] dark:text-[#FFB3D9]">
          Réservé aux abonnements Alpha
        </h3>
        <p className="max-w-md text-[13px] leading-relaxed text-[#9A4E7A]/80 dark:text-gray-400">
          Contactez l&apos;équipe pour rejoindre le programme Labs.
        </p>
      </motion.div>
    </div>

    {/* Decorative elements */}
    <div className="absolute -left-8 -top-8 h-20 w-20 rounded-full bg-[#F8589F]/5 dark:bg-[#F8589F]/10 blur-2xl" />
    <div className="absolute -bottom-8 -right-8 h-20 w-20 rounded-full bg-[#FD2E8A]/5 dark:bg-[#FD2E8A]/10 blur-2xl" />
  </motion.div>
);

const ErrorCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="rounded-2xl border border-[#F8AFCB] dark:border-red-900/50 bg-gradient-to-br from-white to-[#FFF5F5] dark:from-[#1a1a1a] dark:to-[#2a1a1a] p-6 text-center shadow-sm dark:shadow-[0px_2px_8px_rgba(0,0,0,0.3)]"
  >
    <div className="flex flex-col items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B91C1C]/10 dark:bg-red-900/30">
        <svg
          className="h-5 w-5 text-[#B91C1C] dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-[13px] font-medium text-[#B91C1C] dark:text-red-400">
        Impossible de charger les données. Réessayez plus tard.
      </p>
    </div>
  </motion.div>
);

export default function LabsPage() {
  const router = useRouter();
  const { data: subscription, isLoading: isSubscriptionLoading } =
    useUserSubscription();

  const isAlphaSubscriber = Boolean(subscription?.plan?.is_alpha);
  const [showXpExplanation, setShowXpExplanation] = useState(false);

  const handleLaunchDemo = useCallback(() => {
    setShowXpExplanation(true);
  }, []);

  const handleXpModalClose = useCallback(() => {
    setShowXpExplanation(false);
  }, []);

  const handleXpModalStart = useCallback(() => {
    setShowXpExplanation(false);
    router.push("/demo/clinical-case");
  }, [router]);

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useQuery({
    queryKey: ["clinicalCaseFeedbackSummary", CLINICAL_CASE_DEMO_ID],
    queryFn: fetchClinicalCaseSummary,
    enabled: isAlphaSubscriber,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const isLoading =
    isSubscriptionLoading || (isAlphaSubscriber && isSummaryLoading);

  const content = useMemo(() => {
    if (!isAlphaSubscriber && !isSubscriptionLoading) {
      return <LockedFeatureCard />;
    }

    if (isSummaryError) {
      return <ErrorCard />;
    }

    return <AlphaFeatureCard summary={summary} onLaunchDemo={handleLaunchDemo} />;
  }, [
    handleLaunchDemo,
    isAlphaSubscriber,
    isSubscriptionLoading,
    isSummaryError,
    summary,
  ]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0a0a0a] pb-10">
      <div className="px-5 py-6 max-md:px-[20px] max-md:pt-4">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex flex-col gap-1.5"
        >
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#FD2E8A]">
            <Sparkles className="h-3 w-3" />
            Programme Labs
          </span>
          <h1 className="text-2xl font-semibold leading-tight text-[#191919] dark:text-white max-md:text-xl">
            Fonctions Alpha en avant-première
          </h1>
          <p className="max-w-2xl text-[12px] leading-relaxed text-[#5F6676] dark:text-gray-400">
            Expérimentez nos prototypes et partagez vos retours.
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.section
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-5"
            >
              <LabsSkeleton />
            </motion.section>
          ) : (
            <motion.section
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-5"
            >
              {content}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {isAlphaSubscriber ? (
        <AlphaXpExplanationModal
          open={showXpExplanation}
          onClose={handleXpModalClose}
          onStart={handleXpModalStart}
          featureName="Cas clinique interactif"
        />
      ) : null}
    </div>
  );
}
