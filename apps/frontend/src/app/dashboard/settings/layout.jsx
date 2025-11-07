"use client";

import Dash_Header from "@/components/dashboard/Dash_Header";
import Settings_Links from "@/components/dashboard/settings/Settings_Links";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const Layout = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="bg-background pb-8 min-h-screen">
      <motion.div
        className="max-md:hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Dash_Header path={"/Settings"} sub_path={"/Profile Info"} />
      </motion.div>
      <Settings_Links />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Layout;
