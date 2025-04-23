"use client"


import Aside from "@/components/dashboard/Aside";
import { usePathname } from "next/navigation";

const DashboardLayout = ({ children }) => {
  const pathname = usePathname();
  const isSessionRoute = pathname?.includes(
    "/dashboard/question-bank/session/"
  ); 

  return (
    <main className="">
      <Aside />
      <div
        className={`ml-[248px] max-md:ml-0 ${
          isSessionRoute ? "max-md:mt-0" : "max-md:mt-[70px]"
        } h-[100vh] max-xl:ml-0 bg-[#F7F8FA]`}
      >
        {children}
      </div>
    </main>
  );
};

export default DashboardLayout;
