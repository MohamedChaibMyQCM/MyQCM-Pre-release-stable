"use client";

import { motion } from "framer-motion";
import { Clock3, Gauge, ListChecks, Tag as TagIcon } from "lucide-react";
import { ComponentType, SVGProps, memo, useMemo } from "react";
import { Button } from "../ui/Button";
import { COLORS } from "../ui/colors";

type CaseIntroCardProps = {
  title: string;
  description: string;
  scenario: string;
  objectives: string[];
  tags?: string[];
  author?: string;
  facultyType?: string;
  yearOfStudy?: string;
  promo?: number | null;
  totalQuestions: number;
  initialQuestionMeta?: {
    type?: string;
    difficulty?: string;
    estimated_time?: number;
  };
  onStart: () => void;
  onDefer?: () => void;
};

const difficultyBadge = (value?: string) => {
  switch (value?.toLowerCase()) {
    case "easy":
      return { label: "Facile", bg: "#E5F5EC", color: "#0F9D58" };
    case "hard":
      return { label: "Difficile", bg: "#FEECEC", color: "#B91C1C" };
    default:
      return { label: "Moyen", bg: "#FFF7E1", color: "#B45309" };
  }
};

const normalizeLabel = (value?: string) =>
  value ? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : undefined;

const formatDuration = (seconds?: number) => {
  const total = Math.max(0, Math.round(seconds ?? 0));
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
};

const MetaChip = ({
  icon: Icon,
  label,
  tone = "default",
  title,
}: {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  tone?: "default" | "brand" | "support";
  title?: string;
}) => {
  const palette: Record<"default" | "brand" | "support", { bg: string; border: string; color: string }> = {
    default: { bg: "#FFFFFF", border: "#F0E4EC", color: "#4F4553" },
    brand: { bg: "#FFF5FA", border: "#F0E4EC", color: "#FD2E8A" },
    support: { bg: "#FFF7E1", border: "#F9E7B4", color: "#B45309" },
  };

  const token = palette[tone];

  return (
    <span
      className="inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[12px] font-semibold uppercase tracking-[0.14em]"
      title={title ?? label}
      style={{ background: token.bg, border: `1px solid ${token.border}`, color: token.color }}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" style={{ color: token.color }} aria-hidden /> : null}
      <span className="truncate">{label}</span>
    </span>
  );
};

const TAG_PALETTE = [
  { from: "#FFF0F6", to: "#FFE8F2", border: "#F8CFE3", text: "#8A2C5B" },
  { from: "#F2F9FF", to: "#EAF4FF", border: "#CFE4FD", text: "#154B7D" },
  { from: "#F3FFF6", to: "#ECFFF3", border: "#CFEFDA", text: "#176C3E" },
  { from: "#FFF9EC", to: "#FFF4DE", border: "#F9E7B4", text: "#8C5A0A" },
  { from: "#F7F2FF", to: "#F2ECFF", border: "#E0D6FB", text: "#5B3FB1" },
  { from: "#ECFEFF", to: "#E6FBFD", border: "#C8EFF3", text: "#0F6A73" },
];

const TagPill = memo(({ text, index }: { text: string; index: number }) => {
  const palette = TAG_PALETTE[index % TAG_PALETTE.length];
  return (
    <span
      className="inline-flex h-8 items-center gap-2 rounded-full px-3 text-[12px] font-medium tracking-[0.04em] shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-all hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      style={{
        background: `linear-gradient(180deg, ${palette.from}, ${palette.to})`,
        border: `1px solid ${palette.border}`,
        color: palette.text,
      }}
      tabIndex={0}
      role="listitem"
      aria-label={text}
    >
      <span className="inline-block h-[6px] w-[6px] rounded-full" style={{ background: palette.text }} aria-hidden />
      <span className="truncate">{text}</span>
    </span>
  );
});
TagPill.displayName = "TagPill";

export const CaseIntroCard = ({
  title,
  description,
  scenario,
  objectives,
  tags,
  author,
  facultyType,
  yearOfStudy,
  promo,
  totalQuestions,
  initialQuestionMeta,
  onStart,
  onDefer,
}: CaseIntroCardProps) => {
  const typeLabel = initialQuestionMeta?.type ? initialQuestionMeta.type.toUpperCase() : "QCM";
  const estimatedTime = initialQuestionMeta?.estimated_time ?? 90;
  const difficultyMeta = difficultyBadge(initialQuestionMeta?.difficulty);

  const fallbackTags = useMemo(() => {
    return [
      author,
      normalizeLabel(facultyType),
      normalizeLabel(yearOfStudy),
      promo ? `Promo ${promo}` : undefined,
    ]
      .filter(Boolean)
      .map((item) => item as string);
  }, [author, facultyType, promo, yearOfStudy]);

  const displayTags = useMemo(() => {
    const normalized = (tags ?? [])
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    return normalized.length > 0 ? Array.from(new Set(normalized)) : fallbackTags;
  }, [fallbackTags, tags]);

  const progressCurrent = totalQuestions > 0 ? 1 : 0;
  const progressWidth = totalQuestions > 0 ? Math.min(100, (progressCurrent / totalQuestions) * 100) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-4xl rounded-[20px] border bg-white shadow-[0_24px_55px_-38px_rgba(248,88,159,0.55)] xl:max-w-5xl"
      style={{ borderColor: "#F0E4EC" }}
    >
      <div className="px-6 py-8 md:px-12 md:py-10 xl:px-16">
        <header className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
            <div className="flex flex-wrap items-center gap-[18px] md:gap-6">
              <MetaChip icon={ListChecks} label={typeLabel} tone="default" title="Type de questionnaire" />
              <MetaChip icon={Gauge} label={difficultyMeta.label} tone="support" title="Difficulte" />
              <MetaChip
                icon={Clock3}
                label={`Lecture estimee : ~${formatDuration(estimatedTime)}`}
                tone="brand"
                title="Temps estime"
              />
            </div>
            <div className="flex items-center gap-1 text-[12px] font-semibold text-[#858494]" aria-live="polite">
              <span>CAS</span>
              <span className="text-[#191919]">{progressCurrent}</span>
              <span className="text-[#B0B4C2]">/</span>
              <span>{totalQuestions || "?"}</span>
            </div>
          </div>

          <div
            className="relative mt-3 h-[3px] w-full overflow-hidden rounded-full bg-[#F0E4EC]"
            role="progressbar"
            aria-label="Progression du cas"
            aria-valuemin={0}
            aria-valuemax={totalQuestions || 1}
            aria-valuenow={progressCurrent}
          >
            <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progressWidth}%`, background: COLORS.gradient }} />
          </div>
        </header>

        <div className="mt-10 md:mt-12" />

        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: "#FD2E8A" }}>
            Cas clinique premium
          </span>
          <h1 className="font-semibold leading-tight text-[#1F1F1F]" style={{ fontSize: "clamp(24px, 2.2vw, 32px)" }}>
            {title}
          </h1>
          <p className="max-w-[72ch] text-[14px] leading-7 text-[#2F2A3A] md:text-[15px] md:leading-8">{description}</p>
        </div>

        {displayTags.length > 0 ? (
          <section className="mt-6">
            <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#88436F]">
              <TagIcon className="h-4 w-4" />
              <span className="uppercase tracking-[0.18em]">Mots-cles</span>
            </div>
            <ul role="list" className="flex flex-wrap items-center gap-x-4 gap-y-3 md:gap-x-5">
              {displayTags.map((chip, index) => (
                <li key={`${chip}-${index}`}>
                  <TagPill text={chip} index={index} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-10">
          <div className="space-y-2">
            <h2 className="text-[15px] font-semibold text-[#2A2535]">Scenario clinique</h2>
            <p className="max-w-[72ch] text-[14px] leading-7 text-[#2F2A3A]">{scenario}</p>
          </div>

          {objectives?.length ? (
            <div className="mt-10 space-y-3 md:mt-12">
              <h2 className="text-[15px] font-semibold text-[#2A2535]">Objectifs pedagogiques</h2>
              <ul className="max-w-[72ch] space-y-2.5 text-[14px] leading-7 text-[#2F2A3A]">
                {objectives.map((objective, index) => (
                  <li key={`${index}-${objective.slice(0, 24)}`} className="relative pl-6">
                    <span className="absolute left-0 top-[10px] h-[6px] w-[6px] rounded-full" style={{ background: "#FD2E8A" }} />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      <footer
        className="flex flex-wrap items-center justify-between gap-4 border-t px-6 py-5 md:px-12 xl:px-16"
        style={{ borderColor: "#F0E4EC" }}
      >
        <div className="flex flex-1 items-center justify-end gap-3 text-[12px] text-[#333A48]">
          <span>
            {totalQuestions} question{totalQuestions > 1 ? "s" : ""} a valider pour finaliser le cas.
          </span>

          {typeof onDefer === "function" ? (
            <Button
              size="md"
              variant="secondary"
              onClick={onDefer}
              className="hidden border border-[#F0E4EC] text-[#7A1D4A] md:inline-flex"
            >
              Lire plus tard
            </Button>
          ) : null}

          <div className="md:contents">
            <Button
              size="md"
              onClick={onStart}
              className="md:static md:translate-y-0 max-md:fixed max-md:bottom-[max(16px,env(safe-area-inset-bottom))] max-md:left-4 max-md:right-4 max-md:z-10 max-md:justify-center"
            >
              Commencer le cas
            </Button>
          </div>
        </div>
      </footer>
    </motion.section>
  );
};
