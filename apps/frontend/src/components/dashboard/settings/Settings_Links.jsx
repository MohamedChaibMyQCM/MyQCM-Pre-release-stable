"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const Settings_Links = () => {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/settings/personal-info", label: "Informations du profil" },
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
    { href: "/dashboard/settings/rewards-center", label: "Centre de Récompenses" },
    { href: "/dashboard/settings/notification", label: "Notifications" },
  ];

  // Base path for the section that needs sub-route matching
  const upgradeAccountBasePath = "/dashboard/settings/upgrade-account";

  return (
    <motion.div
      className="px-5 mt-6 max-xl:overflow-x-auto scrollbar-hide max-xl:py-4 max-md:pt-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <ul className="flex items-center gap-4 w-max">
        {links.map((link, index) => {
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
            <motion.li
              key={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href={link.href}
                className={`${
                  isActive
                    ? "bg-[#F8589F] text-[#FFFFFF] shadow-md" // Active style
                    : "bg-card text-card-foreground hover:shadow-sm border border-border" // Inactive style with dark mode
                } px-4 py-2 rounded-[20px] text-[13px] font-[500] box whitespace-nowrap transition-all duration-300`}
              >
                {link.label}
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
};

export default Settings_Links;
