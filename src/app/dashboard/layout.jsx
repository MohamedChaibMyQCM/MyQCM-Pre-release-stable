"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import Aside from "@/components/dashboard/Aside";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

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
  console.log(userData);

  useEffect(() => {
    if (!token && !isLoading) {
      const timer = setTimeout(() => {
        if (!secureLocalStorage.getItem("token")) {
          toast.error("Session expired");
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
        toast.error("Unauthorized session.");
        router.push("/login");
      } else if (status === 403) {
        toast.error("Access Forbidden.");
        router.push("/waiting-list");
      } else {
        toast.error("Please login again.");
        router.push("/login");
      }
    }
  }, [isError, error, router]);

  useEffect(() => {
    if (isSuccess && userData) {
      if (userData?.data?.user_verified === false) {
        toast("You are in the waiting list!", {
          icon: "👏",
        });
        router.push("/waiting-list");
      }
    }
  }, [isSuccess, userData, router]);

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
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Loading />
    </div>
  );
}
