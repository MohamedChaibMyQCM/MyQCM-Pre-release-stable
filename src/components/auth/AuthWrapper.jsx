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

  useEffect(() => {
    const checkAuth = () => {
      if (!secureLocalStorage.getItem("token")) {
        setLoading(false);
        router.push(`/${locale}/login`);
        toast.error("You need to login");
        return;
      }
      try {
        const response = BaseUrl.get("/user");
        setAuth(true);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        const status = error.response?.status;
        const message = error.response?.data?.message;
        if (status === 400 && message === "Email not verified") {
          router.push(`/${locale}/signup/verification`);
          toast.error("Verify your email");
        } else if (status === 400 && message === "User profile not found") {
          router.push(`/${locale}/signup/setProfile`);
          toast.error("Set up your profile");
        } else {
          console.error("Authentication error:", error);
        }
      }
    };

    checkAuth();
  }, [auth]);

  if (loading) return <Loading />;
  if (auth) return <>{children}</>;
  return null;
};

export default AuthWrapper;