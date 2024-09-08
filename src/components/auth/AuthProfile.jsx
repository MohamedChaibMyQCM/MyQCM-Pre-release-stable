"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { useLocale } from "next-intl";
import Loading from "../Loading";
import BaseUrl from "../BaseUrl";
import { toast } from "react-toastify";

const AuthProfile = (Component) => {
  return (props) => {
    const router = useRouter();
    const locale = useLocale();
    const [auth, setAuth] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    const checkAuth = async () => {
      if (!secureLocalStorage.getItem("token")) {
        setAuthLoading(false);
        router.push(`/${locale}/login`);
        toast.error("You need to login");
      } else {
        try {
          const response = await BaseUrl.get("/user");
          setAuth(true);
        } catch (error) {
          if (error.response?.data?.message === "Email not verified") {
            setAuthLoading(false);
            router.push(`/${locale}/signup/verification`);
            toast.error("Verify your email");
          } else {
            setAuthLoading(false);
            toast.error("An error occurred");
          }
        }
      }
    };

    useEffect(() => {
      checkAuth();
    }, [auth]);

    if (authLoading) return <Loading />;
    if (auth) return <Component {...props} />;
    return null;
  };
};

export default AuthProfile;