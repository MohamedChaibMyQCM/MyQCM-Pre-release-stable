"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleHelp,
  RefreshCw,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { KPI } from "../ui/KPI";
import { RingProgress } from "../ui/RingProgress";
import { COLORS } from "../ui/colors";

type CompletionStats = {
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
};

type CaseCompletionCardProps = {
  onReplay: () => void;
  onAnalyse?: () => void;
  onNextCase?: () => void;
  onExit: () => void;
  stats: CompletionStats;
};

const resolveHeadline = (accuracy: number) => {
  if (accuracy >= 80) {
    return {
      title: "Excellent !",
      sub: "Solide maitrise. Passez au cas suivant ou consolidez vos acquis.",
    };
  }

  if (accuracy >= 60) {
    return {
      title: "Continuez vos efforts !",
      sub: "Analysez vos reponses puis rejouez pour consolider vos connaissances.",
    };
  }

  return {
    title: "Ne lachez pas",
    sub: "Revisez les points cles et retentez le cas pour progresser.",
  };
};

export const CaseCompletionCard = ({
  onReplay,
  onAnalyse,
  onNextCase,
  onExit,
  stats,
}: CaseCompletionCardProps) => {
  const { title, sub } = resolveHeadline(stats.accuracy);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-4xl rounded-[26px] border px-6 py-6 shadow-[0_24px_60px_-40px_rgba(248,88,159,0.55)] md:px-9 md:py-8"
      style={{
        background: "rgba(255, 253, 250, 0.96)",
        borderColor: "rgba(248, 88, 159, 0.16)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(248, 88, 159, 0.12)" }}
        >
          <Trophy className="h-6 w-6" style={{ color: COLORS.primary }} />
        </div>
        <div className="flex-1">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.24em]"
            style={{ color: COLORS.primaryDark }}
          >
            Resultats du cas clinique
          </div>
          <h2
            className="mt-2 text-[24px] font-semibold leading-tight md:text-[26px]"
            style={{ color: COLORS.text }}
          >
            {title}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#565D6D]">
            {sub}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div
          className="flex items-center gap-5 rounded-2xl border px-5 py-5"
          style={{
            borderColor: "rgba(248, 88, 159, 0.12)",
            background: COLORS.white,
          }}
        >
          <RingProgress size={110} stroke={9} value={stats.accuracy} />
          <div>
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: COLORS.textMuted }}
            >
              Taux de reussite
            </div>
            <div
              className="mt-1 text-3xl font-semibold"
              style={{ color: COLORS.text }}
            >
              {stats.accuracy} %
            </div>
            <div className="mt-1 text-[13px] text-[#5F6676]">
              {stats.correct} / {stats.total} reponses correctes
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <KPI
            icon={CheckCircle2}
            label="Reponses correctes"
            value={`${stats.correct} / ${stats.total}`}
            tone="success"
          />
          <KPI
            icon={XCircle}
            label="Reponses incorrectes"
            value={stats.incorrect}
            tone="danger"
          />
          <KPI
            icon={CircleHelp}
            label="Questions passees"
            value={stats.skipped}
            tone="warning"
          />
          <KPI
            icon={BarChart3}
            label="Score global"
            value={`${stats.accuracy}%`}
            tone="neutral"
          />
        </div>
      </div>

      <div
        className="mt-6 rounded-2xl p-4"
        style={{
          background: "rgba(248, 88, 159, 0.08)",
          border: "1px solid rgba(248, 88, 159, 0.16)",
        }}
      >
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: COLORS.textMuted }}
        >
          Cas clinique
        </div>
        <div className="mt-1 text-[13px] text-[#5F6676]">
          {stats.total} question{stats.total > 1 ? "s" : ""} traitee
          {stats.total > 1 ? "s" : ""}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button size="sm" variant="primary" icon={RotateCcw} onClick={onReplay}>
          Rejouer le cas
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={BarChart3}
          onClick={onAnalyse}
          disabled={!onAnalyse}
        >
          Analyser mes reponses
        </Button>
        <Button
          size="sm"
          variant="ghost"
          rightIcon={ArrowRight}
          onClick={onNextCase}
          disabled={!onNextCase}
        >
          Prochain cas
        </Button>
        <div className="ml-auto">
          <Button
            size="sm"
            variant="primary"
            icon={RefreshCw}
            onClick={onExit}
          >
            Aller au tableau de bord
          </Button>
        </div>
      </div>
    </motion.section>
  );
};
