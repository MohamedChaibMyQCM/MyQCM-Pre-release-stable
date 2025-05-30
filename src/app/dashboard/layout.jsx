"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import Aside from "@/components/dashboard/Aside";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import mind from "../../../public/Home/mind.avif";

const fetchApiData = async (url) => {
  try {
    const token = secureLocalStorage.getItem("token");
    const response = await BaseUrl.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(
      `API Fetch Error (${url}):`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setToken(secureLocalStorage.getItem("token"));
    }
  }, []);

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
    enabled: !!token && mounted,
    staleTime: 1000 * 30, // 30 seconds instead of 5 minutes
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60, // Refetch every minute
  });

  useEffect(() => {
    if (mounted && !token && !isLoading) {
      const timer = setTimeout(() => {
        if (!secureLocalStorage.getItem("token")) {
          toast.error("Session expirée");
          router.push("/login");
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [token, isLoading, router, mounted]);

  useEffect(() => {
    if (mounted && isError) {
      const status = error?.response?.status;
      secureLocalStorage.removeItem("token");

      if (status === 401) {
        toast.error("Session non autorisée.");
        router.push("/login");
      } else if (status === 403) {
        toast.error("Accès interdit.");
        router.push("/waiting-list");
      } else {
        toast.error("Veuillez vous reconnecter.");
        router.push("/login");
      }
    }
  }, [isError, error, router, mounted]);

  const isSessionRoute = pathname?.includes(
    "/dashboard/question-bank/session/"
  );

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if ((isLoading || (isFetching && !isSuccess)) && !!token) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <main>
      {userData?.data && !userData.data.completed_introduction && (
        <div className="bg-[#00000040] fixed inset-0 w-full h-full z-[2000]">
          <div className="bg-white flex items-center justify-between px-[80px] py-[36px] rounded-b-[24px] max-md:px-[20px] max-md:flex-col max-md:gap-8">
            <div className="basis-[76%]">
              <h1 className="text-[28px] font-[500] text-[#191919] mb-2">
                Bienvenue sur <span className="text-[#F8589F]">MyQCM</span>{" "}
                Beta!
              </h1>
              <p className="text-[14px] text-[#666666]">
                Merci de rejoindre notre version bêta ! Nous sommes ravis de
                vous voir explorer la plateforme, mais veuillez noter que nous
                peaufinons encore les choses. Vous pourriez rencontrer quelques
                bugs ou problèmes inattendus en cours de route. Vos commentaires
                sont précieux pour nous aider à améliorer—n&apos;hésitez pas à
                partager vos réflexions ou signaler des problèmes. Bon
                exploration ! 🎉
              </p>
            </div>
            <div className="flex flex-col gap-5">
              <Image
                src={mind}
                alt="esprit"
                className="w-[130px] max-md:w-[150px]"
              />
              <Link
                href="/onboarding"
                className="scale_anim bg-[#F8589F] text-white rounded-[16px] px-[1px] text-center py-[6px] text-[14px] font-[500]"
              >
                Comprendre
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
