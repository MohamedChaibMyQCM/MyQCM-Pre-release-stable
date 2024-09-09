"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { useLocale } from "next-intl";
import Loading from "../Loading";
import BaseUrl from "../BaseUrl";
import { toast } from "react-toastify";

const AuthProfile = (Component) => {
  const AuthenticatedComponent = (props) => {
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
          setAuthLoading(false)
          setAuth(true);
        } catch (error) {
          if (error.status == 400 && error.response.data.message == "Email not verified") {
            setAuthLoading(false);
            router.push(`/${locale}/signup/verification`);
            toast.error("Verify your email");
          } else {
            setAuthLoading(false);
            setAuth(true);
          }
        }
      }
    };

    useEffect(() => {
      checkAuth();
    }, []);

    if (authLoading) return <Loading />;
    if (auth) return <Component {...props} />;
    return null;
  };

  AuthenticatedComponent.displayName = `AuthProfile(${
    Component.displayName || Component.name || "Component"
  })`;

  return AuthenticatedComponent;
};

export default AuthProfile;