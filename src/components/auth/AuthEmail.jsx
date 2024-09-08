"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { useLocale } from "next-intl";
import Loading from "../Loading";
import { toast } from "react-toastify";

const AuthEmail = (Component) => {
  const AuthenticatedComponent = (props) => {
    const router = useRouter();
    const locale = useLocale();
    const [auth, setAuth] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        if (secureLocalStorage.getItem("token")) {
          setAuth(true);
        } else {
          router.push(`/${locale}/login`);
          toast.error("You need to login");
        }
        setAuthLoading(false);
      };

      checkAuth();
    }, [locale, router]);

    if (authLoading) return <Loading />;
    if (auth) return <Component {...props} />;
    return null;
  };

  AuthenticatedComponent.displayName = `AuthEmail(${
    Component.displayName || Component.name || "Component"
  })`;

  return AuthenticatedComponent;
};

export default AuthEmail;