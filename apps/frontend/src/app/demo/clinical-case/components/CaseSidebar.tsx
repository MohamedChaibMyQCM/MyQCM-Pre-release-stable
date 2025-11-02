"use client";

import { motion } from "framer-motion";
import { BookOpenText, Bookmark, Tag } from "lucide-react";
import { ComponentType, SVGProps, ReactNode } from "react";
import { COLORS } from "../ui/colors";

type CaseSidebarProps = {
  title: string;
  scenario: string;
  objectives: string[];
  meta?: string[];
};

const Pill = ({ children }: { children: ReactNode }) => (
  <span
    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
    style={{
      borderColor: "rgba(248, 88, 159, 0.18)",
      background: "rgba(248, 88, 159, 0.08)",
      color: COLORS.primaryDark,
    }}
  >
    {children}
  </span>
);

const SidebarSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
}) => (
  <section
    className="rounded-2xl border p-4 max-md:p-3"
    style={{
      background: "rgba(255, 255, 255, 0.92)",
      borderColor: "rgba(248, 88, 159, 0.12)",
    }}
  >
    <div
      className="mb-2 inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] max-md:text-[9px] max-md:px-2 max-md:py-0.5"
      style={{
        color: COLORS.primaryDark,
        background: "rgba(248, 88, 159, 0.12)",
        border: "1px solid rgba(248, 88, 159, 0.18)",
      }}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 max-md:h-3 max-md:w-3" style={{ color: COLORS.primary }} /> : null}
      {title}
    </div>
    {children}
  </section>
);

export const CaseSidebar = ({
  title,
  scenario,
  objectives,
  meta = [],
}: CaseSidebarProps) => {
  const displayMeta = Array.from(new Set(meta.filter(Boolean)));
  return (
    <aside className="w-full max-w-full lg:max-w-[360px] xl:max-w-[380px] lg:sticky lg:top-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[20px] border px-6 py-6 max-md:px-4 max-md:py-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
        style={{
          background: "#FFFFFF",
          borderColor: "#F0E4EC",
          scrollbarGutter: "stable",
        }}
      >
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.24em] max-md:text-[9px]"
          style={{ color: COLORS.primaryDark }}
        >
          Rappel du cas
        </div>
        <h2
          className="mt-2 text-[18px] font-semibold leading-snug md:text-[20px] max-md:text-[16px]"
          style={{ color: COLORS.text }}
        >
          {title}
        </h2>

        {displayMeta.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2.5 max-md:gap-2">
            {displayMeta.map((chip) => (
              <Pill key={chip}>
                <Tag className="h-3.5 w-3.5 -translate-y-[1px] max-md:h-3 max-md:w-3" style={{ color: COLORS.primary }} />
                {chip}
              </Pill>
            ))}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 max-md:mt-4 max-md:gap-3">
          <SidebarSection title="Scenario" icon={BookOpenText}>
            <p className="text-[13px] leading-relaxed text-[#5F6676] max-md:text-[12px]">
              {scenario}
            </p>
          </SidebarSection>

          {objectives.length > 0 ? (
            <SidebarSection title="Objectifs" icon={Bookmark}>
              <ul
                className="space-y-1.5 text-[13px] leading-relaxed text-[#5F6676] max-md:text-[12px] max-md:space-y-1"
              >
                {objectives.map((objective) => (
                  <li key={objective} className="ml-5 list-disc">
                    {objective}
                  </li>
                ))}
              </ul>
            </SidebarSection>
          ) : null}
        </div>
      </motion.div>
    </aside>
  );
};
