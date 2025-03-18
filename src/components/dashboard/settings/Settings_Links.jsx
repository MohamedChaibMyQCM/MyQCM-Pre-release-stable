"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Settings_Links = () => {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/settings", label: "Profile info" },
    { href: "/dashboard/settings/change-password", label: "Change password" },
    { href: "/dashboard/settings/upgrade-account", label: "Upgrade account" },
    { href: "/dashboard/settings/question-bank", label: "Question bank" },
    { href: "/dashboard/settings/notification", label: "Notification" },
  ];

  return (
    <div className="px-5 mt-6 max-md:overflow-x-auto scrollbar-hide max-md:py-6 max-md:mt-6">
      <ul className="flex items-center gap-4 w-max">
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
                } px-4 py-2 rounded-[20px] text-[13px] font-[500] box whitespace-nowrap`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Settings_Links;
