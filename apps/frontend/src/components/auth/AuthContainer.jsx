"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const AuthContainer = ({ children }) => {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <div className="bg-[#FFFFFF] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6 max-xl:py-6">
      <Image
        src="/logoMyqcm.png"
        alt="logo"
        width={140}
        height={140}
        className="w-[140px] h-auto mb-4"
        priority
      />
      <div className="flex items-center justify-between bg-[#F7F3F6] w-[567.09px] p-[5px] rounded-[10px] max-md:w-[90%]">
        <Link
          href="/login"
          className={`py-[8px] ${
            isLogin
              ? "bg-[#FFFFFF] text-[#191919]"
              : "text-[#666666] hover:text-[#191919]"
          } font-semibold text-[14px] flex items-center justify-center basis-1/2 rounded-[10px] transition-all duration-200`}
        >
          Se connecter
        </Link>
        <Link
          href="/signup"
          className={`py-[8px] ${
            !isLogin
              ? "bg-[#FFFFFF] text-[#191919]"
              : "text-[#666666] hover:text-[#191919]"
          } font-semibold text-[14px] basis-1/2 flex items-center justify-center rounded-[10px] transition-all duration-200`}
        >
          Créer un compte
        </Link>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: isLogin ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isLogin ? -30 : 30 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full flex flex-col items-center"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthContainer;
