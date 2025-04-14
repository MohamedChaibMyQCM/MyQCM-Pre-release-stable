"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Settings_Links = () => {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/settings", label: "Informations du profil" },
    {
      href: "/dashboard/settings/change-password",
      label: "Changer le mot de passe",
    },
    {
      // This is the link we need special handling for
      href: "/dashboard/settings/upgrade-account",
      label: "Mettre à niveau le compte",
    },
    { href: "/dashboard/settings/question-bank", label: "Banque de questions" },
    { href: "/dashboard/settings/notification", label: "Notifications" },
  ];

  // Base path for the section that needs sub-route matching
  const upgradeAccountBasePath = "/dashboard/settings/upgrade-account";

  return (
    // --- Keeping EXACT original outer div classes ---
    <div className="px-5 mt-6 max-md:overflow-x-auto scrollbar-hide max-md:py-6 max-md:mt-6">
      {/* --- Keeping EXACT original ul classes --- */}
      <ul className="flex items-center gap-4 w-max">
        {links.map((link) => {
          // --- START: MODIFIED ACTIVE STATE LOGIC ---
          let isActive;
          // Check if the current link's href is the one requiring sub-route matching
          if (link.href === upgradeAccountBasePath) {
            // Use startsWith() for this specific link
            isActive = pathname.startsWith(link.href);
          } else {
            // Use exact match for all other links
            isActive = pathname === link.href;
          }
          // --- END: MODIFIED ACTIVE STATE LOGIC ---

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                // --- Keeping EXACT original className logic and classes ---
                className={`${
                  isActive
                    ? "bg-[#F8589F] text-[#FFFFFF]" // Original active style
                    : "bg-[#FFFFFF] text-[#191919]" // Original inactive style
                } px-4 py-2 rounded-[20px] text-[13px] font-[500] box whitespace-nowrap`} // Original common styles
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
