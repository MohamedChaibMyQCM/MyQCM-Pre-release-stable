"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  CircleHelp,
  BarChart3,
  Trophy,
  RotateCcw,
  Home,
  Share2,
} from "lucide-react";
import RingProgress from "./RingProgress";
import QuizKPI from "./QuizKPI";

const QuizResult = ({ data, length }) => {
  const { category } = useParams();

  const totalQuestions = data.total_mcqs || length;
  const correctAnswers = data.mcqs_success || 0;
  const incorrectAnswers = data.mcqs_failed || 0;
  const skippedQuestions = data.mcqs_skipped || 0;
  const accuracy = data.accuracy || 0;

  // Function to get dynamic message based on performance
  const resolveHeadline = (accuracy) => {
    if (accuracy >= 80) {
      return {
        title: "Excellent !",
        sub: "Solide maîtrise. Continuez sur cette lancée ou passez au module suivant.",
      };
    }

    if (accuracy >= 60) {
      return {
        title: "Continuez vos efforts !",
        sub: "Bon travail ! Analysez vos réponses pour consolider vos connaissances.",
      };
    }

    return {
      title: "Ne lâchez pas !",
      sub: "Révisez les points clés et retentez pour progresser davantage.",
    };
  };

  const { title, sub } = resolveHeadline(accuracy);

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto max-md:items-start max-md:pt-8">
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18, scale: 0.96 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-3xl rounded-[26px] border border-border bg-card px-6 py-6 shadow-[0_24px_60px_-40px_rgba(248,88,159,0.55)] dark:shadow-[0_24px_60px_-40px_rgba(248,88,159,0.35)] md:px-9 md:py-8 max-md:max-w-[96%] max-md:my-6"
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <motion.div
            className="rounded-xl p-3 bg-primary/10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
          >
            <Trophy className="h-6 w-6 text-primary" />
          </motion.div>
          <div className="flex-1">
            <motion.div
              className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Résultats de la session
            </motion.div>
            <motion.h2
              className="mt-2 text-[24px] font-semibold leading-tight md:text-[26px] text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {title}
            </motion.h2>
            <motion.p
              className="mt-2 text-[13px] leading-relaxed text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {sub}
            </motion.p>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.6,
              },
            },
          }}
        >
          {/* Ring Progress Card */}
          <motion.div
            className="flex items-center gap-5 rounded-2xl border border-border bg-background px-5 py-5"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 12px 30px rgba(248, 88, 159, 0.15)",
              transition: { duration: 0.2 },
            }}
          >
            <RingProgress size={110} stroke={9} value={accuracy} />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Taux de réussite
              </div>
              <div className="mt-1 text-3xl font-semibold text-foreground">
                {Math.round(accuracy)} %
              </div>
              <div className="mt-1 text-[13px] text-muted-foreground">
                {correctAnswers} / {totalQuestions} réponses correctes
              </div>
            </div>
          </motion.div>

          {/* KPI Grid */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
          >
            <QuizKPI
              icon={CheckCircle2}
              label="Réponses correctes"
              value={`${correctAnswers} / ${totalQuestions}`}
              tone="success"
            />
            <QuizKPI
              icon={XCircle}
              label="Réponses incorrectes"
              value={incorrectAnswers}
              tone="danger"
            />
            <QuizKPI
              icon={CircleHelp}
              label="Questions passées"
              value={skippedQuestions}
              tone="warning"
            />
            <QuizKPI
              icon={BarChart3}
              label="Score global"
              value={`${Math.round(accuracy)}%`}
              tone="neutral"
            />
          </motion.div>
        </motion.div>

        {/* Session Info */}
        <motion.div
          className="mt-6 rounded-2xl p-4 bg-primary/10 border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Session d&apos;entraînement
          </div>
          <div className="mt-1 text-[13px] text-muted-foreground">
            {totalQuestions} question{totalQuestions > 1 ? "s" : ""} traitée
            {totalQuestions > 1 ? "s" : ""}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="mt-6 flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <motion.button
            className="flex items-center gap-2 rounded-[28px] bg-gradient-to-r from-[#F8589F] to-[#FF3D88] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all disabled:opacity-50 max-md:flex-1"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(248, 88, 159, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="h-4 w-4" />
            Recommencer
          </motion.button>

          <motion.button
            className="flex items-center gap-2 rounded-[28px] border-2 border-primary bg-card px-5 py-2.5 text-[13px] font-semibold text-primary transition-all hover:bg-primary/10 max-md:flex-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="h-4 w-4" />
            Partager
          </motion.button>

          <div className="ml-auto max-md:ml-0 max-md:w-full">
            <Link href="/dashboard/question-bank">
              <motion.button
                className="flex w-full items-center justify-center gap-2 rounded-[28px] bg-gradient-to-r from-[#F8589F] to-[#FF3D88] px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(248, 88, 159, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="h-4 w-4" />
                Tableau de bord
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default QuizResult;
