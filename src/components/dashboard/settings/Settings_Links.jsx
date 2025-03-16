"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

const Settings_Links = () => {
  const pathname = usePathname(); 

  const links = [
    { href: "/dashboard/settings", label: "Profile info" },
    { href: "/dashboard/settings/change-password", label: "Change password" },
    { href: "/dashboard/settings/question-bank", label: "Question bank" },
    { href: "/dashboard/settings/notification", label: "Notification" },
  ];

  return (
    <ul className="flex items-center gap-4 px-5 mt-6">
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
              }  px-4 py-2 rounded-[20px] text-[13px] font-[500] box`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default Settings_Links;