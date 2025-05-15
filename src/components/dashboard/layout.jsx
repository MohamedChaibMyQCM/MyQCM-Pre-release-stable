"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import Aside from "@/components/dashboard/Aside";
import Loading from "@/components/Loading";
import Image from "next/image";
import Link from "next/link";
import mind from "../../../public/Home/mind.svg";

const fetchApiData = async (url) => {
  try {
    const token = secureLocalStorage.getItem("token");
    const response = await BaseUrl.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? secureLocalStorage.getItem("token") : null;

  const {
    data: userData,
    isLoading,
    isFetching,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["userMeAuthCheck", token],
    queryFn: () => fetchApiData("/user/me"),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!token && !isLoading) {
      const timer = setTimeout(() => {
        if (!secureLocalStorage.getItem("token")) {
          router.push("/login");
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [token, isLoading, router]);

  useEffect(() => {
    if (isError) {
      const status = error?.response?.status;
      secureLocalStorage.removeItem("token");

      if (status === 401) {
        router.push("/login");
      } else if (status === 403) {
        router.push("/waiting-list");
      } else {
        router.push("/login");
      }
    }
  }, [isError, error, router]);

  useEffect(() => {
    if (isSuccess && userData) {
      if (userData?.data?.user_verified === false) {
        router.push("/waiting-list");
      }
    }
  }, [isSuccess, userData, pathname, router]);

  const isAuthorized =
    isSuccess && userData && userData?.data?.user_verified !== false;

  const isSessionRoute = pathname?.includes(
    "/dashboard/question-bank/session/"
  );

  if ((isLoading || (isFetching && !isSuccess)) && !!token) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isAuthorized) {
    return (
      <main>
        {!userData?.data?.completed_introduction && (
          <div className="bg-[#00000040] fixed inset-0 w-full h-full z-[2000]">
            <div className="bg-white flex items-center justify-between px-[80px] py-[36px] rounded-b-[24px] max-md:px-[20px] max-md:flex-col max-md:gap-8">
              <div className="basis-[76%]">
                <h1 className="text-[28px] font-[500] text-[#191919] mb-2">
                  Welcome to <span className="text-[#F8589F]">MyQCM</span> Beta!
                </h1>
                <p className="text-[14px] text-[#666666]">
                  Thank you for joining our beta version! We&apos;re excited to
                  have you explore the platform, but please note that we&apos;re
                  still fine-tuning things. You might encounter some bugs or
                  unexpected issues along the way. Your feedback is invaluable
                  in helping us improve—feel free to share any thoughts or
                  report issues. Enjoy exploring! 🎉
                </p>
              </div>
              <div className="flex flex-col gap-5">
                <Image
                  src={mind}
                  alt="mind"
                  className="w-[130px] max-md:w-[150px]"
                />
                <Link
                  href="/onboarding"
                  className="scale_anim bg-[#F8589F] text-white rounded-[16px] px-[1px] text-center py-[6px] text-[14px] font-[500]"
                >
                  Understand
                </Link>
              </div>
            </div>
          </div>
        )}
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
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Loading />
    </div>
  );
}
