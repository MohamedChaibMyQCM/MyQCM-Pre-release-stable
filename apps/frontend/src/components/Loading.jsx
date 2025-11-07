"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import logo from "../../public/logoMyqcm.svg";
import logoDark from "../../public/logoMyqcm-dark.svg";

const Loading = () => {
  const { theme } = useTheme();

  return (
    <div className="absolute h-[100%] w-[100%] top-0 left-0 bg-background flex items-center justify-center z-[1000]">
      <div className="animate-pulse">
        <Image
          src={theme === "dark" ? logoDark : logo}
          alt="logo"
          width={160}
          height={160}
          className="w-[160px] h-auto"
          priority
        />
      </div>
    </div>
  );
};

export default Loading;
