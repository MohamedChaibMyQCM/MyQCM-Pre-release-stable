"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Progress_Links = ({ rightContent = null }) => {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/progress", label: "Progression" },
    { href: "/dashboard/progress/summary", label: "Résumé" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 md:mt-6 px-4 md:px-5 max-md:mt-2">
      <ul className="flex flex-wrap items-center gap-2 md:gap-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${
                  isActive
                    ? "bg-[#F8589F] text-[#FFFFFF]"
                    : "bg-[#FFFFFF] dark:bg-[#1a1a1a] text-[#191919] dark:text-white"
                } px-3 md:px-4 py-1.5 md:py-2 rounded-[20px] text-[12px] md:text-[13px] font-[500] box border border-transparent dark:border-gray-700 whitespace-nowrap`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      {rightContent ? (
        <div className="flex flex-wrap items-center gap-2 md:gap-3">{rightContent}</div>
      ) : null}
    </div>
  );
};

export default Progress_Links;
