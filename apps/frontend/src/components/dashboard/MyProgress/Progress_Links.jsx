"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import calender from "../../../../public/Icons/calender.svg";
import Image from "next/image";
import { SlidersHorizontal } from "phosphor-react";

const Progress_Links = () => {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/progress", label: "Progression" },
    { href: "/dashboard/progress/summary", label: "Résumé" },
  ];

  return (
    <div
      className="flex items-center justify-between mt-6 px-5 max-md:mt-0"
    >
      <ul className="flex items-center gap-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${
                  isActive
                    ? "bg-[#F8589F] text-[#FFFFFF]"
                    : "bg-[#FFFFFF] text-[#191919]"
                } px-4 py-2 rounded-[20px] text-[13px] font-[500] box`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      {/* <div className="flex items-center gap-3 cursor-pointer">
        <div className="bg-[#FFFFFF] px-4 py-2 rounded-[20px]">
          <Image src={calender} alt="calendrier" />
        </div>

        <div className="font-[500] text-[#191919] bg-[#FFFFFF] px-4 py-2 text-[14px] rounded-[20px]">
          <span className="max-md:hidden">Tous les modules</span>
          <SlidersHorizontal size={20} className="md:hidden" />
        </div>
      </div> */}
    </div>
  );
};

export default Progress_Links;
