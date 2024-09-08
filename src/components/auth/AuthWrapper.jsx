"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import { useState, useEffect } from "react";
import Loading from "../Loading";
import BaseUrl from "../BaseUrl";
import { toast } from "react-toastify";

const AuthWrapper = ({ children }) => {
  const locale = useLocale();
  const router = useRouter();
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    if (!secureLocalStorage.getItem("token")) {
      setLoading(false);
      router.push(`/${locale}/login`);
      toast.error("You need to login");
      return;
    }
    try {
      const response = await BaseUrl.get("/user");
      setAuth(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.message === "Email not verified") {
        router.push(`/${locale}/signup/verification`);
        toast.error("Verify your email");
      } else if (error.response?.data?.message === "User profile not found") {
        router.push(`/${locale}/signup/setProfile`);
        toast.error("Set up your profile");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, [auth]);

  if (loading) return <Loading />;
  if (auth) return <>{children}</>;
  return null;
};

export default AuthWrapper;