"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import logo from "../../../public/logoMyqcm.svg";
import Loading from "@/components/Loading";

const GoogleRedirectContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      secureLocalStorage.setItem("token", token);
      router.push(`/dashboard`);
    }
  }, [searchParams, router]);

  return (
    <div className="h-screen w-screen flex items-center justify-center animate-pulse">
      <Image src={logo} alt="logo" />
    </div>
  );
};

const GoogleRedirect = () => {
  return (
    <Suspense fallback={<Loading />}>
      <GoogleRedirectContent />
    </Suspense>
  );
};

export default GoogleRedirect;
